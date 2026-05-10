use JSON::Fast;
use lib 'lib';
use GrammarEngine;

my ($g-path, $s-path, $a-path) = @*ARGS;
my $grammar = slurp($g-path);
my $string  = slurp($s-path);
my $actions = $a-path && $a-path.IO.e ?? slurp($a-path) !! '';
say to-json(process-grammar($grammar, $string, $actions));
