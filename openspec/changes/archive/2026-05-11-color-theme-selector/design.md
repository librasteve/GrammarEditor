## Context

The `STRING_COLOR_PALETTE` array is currently defined in two places (`index.html` and `js/editor.js`) as a mutable `const`. Rule colors are assigned round-robin by first-seen order per session via `getRuleColor()`. Switching palettes requires: (1) replacing the array contents, (2) calling `resetColors()` to clear the rule→color mapping, and (3) re-rendering via `sendGrammar()`.

The palette currently has 12 colors from the `vitesse-dark` theme. The goal is to offer 12+ palettes via a dropdown.

## Goals / Non-Goals

**Goals:**
- Add a `<select>` dropdown in the top toolbar offering 12+ curated theme palettes
- Consolidate the duplicated palette array into a single source in `js/editor.js`
- Palettes are named object entries in a registry, each holding a 12-color array
- Selecting a theme immediately swaps the palette, resets colors, and re-renders
- The `getRuleColor` function reads from the active palette array

**Non-Goals:**
- Per-rule color customization (pin a rule to a specific color)
- Inline color picker for individual swatches
- Persisting the selected theme across page reloads

## Decisions

**Decision: Single mutable palette array in editor.js**
The `STRING_COLOR_PALETTE` in `index.html` will be removed. The inline script will reference the editor.js version via a global or by importing. Since `index.html` doesn't use ES modules for its inline script, the simplest approach is to add a getter/setter pattern: `js/editor.js` exports `getActivePalette()` and `setActivePalette(name)`, and the inline script calls these directly. The `getRuleColor` function already reads from `STRING_COLOR_PALETTE` — swapping the array is sufficient.

**Decision: Dropdown in toolbar between PRO and Share**
The `<select>` element will sit between the PRO button and the spacer, matching the toolbar's compact uppercase aesthetic. A `<select>` styled to match `.toolbar-btn` appearance.

**Decision: Registry of palette objects**
A `PALETTE_REGISTRY` object mapping theme names to color arrays. The first entry is the default ("Vitesse Dark"). Each entry has a `name` and `colors` array. This makes adding new themes trivial (one line per theme).

**Decision: 12 colors per palette**
All palettes will have exactly 12 colors to maintain consistent cycling behavior. If a grammar has more than 12 rules, colors wrap around. This is documented in the dropdown label.

## Risks / Trade-offs

- **12-color limit**: Palettes with fewer colors would need padding; palettes with more would be truncated. → Enforce 12 colors per palette entry.
- **Duplicate palette definitions**: Currently in two places. → Consolidate to editor.js, index.html imports/references it.
- **Color contrast**: Some palettes may have low-contrast colors against the dark background. → Vet all palettes against the `#1e1e2e` app background before including.
