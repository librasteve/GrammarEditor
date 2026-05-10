## Why

The trace and match panels take up half the screen on desktop, but users don't always need to see them — especially when editing the grammar or input string. Letting users hide these panels frees up space for editing.

## What Changes

- Add a toggle button (checkbox or clickable icon) to the Trace and Match panel headers
- Clicking hides/shows the corresponding panel
- When a panel is hidden, the remaining panels expand to fill the available space
- Toggle state is tracked in JS and persists across re-renders
- Works on both desktop (panels shrink/grow in the 2-column grid) and mobile (panels appear/disappear in the stack)

## Capabilities

### New Capabilities
- `panel-toggle`: Ability to show/hide the Trace and Match panels via clickable toggles in their headers

### Modified Capabilities
- `grammar-editor-ui`: The "Four-panel layout" requirement is updated to mention that trace and match panels can be toggled

## Impact

- Only `index.html` (CSS + JS) needs changes
- No backend, test, or dependency changes
