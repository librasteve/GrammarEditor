## Context

The Grammar Editor currently has a two-column layout: left column stacks Grammar (top) and String (bottom) editors; right column stacks Trace (left) and Match (right) outputs. The backend compiles a grammar and parses the input string, returning trace and match trees. There is no support for Raku actions classes, which allow users to attach semantic actions to grammar rules via `:actions` parameter and produce computed values via `.make()`/`.made()`.

## Goals / Non-Goals

**Goals:**
- Add an Actions editor on the left column (between Grammar and String) for writing a Raku actions class
- Add a "Made" output panel below Trace+Match in the right column to display the `.made` value
- Both new panels are hidden by default and toggleable via the panel toggles bar
- Backend compiles the actions class and passes it as `:$actions` to `$grammar.parse()`
- Backend returns `.made` value serialized as JSON in the response
- The existing Match pane continues to show the parse tree regardless of actions presence

**Non-Goals:**
- No changes to the WebSocket protocol structure beyond adding optional `actions` field
- No changes to the existing Trace or Match rendering
- No support for inline `.made` display per match node
- No changes to the URL sharing mechanism (actions code not included in share URL)

## Decisions

### Layout: Actions editor on left column, Made panel on right column

The left column becomes a 3-stack: Grammar → Actions → String. The right column becomes a 2-stack: top row (Trace | Match), bottom row (Made full-width).

**Rationale:** The data flow is Grammar + Actions + String → Parse → Trace + Match + Made. Inputs stack on the left, outputs stack on the right, matching the existing visual pattern and user expectations.

### Made panel below Trace+Match as a new full-width row

**Rationale (per PM analysis):** A separate Made panel gives simultaneous visibility of Trace (debug parse), Match (see structure), and Made (see computed result). This is critical for debugging ("my `.made` is wrong — let me check the tree"). No scroll coupling between tree and result. Backward compatible: when toggled off, right column is identical to today.

### .made rendered as pretty-printed JSON

**Rationale:** `.made` can return any type (scalar, array, hash, complex object). JSON is the most universal representation. Using `JSON.stringify(data, null, 2)` handles all types and is already available in the browser.

### Backend passes actions class via EVAL and :actions parameter

**Rationale:** Same pattern as the existing grammar compilation — the actions code is a bare class body that gets compiled with a wrapper. This keeps the implementation simple and consistent.

### Right column layout uses nested flex

The right column becomes `flex-direction: column` with two rows:
- Top row: `flex-direction: row` — Trace | Match (existing 50/50 split)
- Bottom row: Made panel (full width, collapsed by default)

When Made is collapsed, the top row fills the full height (no layout change from today).

## Risks / Trade-offs

- **Vertical scroll on right column**: When both Trace and Made are visible, the right column may scroll vertically if content is tall. Mitigation: Made panel shows a compact JSON blob, typically smaller than a deep trace tree, so this rarely occurs.
- **Actions class compilation errors**: If actions code is invalid, existing error handling catches it and shows the error. The Made panel shows nothing/placeholder.
- **Actions class without .make()**: If the user provides an actions class but no `.make()` call, `.made` returns `Nil`. The Made panel shows `null` in gray, which is clear and unambiguous.

## Open Questions

- Should the Actions editor have syntax highlighting similar to the Grammar editor? Currently the highlighting is custom; reusing it for actions code is straightforward since both are Raku.
