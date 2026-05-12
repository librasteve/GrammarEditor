## Why

Users currently have no control over the rule highlight colors. The palette is hardcoded as a single `vitesse-dark`-inspired set. Letting users switch between multiple curated themes lets them personalize the editor and find a color scheme that works best for their eyes and use case.

## What Changes

- Add a `<select>` dropdown in the top toolbar labeled "Theme"
- Populate with 12+ pre-curated color palettes (Vitesse Dark, Github, Ayu Mirage, Monokai, Dracula, Nord, Solarized, One Dark, Catppuccin, Tokyo Night, Gruvbox, Material)
- Selecting a theme immediately swaps `STRING_COLOR_PALETTE`, resets the rule color mapping, and re-renders all colored surfaces (string, trace, match)
- Consolidate the duplicated `STRING_COLOR_PALETTE` definitions into a single source of truth

## Capabilities

### New Capabilities

- `color-theme-selector`: A dropdown in the toolbar that lets users switch between pre-curated color palettes for rule-based highlighting.

### Modified Capabilities

- `grammar-editor-ui`: The color palette requirement is extended to support runtime theme switching via a dropdown selector.

## Impact

- `js/editor.js`: Export `STRING_COLOR_PALETTE` as mutable, add a palette registry with 12+ themes, add `setActivePalette(name)` function
- `index.html`: Add `<select>` dropdown in toolbar, wire change handler, remove inline `STRING_COLOR_PALETTE` duplicate
- `t/frontend.test.js`: Add tests for palette switching
