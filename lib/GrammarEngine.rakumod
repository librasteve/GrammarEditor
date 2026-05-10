use JSON::Fast;

unit module GrammarEngine;

sub process-grammar(Str $code, Str $string, Str $actions?) returns Hash is export {
    CATCH {
        default {
            return %( error => .Str )
        }
    }

    my $grammar = $code.EVAL;

    my $actions-obj;
    if $actions.defined && $actions.trim {
        $actions-obj = $actions.EVAL.new;
    }

    my @methods = $grammar.^methods.grep({ .WHAT ~~ Regex });
    my $count = 0;
    for @methods -> &rule {
        &rule.wrap: my method {
            die "Infinite loop" if $count++ > 1_000;
            my @parent := @*CHILDREN;
            {
                my %node;
                my @*CHILDREN := %node<children> = [];
                my \resp = callsame;
                %node<rule>      = &rule.name;
                %node<match>     = ?resp;
                %node<pos_start> = resp.from;
                if resp {
                    %node<data>    = resp.Str;
                    %node<pos_end> = resp.to;
                } else {
                    %node<data>    = resp.orig.substr(resp.from, 1);
                    %node<pos_end> = resp.from;
                }
                @parent.push: %node;
                return resp
            }
        }
    }

    my %result;
    with $string {
        my @*CHILDREN := my @children;
        my $match = $actions-obj.defined
            ?? $grammar.parse($string, :actions($actions-obj))
            !! $grammar.parse($string);
        with @children.head -> %tree {
            %tree<match> = False unless $match;
            %result<trace> = %tree;
        }
        if $match {
            %result<match> = serialize-match($match);
            my $made = $match.made;
            %result<made> = $made.raku if $made.defined;
        }
    }

    return %result;
}

sub serialize-match(Match $m, Str :$rule-name = 'TOP') is export {
    my %node = :rule($rule-name), :data($m.Str), :pos_start($m.from), :pos_end($m.to);
    my @children;
    if $m.hash -> %h {
        for %h.kv -> $name, $val {
            my @subs = $val ~~ List ?? $val.list !! ($val,);
            for @subs -> $sub {
                @children.push: serialize-match($sub, :rule-name($name));
            }
        }
    }
    if $m.list -> @l {
        for @l.kv -> $i, $sub {
            @children.push: serialize-match($sub, :rule-name(~$i));
        }
    }
    %node<children> = @children if @children;
    return %node;
}
