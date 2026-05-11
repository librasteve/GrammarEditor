## Why

The Grammar and Input panels are always visible, taking up fixed space even when the user doesn't need them. Adding visibility toggles for these panels lets users focus on the panels they care about (e.g., full-width trace/match view, or maximizing the grammar editor).

## What Changes

- Add a visibility toggle control in the Grammar panel header (eye icon, matching existing pattern)
- Add a visibility toggle control in the Input panel header (eye icon, matching existing pattern)
- When Grammar panel is hidden, the remaining left-column panels (Actions, Input) expand to fill the space
- When Input panel is hidden, the remaining left-column panels (Grammar, Actions) expand to fill the space
- The panel toggles bar (toolbar) remains unchanged — toggles are in the panel headers themselves
- Resize handles update when Grammar or Input panels are toggled
- Collapsed state is captured in the share URL and restored on load

## Capabilities

### New Capabilities

- `hideable-grammar-input`: Toggle visibility of the Grammar editor and Input string panels, allowing users to hide either panel and have remaining panels fill the freed space.

### Modified Capabilities

- `grammar-editor-ui`: The "Panel visibility toggle" requirement is extended to include Grammar and Input panels. The "Resize handle creation" requirement is modified so resize handles adjacent to Grammar/Input panels respond to their visibility state.

## Impact

- `index.html`: Add toggle buttons to Grammar and Input panel headers; minor CSS adjustments
- `js/editor.js`: No changes needed (toggle logic is in the inline script)
- Panel toggle state captured in share URL (`capturePaneState` already iterates over `panel-toggle` data attributes)
