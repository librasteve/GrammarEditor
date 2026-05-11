## Why

The current Raku syntax highlighter is a hand-written tokenizer that only covers basic patterns: keywords, strings, comments, braces, quantifiers, and alternation. It fails to highlight many Raku-specific constructs including variables (`$`, `@`, `%` sigils), adverbs, character classes (`<[...]>`), assertions (`<?before>`, `<!after>`), proto/regex/method tokens, POD documentation, and action method signatures. This makes the editor harder to use for anyone writing real Raku grammars.

## What Changes

- Replace the current inline `highlightRaku()` function with [Shiki](https://github.com/shikijs/shiki), a TextMate-grammar-based highlighter that includes Raku natively (`@shikijs/langs/raku`) and is actively maintained (13k+ stars)
- Add Shiki as a runtime dependency (loaded via CDN or bundled), leveraging its Raku TextMate grammar for accurate, VS Code-quality highlighting
- Update tests to verify highlighting works through the new engine

## Capabilities

### New Capabilities

- `raku-syntax-highlighting`: A standalone Raku syntax highlighter supporting keywords, variables, strings, comments, POD, regex/grammar tokens, character classes, assertions, adverbs, and operators.

### Modified Capabilities

- `grammar-editor-ui`: The editor panels for grammar code and actions code will use the new highlighter, adding more color-coded token classes for a richer highlighting experience.

## Impact

- **`index.html`**: The inline `highlightRaku()` function will be extracted to the module; CSS classes for new token types will be added
- **`js/editor.js`**: The exported `highlightRaku()` function will be replaced with a more complete implementation
- **`t/frontend.test.js`**: Tests will be updated/expanded to cover new token types; existing tests must continue to pass
- Shiki (`shiki`) added as a runtime dependency (loaded via npm or CDN)
