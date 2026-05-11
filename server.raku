use Cro::HTTP::Router;
use Cro::HTTP::Server;
use Cro::HTTP::Router::WebSocket;
use Cro::HTTP::Client;
use JSON::Fast;
use Digest::SHA1::Native;
use DBIish;
use lib 'lib';
use GrammarEngine;

sub log-msg($msg) { $*ERR.say($msg); $*ERR.flush; }

# SQLite grammar snapshot store
my $db-path = %*ENV<GRAMMAR_SNAPSHOTS_DB> // 'grammar-snapshots.sqlite3';
my $dbh = DBIish.connect('SQLite', :database($db-path));
$dbh.do(q:to/SCHEMA/);
    CREATE TABLE IF NOT EXISTS grammar_snapshots (
        id            TEXT PRIMARY KEY,
        grammar_code  TEXT NOT NULL DEFAULT '',
        string_input  TEXT NOT NULL DEFAULT '',
        actions_code  TEXT NOT NULL DEFAULT '',
        state         TEXT NOT NULL DEFAULT ''
    )
    SCHEMA
log-msg "Grammar snapshot DB: $db-path";

sub compute-snapshot-id(Str $grammar, Str $string, Str $actions = '', Str $state = '') {
    sha1-hex($grammar ~ "\0" ~ $string ~ "\0" ~ $actions ~ "\0" ~ $state)
}

my constant WORKER-URL    = %*ENV<GRAMMAR_WORKER_URL>  // 'http://localhost:9000';
my constant CACHE-MAX     = 20;
my @cache-keys;
my %result-cache;

sub cache-key(Str $grammar, Str $string, Str $actions = '') {
    $grammar.subst(/\s+/, ' ').trim ~ "\0" ~ $string ~ "\0" ~ $actions
}

sub delegate-grammar(Str $grammar, Str $string, Str $actions = '') {
    my $key = cache-key($grammar, $string, $actions);
    if %result-cache{$key}:exists {
        log-msg "delegate: cache HIT";
        return %result-cache{$key};
    }

    log-msg "delegate: sending to {WORKER-URL}/eval (grammar={$grammar.chars}c string={$string.chars}c actions={$actions.chars}c)";
    my %body = :$grammar, :$string;
    %body<actions> = $actions if $actions;
    my $resp = await Cro::HTTP::Client.post(
        WORKER-URL ~ '/eval',
        content-type => 'application/json',
        body => to-json(%body),
    );
    log-msg "delegate: response received";
    my $body = await $resp.body-text;
    my %result = from-json($body);
    %result-cache{$key} = %result;
    @cache-keys.push: $key;
    if @cache-keys > CACHE-MAX {
        %result-cache{@cache-keys.shift}:delete;
    }
    return %result;
    CATCH {
        default {
            log-msg "delegate: error - {.Str}";
            my %error = %( error => 'Grammar execution timed out' );
            %result-cache{$key} = %error;
            return %error;
        }
    }
}

my $api-routes = route {
    # Store a grammar snapshot
    post -> '_store' {
        my $body-text = await request.body-text;
        my %data = from-json($body-text);
        my $grammar   = %data<grammar_code>  // '';
        my $string    = %data<string_input>  // '';
        my $actions   = %data<actions_code>  // '';
        my $state     = %data<state>         // '';
        my $id = compute-snapshot-id($grammar, $string, $actions, $state);
        my ($exists) = $dbh.execute('SELECT 1 FROM grammar_snapshots WHERE id = ?', $id).row;
        unless $exists {
            $dbh.execute(
                'INSERT INTO grammar_snapshots (id, grammar_code, string_input, actions_code, state) VALUES (?, ?, ?, ?, ?)',
                $id, $grammar, $string, $actions, $state
            );
            log-msg "store: created snapshot $id";
        }
        content 'application/json', to-json({ id => $id });
        CATCH {
            default {
                log-msg "store: error - {.Str}";
                content 'application/json', to-json({ error => .Str });
            }
        }
    }

    # Retrieve a grammar snapshot
    get -> '_store', $id {
        my $sth = $dbh.execute('SELECT grammar_code, string_input, actions_code, state FROM grammar_snapshots WHERE id = ?', $id);
        my @row = $sth.row;
        if @row {
            my ($grammar_code, $string_input, $actions_code, $state) = @row;
            my %snap = %(:$grammar_code, :$string_input, :$actions_code);
            %snap<state> = $state if $state;
            content 'application/json', to-json(%snap);
        } else {
            not-found;
        }
    }
}

my $ws-routes = route {
    get -> 'ws' {
        web-socket -> $messages {
            supply {
                whenever $messages -> $msg {
                    my $text = await $msg.body-text;
                    log-msg "server: received WS message ({$text.chars}c)";
                    my %data = from-json($text);
                    my $actions = %data<actions> // '';
                    my %resp = delegate-grammar(%data<grammar> // '', %data<string> // '', $actions);
                    log-msg "server: sending response to browser";
                    emit to-json(%resp);
                }
            }
        }
    }
}

my $app = route {
    include $api-routes;
    include $ws-routes;

    # Root path: serve index.html
    get -> {
        my $html = slurp($*PROGRAM.parent.child('index.html'));
        content 'text/html', $html;
    }

    # SHA1 path: serve index.html so the frontend can load the snapshot
    get -> Str $id where /:i ^ <[0..9a..f]> ** 40 $/ {
        my $html = slurp($*PROGRAM.parent.child('index.html'));
        content 'text/html', $html;
    }

    # Static JS files
    get -> 'js', *@path {
        static 'js', @path;
    }
}

my $server = Cro::HTTP::Server.new(
    :host('0.0.0.0'),
    :port(%*ENV<PORT> // 3001),
    :application($app)
);

$server.start;
say "Grammar Editor ready at http://localhost:" ~ (%*ENV<PORT> // 3001);
react whenever signal(SIGINT) {
    $server.stop;
    exit;
}
