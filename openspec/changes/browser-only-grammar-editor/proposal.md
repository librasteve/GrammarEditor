## Why

The current Grammar Editor requires a Raku/Cro backend server plus a separate grammar-worker process, making it non-trivial to deploy and share. By running Raku grammar compilation entirely in the browser via MemoizedDOM's `perl6.js` (a Raku/Perl 6 runtime compiled to JavaScript via Emscripten), the editor becomes a single self-contained HTML file that works anywhere — no server needed.

## What Changes

- Replace the Raku/Cro backend and grammar-worker with in-browser Raku execution via `perl6.js` + `webperl.js` from MemoizedDOM
- **BREAKING**: Remove all backend dependencies (`server.raku`, `grammar-worker.raku`, `lib/GrammarEngine.rakumod`, `t/server.t`, WebSocket code, snapshot store)
- Grammar compilation and evaluation happens in the browser via the compiled Raku runtime
- Trace, Match, and Made data are produced by Raku code running in the browser and rendered into the existing UI panels
- The highlight implementation remains as-is (Shiki via esm.sh CDN)
- The app becomes a single `index.html` with `perl6.js` and `webperl.js` as additional script assets

## Capabilities

### New Capabilities

- `in-browser-raku-runtime`: Embed and initialize the `perl6.js` (77MB) compiled Raku runtime in the browser, allowing Raku code (grammar compilation, match execution) to run client-side

### Modified Capabilities

- `grammar-editor-ui`: Remove WebSocket connection, snapshot storage, and backend-dependent UI elements. Add `perl6.js` initialization. Grammar evaluation triggers in-browser Raku execution instead of server round-trip.
- `grammar-engine-api`: Replace HTTP/WebSocket API with a direct in-browser JavaScript API that calls compiled Raku runtime functions
- `grammar-execution-worker`: **REMOVED** — no longer needed; execution happens in-browser

## Impact

- **`index.html`**: Major rewrite — remove WebSocket, snapshot, server-dependent code. Add `perl6.js` and `webperl.js` script tags. Replace `sendGrammar()` with in-browser Raku evaluation. Keep Shiki highlighting and panel layout.
- **`server.raku`**: Removed entirely
- **`grammar-worker.raku`**: Removed entirely
- **`lib/GrammarEngine.rakumod`**: Removed entirely
- **`t/server.t`**: Removed entirely
- **`js/editor.js`**: Updated — remove highlightRaku/RAKU_KEYWORDS (moved to js/highlight.js), add in-browser grammar evaluation logic
- **`t/frontend.test.js`**: Update tests — remove server-dependent tests, add in-browser evaluation tests
- **`package.json`**: No changes (Shiki remains, no new deps)
- `perl6.js` (77MB) and `webperl.js` loaded from the project or copied from MemoizedDOM's `gh-pages/`
