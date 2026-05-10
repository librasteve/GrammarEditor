## Why

The Grammar Editor supports interactive grammar development with trace and match visualization, but has no support for Raku actions classes. Actions classes let users attach semantic actions to grammar rules via the `:actions` parameter to `.parse()`, building ASTs or other data structures with `.made`. Adding an actions pane lets users write and test actions classes interactively alongside their grammar.

## What Changes

- Add a new **Actions** panel in the right column (1/4 of right-half area, below Trace and Match)
- The Actions pane is hidden by default and can be toggled via a panel toggle in the toolbar
- The Actions pane contains a code editor for writing a Raku class definition (the actions class)
- When the Actions code is non-empty, the backend passes it as `:actions` parameter to `$grammar.parse($string, :$actions)`
- The backend returns the `.made` value of the top-level match in the response
- The `.made` result is presented to the user — either as a replacement of the Match output, or as a new dedicated output area (approach TBD, see design phase with PM input)
- The existing Match pane behavior is preserved when no actions class is provided

## Capabilities

### New Capabilities
- `actions-pane`: New UI panel for writing and editing Raku actions class code, with hidden-by-default toggle
- `actions-evaluation`: Backend support for compiling and passing an actions class to `$grammar.parse(..., :$actions)`, returning `.made` values

### Modified Capabilities
- (none — all existing capabilities remain unchanged)

## Impact

- `index.html`: New Actions panel DOM, CSS layout, toggle control, code editor, and response rendering for `.made` values
- `server.raku`: Add WS message handling for actions code field
- `lib/GrammarEngine.rakumod`: Extend `process-grammar()` to accept actions class, pass `:actions` to `.parse()`, serialize `.made` in response
- `js/editor.js`: Update `sendGrammar()`, `handleResponse()` to include actions code and `.made` rendering
