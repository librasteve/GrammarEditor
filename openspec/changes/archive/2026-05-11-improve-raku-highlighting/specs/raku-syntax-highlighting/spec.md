## ADDED Requirements

### Requirement: Raku syntax highlighting via Shiki

The system SHALL provide a `highlightRaku(code)` function that returns highlighted HTML. The implementation SHALL use [Shiki](https://github.com/shikijs/shiki) with its built-in Raku TextMate grammar (`raku`, alias `perl6`). The output SHALL cover all Raku syntax categories relevant to grammar definitions and action classes: keywords, strings, comments, rule names, regex atoms, variables, adverbs, character classes, assertions, types, operators, POD, numbers, builtins, and declarators.

#### Scenario: Empty string returns empty output
- **WHEN** the input code is an empty string
- **THEN** the output is an empty string

#### Scenario: Null/undefined returns empty output
- **WHEN** the input code is null or undefined
- **THEN** the output is an empty string

### Requirement: Variable highlighting

The tokenizer SHALL highlight Raku variables with the `hl-variable` class. This includes scalar variables (`$var`), array variables (`@var`), hash variables (`%var`), subroutine variables (`&var`), and the positional/twigil variants (`$*var`, `$?var`, `$^var`, `$=var`, `$.var`). Positional variables (`$0`, `$1`), the match variable (`$/`), and special variables (`$_`, `$!`, `$~`) SHALL also be highlighted.

#### Scenario: Scalar variable highlighted
- **WHEN** the input contains `$name`
- **THEN** `$name` is wrapped in a `<span class="hl-variable">`

#### Scenario: Array variable highlighted
- **WHEN** the input contains `@items`
- **THEN** `@items` is wrapped in a `<span class="hl-variable">`

#### Scenario: Hash variable highlighted
- **WHEN** the input contains `%data`
- **THEN** `%data` is wrapped in a `<span class="hl-variable">`

#### Scenario: Twigil variable highlighted
- **WHEN** the input contains `$*ENV` or `$?CLASS`
- **THEN** the variable is wrapped in a `<span class="hl-variable">`

#### Scenario: Match variable highlighted
- **WHEN** the input contains `$/` or `$0`
- **THEN** the variable is wrapped in a `<span class="hl-variable">`

### Requirement: Adverb highlighting

The tokenizer SHALL highlight Raku adverbs with the `hl-adverb` class. Adverbs start with `:` followed by a short name (e.g., `:g`, `:i`, `:exhaustive`) or a parenthesized expression (e.g., `:my($x)`, `:32nd`). Adverbs attached to constructs like `s///` or `tr///` are also highlighted.

#### Scenario: Short adverb highlighted
- **WHEN** the input contains `:g` or `:i`
- **THEN** the adverb is wrapped in a `<span class="hl-adverb">`

#### Scenario: Adverb with argument highlighted
- **WHEN** the input contains `:my($x)` or `:32nd`
- **THEN** the adverb is wrapped in a `<span class="hl-adverb">`

### Requirement: Character class highlighting

The tokenizer SHALL highlight Raku character class constructs with the `hl-charclass` class. This includes `<[a-z]>`, `<-[aeiou]>`, `<+(a|b)>`, `<-(c|d)>`, and the `.**` or `.+` extensions.

#### Scenario: Simple character class highlighted
- **WHEN** the input contains `<[a-zA-Z]>`
- **THEN** the construct is wrapped in a `<span class="hl-charclass">`

#### Scenario: Negated character class highlighted
- **WHEN** the input contains `<-[aeiou]>`
- **THEN** the construct is wrapped in a `<span class="hl-charclass">`

### Requirement: Assertion highlighting

The tokenizer SHALL highlight regex assertions with the `hl-assertion` class. This includes `<?before pattern>`, `<!before pattern>`, `<?after pattern>`, `<!after pattern>`, and code assertions `<?{...}>`, `<!{...}>`.

#### Scenario: Lookahead assertion highlighted
- **WHEN** the input contains `<?before \s>`
- **THEN** the construct is wrapped in a `<span class="hl-assertion">`

#### Scenario: Negative assertion highlighted
- **WHEN** the input contains `<!before \n>`
- **THEN** the construct is wrapped in a `<span class="hl-assertion">`

### Requirement: Type name highlighting

The tokenizer SHALL highlight Raku type names with the `hl-type` class. Types are capitalized identifiers (starting with uppercase letter) that appear in signature contexts, `returns` traits, `is` traits, or `of` traits.

#### Scenario: Type in signature highlighted
- **WHEN** the input contains `Str $name` or `Int $count`
- **THEN** `Str` or `Int` is wrapped in a `<span class="hl-type">`

#### Scenario: Type in trait highlighted
- **WHEN** the input contains `returns Str` or `is Int`
- **THEN** the type name is wrapped in a `<span class="hl-type">`

### Requirement: Operator highlighting

The tokenizer SHALL highlight Raku operators with the `hl-operator` class. This includes assignment (`=`), fat arrow (`=>`), smartmatch (`~~`), comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`, `eq`, `ne`, `lt`, `gt`), and other operators (`!`, `~~`, `.`, `+`, `-`).

#### Scenario: Fat arrow highlighted
- **WHEN** the input contains `=>`
- **THEN** `=>` is wrapped in a `<span class="hl-operator">`

#### Scenario: Smartmatch highlighted
- **WHEN** the input contains `~~`
- **THEN** `~~` is wrapped in a `<span class="hl-operator">`

### Requirement: POD documentation highlighting

The tokenizer SHALL highlight POD documentation blocks with the `hl-pod` class. POD begins with `=begin`, `=comment`, `=item`, `=head1`, etc. at the start of a line and continues until `=end` is encountered or a non-POD directive appears.

#### Scenario: Begin/end block highlighted
- **WHEN** the input contains a `=begin` ... `=end` block
- **THEN** the entire block content is wrapped in a `<span class="hl-pod">`

### Requirement: Number literal highlighting

The tokenizer SHALL highlight numeric literals with the `hl-number` class. This includes integers (`42`), hex (`0xFF`), binary (`0b1010`), octal (`0o77`), floats (`3.14`), scientific (`1e10`), and with underscores (`1_000_000`).

#### Scenario: Integer highlighted
- **WHEN** the input contains `42`
- **THEN** `42` is wrapped in a `<span class="hl-number">`

#### Scenario: Hex number highlighted
- **WHEN** the input contains `0xFF`
- **THEN** `0xFF` is wrapped in a `<span class="hl-number">`

### Requirement: Shiki runtime dependency

The implementation SHALL load Shiki at runtime. This SHALL be done via CDN `<script>` tags (using `shiki/core` + Raku grammar) or npm bundling. The Raku grammar SHALL be registered and ready before `highlightRaku()` is called.

#### Scenario: Shiki is loaded on page load
- **WHEN** the page loads
- **THEN** Shiki and the Raku grammar are loaded (either via CDN or bundled script)

### Requirement: Module export

The `highlightRaku` function SHALL be exported from `js/highlight.js` as the default export, allowing it to be imported by `index.html` and `t/frontend.test.js`. The module SHALL internally initialize Shiki with the Raku grammar.

#### Scenario: Function is importable
- **WHEN** `import highlightRaku from '../js/highlight.js'` is used
- **THEN** the function is available and callable

### Requirement: CSS / theme

The highlighted output SHALL be styled via Shiki's theme system. The implementation SHALL use a dark theme matching the Catppuccin Mocha palette, either by using a built-in Shiki dark theme or providing a custom theme. Token categories covered by Shiki's Raku grammar include:

| Token Category | Color | Hex |
|----------------|-------|-----|
| Comment | Overlay0 italic | `#6c7086` |
| String | Green | `#a6e3a1` |
| Keyword | Mauve | `#cba6f7` |
| Built-in | Yellow | `#f9e2af` |
| Type | Blue | `#89b4fa` |
| Number | Peach | `#fab387` |
| Operator | Red | `#f38ba8` |
| Variable | Lavender | `#b4befe` |
| Function / Method | Blue | `#89b4fa` |

#### Scenario: Shiki theme is applied
- **WHEN** the page loads and highlights code
- **THEN** the highlighted output uses the configured dark theme with appropriate colors

### Requirement: Test coverage

The test suite in `t/frontend.test.js` SHALL include tests for the `highlightRaku()` wrapper function. Tests SHALL verify that common Raku constructs produce highlighted HTML with the expected theme tokens. Edge cases (empty input, malformed syntax) SHALL also be tested.

#### Scenario: Tests verify Shiki output
- **WHEN** the test suite runs
- **THEN** there are tests verifying that keywords, strings, comments, variables, and operators produce highlighted output

#### Scenario: Existing API-compatible tests still pass
- **WHEN** the existing tests run with the new wrapper
- **THEN** the function signature and output type remain compatible (tests may need adjusted assertions)
