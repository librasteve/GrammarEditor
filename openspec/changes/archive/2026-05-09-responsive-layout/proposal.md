## Why

The editor is laid out in a 2-column grid with four panels that works well on desktop, but on mobile (≤768px width) the panels become unusably small. The editor cannot be used on phones or small tablets.

## What Changes

- Add responsive CSS media queries that switch to a single-column stacked layout below 768px
- Each panel gets a reasonable minimum height on mobile so editors are usable
- Grammar and string panels remain editable at reduced width
- Trace and match panels remain scrollable and readable
- No changes to the JS logic, WebSocket, or backend

## Capabilities

### New Capabilities
- `responsive-layout`: Responsive layout that adapts from 2-column desktop layout to single-column mobile layout at 768px breakpoint

### Modified Capabilities
- `grammar-editor-ui`: The "Four-panel layout" requirement is updated to specify responsive behavior

## Impact

- Only `index.html` (CSS) needs changes
- No JS, backend, or test changes needed
- No new dependencies
