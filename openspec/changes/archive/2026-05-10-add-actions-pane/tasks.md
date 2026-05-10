## 1. Backend: Actions class support in GrammarEngine

- [x] 1.1 In `lib/GrammarEngine.rakumod`, extend `process-grammar()` to accept an optional `$actions` code string parameter
- [x] 1.2 Compile the actions code via `$actions.EVAL` (wrapping in `class { ... }` if needed), catching compilation errors and returning them as `error`
- [x] 1.3 When actions class is compiled, call `$grammar.parse($string, :$actions)` instead of `$grammar.parse($string)`
- [x] 1.4 Serialize the top-level match's `.made` value using `to-json` and include it as a `made` field in the response hash

## 2. Backend: Wire actions through server

- [x] 2.1 In `server.raku`, extract the `actions` field from the incoming WS message alongside `grammar` and `string`
- [x] 2.2 Pass the actions code through `delegate-grammar()` and `process-grammar()` (or update the worker HTTP POST body)
- [x] 2.3 Update the cache key to include actions code so identical grammar+string with different actions are cached separately

## 3. Frontend: Actions panel DOM and layout CSS

- [x] 3.1 Add an Actions panel `<div>` in the HTML between the Grammar and String panels in `#left-half`, with `id="actions-panel"` and class `panel collapsed` (hidden by default)
- [x] 3.2 Add a panel toggle for Actions in `#panel-toggles` bar
- [x] 3.3 Update `#left-half` CSS to support three panels stacking vertically (Grammar → Actions → String)
- [x] 3.4 Update `#panel-toggles` for Actions toggle and Made toggle

## 4. Frontend: Made panel DOM and layout CSS

- [x] 4.1 Wrap the existing Trace+Match panels in a top-row container inside `#right-half`
- [x] 4.2 Add a Made panel `<div>` below the top row in `#right-half`, with `id="made-panel"` and class `panel collapsed` (hidden by default)
- [x] 4.3 Update `#right-half` CSS to support nested flex layout: top row (Trace | Match) and bottom row (Made panel)
- [x] 4.4 Update `updateRightHalf()` to handle the new 3-panel right column layout (Trace, Match, Made) with correct flex behavior when panels are toggled
- [x] 4.5 Update the panel toggle event handlers to include Actions and Made panel toggles

## 5. Frontend: Actions editor and WebSocket integration

- [x] 5.1 Add a textarea for actions code inside the Actions panel, with Raku syntax highlighting (reuse `highlightRaku()`)
- [x] 5.2 Add `input` event listener on the actions textarea to trigger `updateHighlight()` and `debouncedSend()`
- [x] 5.3 Update `sendGrammar()` to include `actions` field in the WS message (null when empty)
- [x] 5.4 Update `handleResponse()` to accept `made` field and call a new `renderMade()` function
- [x] 5.5 Add tab key handling for the actions textarea (same as Grammar editor)

## 6. Frontend: Made rendering

- [x] 6.1 Implement `renderMade(made)` function that pretty-prints `.made` as JSON using `JSON.stringify(made, null, 2)` into a `<pre><code>` block inside `#made-body`
- [x] 6.2 Display "null" in gray when `.made` is `null` or absent
- [x] 6.3 Add `clearMade()` function and call it in error handling

## 7. Tests and verification

- [x] 7.1 Update `t/server.t` with test cases for actions class compilation and `.made` return
- [x] 7.2 Update `js/editor.js` with renderMade/clearMade + frontend tests
- [ ] 7.3 Manual verification: start server, toggle Actions panel, enter actions code, verify `.made` appears in Made panel
- [ ] 7.4 Manual verification: verify backward compatibility (no actions code → existing behavior unchanged)
- [ ] 7.5 Manual verification: verify Made panel toggle show/hide works correctly
