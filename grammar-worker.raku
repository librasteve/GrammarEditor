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
            request-body -> (:$grammar, :$string, :$actions?) {
                my $g = $grammar // '';
                my $s = $string // '';
                my $a = $actions // '';
                log-msg "worker: received eval (grammar={$g.chars}c string={$s.chars}c actions={$a.chars}c)";

                my $tag = $*PID ~ '-' ~ (10_000_000..99_999_999).pick;
                my $g-path = "/tmp/grammar-$tag";
                my $s-path = "/tmp/string-$tag";
                my $a-path = "/tmp/actions-$tag";
                spurt($g-path, $g);
                spurt($s-path, $s);
                my @args = 'raku', '-Ilib', 'eval-runner.raku', $g-path, $s-path;
                if $a {
                    spurt($a-path, $a);
                    @args.push: $a-path;
                }

                my $proc = Proc::Async.new(
                    :out, :err,
                    |@args,
                );

                my $output = '';
                my $err-buf = '';
                $proc.stdout.tap(-> $v { $output ~= $v });
                $proc.stderr.tap(-> $v { $err-buf ~= $v });

                my $started = $proc.start;
                await Promise.anyof($started, Promise.in($timeout));

                unlink($g-path, $s-path);
                unlink($a-path) if $a-path.IO.e;

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
