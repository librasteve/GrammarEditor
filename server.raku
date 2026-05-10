use Cro::HTTP::Router;
use Cro::HTTP::Server;
use Cro::HTTP::Router::WebSocket;
use Cro::HTTP::Client;
use JSON::Fast;
use lib 'lib';
use GrammarEngine;

sub log-msg($msg) { $*ERR.say($msg); $*ERR.flush; }

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

my $app = route {
    get -> {
        my $path = $*PROGRAM.parent.child('index.html');
        my $html = slurp($path);
        content 'text/html', $html;
    }

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
