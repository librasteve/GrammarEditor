use Test;
use lib 'lib';
use GrammarEngine;

plan 11;

subtest 'Actions class: .made value returned as .raku string' => {
    my $grammar = q:to/END/;
        unit grammar TestGrammar1;
        token TOP { <digit>+ }
        END
    my $actions = q:to/END/;
        class TestActions1 {
            method TOP($/) { make +$/.Str }
        }
        END
    my %result = process-grammar($grammar, '42', $actions);
    ok %result<made>:exists, 'made field present';
    is %result<made>, '42', 'integer .raku has no quotes';
    ok %result<trace>:exists, 'trace still present with actions';
    ok %result<match>:exists, 'match still present with actions';
}

subtest 'Actions class: .made is absent when no make() call' => {
    my $grammar = q:to/END/;
        unit grammar TestGrammar2;
        token TOP { <digit>+ }
        END
    my $actions = q:to/END/;
        class NoopActions2 {
            method TOP($/) { }
        }
        END
    my %result = process-grammar($grammar, '42', $actions);
    nok %result<made>:exists, 'no made field when no make() call';
    ok %result<match>:exists, 'match still present';
}

subtest 'Actions class: invalid actions code returns error' => {
    my $grammar = q:to/END/;
        unit grammar TestGrammar3;
        token TOP { <digit>+ }
        END
    my $actions = q:to/END/;
        class BrokenActions3 {
            method TOP($/) { $¢ø }
        }
        END
    my %result = process-grammar($grammar, '42', $actions);
    ok %result<error>:exists, 'error field present for invalid actions';
}

subtest 'Actions class: no actions behaves same as before' => {
    my $grammar = q:to/END/;
        unit grammar TestGrammar4;
        token TOP { <digit>+ }
        END
    my %result = process-grammar($grammar, '42');
    ok %result<trace>:exists, 'trace present without actions';
    ok %result<match>:exists, 'match present without actions';
    nok %result<made>:exists, 'no made field when actions not provided';
}

subtest 'Valid grammar compiles and parses' => {
    my %result = process-grammar('token TOP { <digit>+ }', '123');
    ok %result<trace>:exists, 'trace field present';
    ok %result<match>:exists, 'match field present';
    ok %result<trace><rule>:exists, 'trace has rule name';
    ok %result<trace><match>, 'trace shows match success';
    is %result<match><data>, '123', 'match data is full string';
}

subtest 'Compilation error returns error' => {
    my %result = process-grammar('token TOP { <unclosed', '');
    ok %result<error>:exists, 'error field present';
    ok %result<error>, 'error message is non-empty';
}

subtest 'Infinite loop protection' => {
    my %result = process-grammar('token TOP { <TOP> }', 'x');
    ok %result<error>:exists, 'error field present';
    like %result<error>, /:i infinite/, 'error mentions infinite loop';
}

subtest 'Trace nodes have position data' => {
    my %result = process-grammar('token TOP { <digit>+ }', '42');
    ok %result<trace>:exists, 'trace present';
    sub check-pos(%node) {
        ok %node<pos_start>:exists, "trace node '%node<rule>' has pos_start";
        ok %node<pos_end>:exists, "trace node '%node<rule>' has pos_end";
        isa-ok %node<pos_start>, Int, "pos_start is integer for '%node<rule>'";
        isa-ok %node<pos_end>, Int, "pos_end is integer for '%node<rule>'";
        if %node<children> {
            for @(%node<children>) -> $child {
                check-pos($child);
            }
        }
    }
    check-pos(%result<trace>);
}

subtest 'Match serialization is correct' => {
    my %result = process-grammar('token TOP { <digit>+ }', '123');
    ok %result<match>:exists, 'match present';
    is %result<match><rule>, 'TOP', 'match root rule is TOP';
    is %result<match><data>, '123', 'match root data is full input';
    ok %result<match><children>:exists, 'match has children';
    ok %result<match><children>.elems > 0, 'match has at least one child';
    is %result<match><children>[0]<rule>, 'digit', 'first child rule is digit';
    is %result<match><children>[0]<data>, '1', 'first child data is first digit';
}

subtest 'Empty grammar handled gracefully' => {
    my %result = process-grammar('', '');
    ok defined(%result), 'result is defined for empty grammar';
}

subtest 'serialize-match produces correct nested structure' => {
    my %result = process-grammar('token TOP { <digit> <digit> }', '42');
    ok %result<match>:exists, 'match present';
    is %result<match><rule>, 'TOP', 'root rule is TOP';
    is %result<match><data>, '42', 'root data is full string';
    ok %result<match><children>:exists, 'TOP has children';
    is %result<match><children>.elems, 2, 'TOP has two children';
    is %result<match><children>[0]<rule>, 'digit', 'first child rule is digit';
    is %result<match><children>[0]<data>, '4', 'first child data is first digit';
    is %result<match><children>[1]<rule>, 'digit', 'second child rule is digit';
    is %result<match><children>[1]<data>, '2', 'second child data is second digit';
}
