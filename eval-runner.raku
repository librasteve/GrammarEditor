use JSON::Fast;
use lib 'lib';
use GrammarEngine;

my ($g-path, $s-path) = @*ARGS;
my $grammar = slurp($g-path);
my $string  = slurp($s-path);
say to-json(process-grammar($grammar, $string));
