use Cro::HTTP::Router;
use Cro::HTTP::Server;
use JSON::Fast;
use lib 'lib';

sub log-msg($msg) { $*ERR.say($msg); $*ERR.flush; }

sub MAIN(:$port = 9000) {
    my $timeout = (%*ENV<GRAMMAR_WORKER_TIMEOUT> // 5).Int;

    my $app = route {
        get -> 'health' {
            content 'application/json', to-json({ status => 'ok' });
        }

        post -> 'eval' {
            request-body -> (:$grammar, :$string) {
                my $g = $grammar // '';
                my $s = $string // '';
                log-msg "worker: received eval (grammar={$g.chars}c string={$s.chars}c)";

                my $tag = $*PID ~ '-' ~ (10_000_000..99_999_999).pick;
                my $g-path = "/tmp/grammar-$tag";
                my $s-path = "/tmp/string-$tag";
                spurt($g-path, $g);
                spurt($s-path, $s);

                my $proc = Proc::Async.new(
                    :out, :err,
                    'raku', '-Ilib', 'eval-runner.raku', $g-path, $s-path,
                );

                my $output = '';
                my $err-buf = '';
                $proc.stdout.tap(-> $v { $output ~= $v });
                $proc.stderr.tap(-> $v { $err-buf ~= $v });

                my $started = $proc.start;
                await Promise.anyof($started, Promise.in($timeout));

                unlink($g-path, $s-path);

                if $started.status ~~ Kept {
                    log-msg "worker: eval completed (output={$output.chars}c)";
                    content 'application/json', $output;
                } else {
                    log-msg "worker: TIMEOUT — killing subprocess";
                    $proc.kill;
                    content 'application/json', to-json(%( error => 'Grammar execution timed out' ));
                }

                if $err-buf {
                    log-msg "worker: subprocess stderr: $err-buf";
                }
                CATCH {
                    default {
                        log-msg "worker: UNCAUGHT ERROR: {$!.Str}";
                        my $json = to-json(%( error => $!.Str ));
                        content 'application/json', $json;
                    }
                }
            }
        }
    }

    my $server = Cro::HTTP::Server.new(
        :host('0.0.0.0'),
        :$port,
        :application($app)
    );

    $server.start;
    log-msg "Grammar worker ready on port $port (timeout: {$timeout}s)";
    react whenever signal(SIGINT) {
        $server.stop;
        exit;
    }
}
