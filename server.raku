use Cro::HTTP::Router;
use Cro::HTTP::Server;
use Cro::HTTP::Router::WebSocket;
use Cro::HTTP::Client;
use JSON::Fast;
use Digest::SHA1::Native;
use Red:api<2>;
use lib 'lib';
use GrammarEngine;

sub log-msg($msg) { $*ERR.say($msg); $*ERR.flush; }

model GrammarSnapshot is table('grammar_snapshots') {
    has Str $.id            is column{ :primary-key };
    has Str $.grammar_code  is column{ :nullable };
    has Str $.string_input  is column{ :nullable };
    has Str $.actions_code  is column{ :nullable };
    has Str $.state         is column{ :nullable };
}

# SQLite grammar snapshot store
my $db-path = %*ENV<GRAMMAR_SNAPSHOTS_DB> // 'grammar-snapshots.sqlite3';
my $red-db = database 'SQLite', :database($db-path);
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
        my $*RED-DB = $red-db;
        my %data = from-json($body-text);
        my $grammar   = %data<grammar_code>  // '';
        my $string    = %data<string_input>  // '';
        my $actions   = %data<actions_code>  // '';
        my $state     = %data<state>         // '';
        my $id = compute-snapshot-id($grammar, $string, $actions, $state);
        unless GrammarSnapshot.^find(:$id) {
            GrammarSnapshot.^create: |%(
                id           => $id,
                grammar_code => $grammar,
                string_input => $string,
                actions_code => $actions,
                state        => $state,
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
        my $*RED-DB = $red-db;
        with GrammarSnapshot.^find(:$id) -> $snap {
            my %snap = %(
                grammar_code => $snap.grammar_code,
                string_input => $snap.string_input,
                actions_code => $snap.actions_code,
            );
            %snap<state> = $snap.state if $snap.state;
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
    get -> Str $id where /^<[0..9 a..f]>**40$/ {
        my $html = slurp($*PROGRAM.parent.child('index.html'));
        content 'text/html', $html;
    }
}

my $server = Cro::HTTP::Server.new(
    :host('0.0.0.0'),
    :port(3001),
    :application($app)
);

$server.start;
say "Grammar Editor ready at http://localhost:3001";
react whenever signal(SIGINT) {
    $server.stop;
    exit;
}
