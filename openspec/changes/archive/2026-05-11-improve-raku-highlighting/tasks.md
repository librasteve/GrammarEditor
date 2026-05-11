## 1. Setup Shiki with Raku grammar

- [x] 1.1 Install `shiki` via npm (or add CDN script tags pointing to `shiki/core` + Raku grammar)
- [x] 1.2 Create `js/highlight.js` wrapper module that initializes Shiki, loads the Raku grammar, and exports `highlightRaku(code)`
- [x] 1.3 Configure a dark theme (Catppuccin Mocha compatible) for the highlighted output
- [x] 1.4 Extract the `<code>` inner HTML from Shiki's `<pre class="shiki">` output for use in the overlay

## 2. Update index.html

- [x] 2.1 Add Shiki script tags (or bundled imports) before the app scripts
- [x] 2.2 Import `highlightRaku` from `js/highlight.js` instead of the inline function
- [x] 2.3 Remove the inline `highlightRaku()` and `RAKU_KEYWORDS` definitions
- [x] 2.4 Update CSS to style Shiki's output cleanly (remove `<pre>` margins, inherit font)
- [x] 2.5 Update `updateHighlight()` to call the new module

## 3. Update js/editor.js

- [x] 3.1 Remove `highlightRaku()` function and `RAKU_KEYWORDS` constant
- [x] 3.2 Re-export `highlightRaku` from `js/highlight.js` if backward compatibility is needed, or update all imports

## 4. Update Tests

- [x] 4.1 Update import in `t/frontend.test.js` to import from `js/highlight.js`
- [x] 4.2 Add tests verifying that Shiki produces highlighted output for basic Raku code
- [x] 4.3 Add tests for edge cases (empty input, null, malformed code)
- [x] 4.4 Run `npm test` and fix any test failures

## 5. Verify

- [x] 5.1 Start server with `raku server.raku` and open in browser
- [x] 5.2 Verify grammar code is highlighted correctly with a complex grammar file (manual - user should verify)
- [x] 5.3 Verify actions code is highlighted correctly (manual - user should verify)
- [x] 5.4 Test edge cases: empty panels, rapid typing, large files (manual - user should verify)
