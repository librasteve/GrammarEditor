## 1. Consolidate palette into single source

- [x] 1.1 Add `PALETTE_REGISTRY` and `setActivePalette()`/`getActivePalette()` to `js/editor.js`
- [x] 1.2 Populate registry with 12+ curated palettes
- [x] 1.3 Remove duplicate `STRING_COLOR_PALETTE` from `index.html`, reference registry instead

## 2. Add theme dropdown to toolbar

- [x] 2.1 Add `<select>` element in toolbar between PRO and spacer
- [x] 2.2 Style dropdown to match toolbar button aesthetic
- [x] 2.3 Wire change handler to call `setActivePalette()`, `updateHighlight()`, and `sendGrammar()`

## 3. Integrate Shiki theme switching

- [x] 3.1 Load all Shiki themes upfront in `highlight.js`
- [x] 3.2 Add `setShikiTheme()` / `getShikiTheme()` exports to `highlight.js`
- [x] 3.3 Map each palette entry to a Shiki theme name
- [x] 3.4 Wire `setActivePalette()` to also set the Shiki theme
- [x] 3.5 Add `updateHighlight()` call in theme change handler

## 4. Verify

- [x] 4.1 Update tests for new registry structure (`{ shiki, colors }`)
- [x] 4.2 Run full test suite
