## MODIFIED Requirements

### Requirement: Rainbow syntax highlighting

The grammar editor textarea SHALL use a custom Raku syntax highlighter (not Rainbow JS) to apply Raku syntax highlighting in real time. Highlighting SHALL update as the user types. The highlighter SHALL support all token types defined in the `raku-syntax-highlighting` spec.

#### Scenario: Grammar code is highlighted
- **WHEN** the user types valid Raku grammar code into the editor
- **THEN** tokens (keywords, regex atoms, rule names, variables, adverbs, character classes, assertions, operators) are rendered in distinct colors

### Requirement: Actions code editor

The Actions panel SHALL contain a textarea for editing Raku class code. The textarea SHALL have Raku syntax highlighting applied in real time, using the same custom highlighter as the Grammar editor. The textarea SHALL support tab indentation.

#### Scenario: Actions code is highlighted
- **WHEN** the user types valid Raku code into the Actions editor
- **THEN** tokens (keywords, class names, method declarations, variables, types, operators) are rendered in distinct colors
