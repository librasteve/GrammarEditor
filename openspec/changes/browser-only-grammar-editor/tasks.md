## 1. Asset Setup

- [x] 1.1 Copy `perl6.js` and `webperl.js` from MemoizedDOM's `gh-pages/` into this project's root
- [x] 1.2 Add script tags for `perl6.js` and `webperl.js` in `index.html`

## 2. Port GrammarEngine to Browser Raku

- [x] 2.1 Create a `<script type="text/perl6">` block with ported GrammarEngine
- [x] 2.2 Implement `runGrammar()` JS bridge via `Raku.eval()`

## 3. Update index.html UI Logic

- [x] 3.1 Remove WebSocket connection code
- [x] 3.2 Remove snapshot-related code
- [x] 3.3 Replace `sendGrammar()` with in-browser `runGrammar()`
- [x] 3.4 Add runtime loading indicator via state change listener
- [x] 3.5 Error bar shows in-browser errors
- [x] 3.6 URL sharing via base64 fragment (no backend)
- [x] 3.7 Rename `debouncedSend` to `debouncedEval`

## 4. Remove Backend Files

- [x] 4.1 Delete `server.raku`
- [x] 4.2 Delete `grammar-worker.raku`
- [x] 4.3 Delete `lib/GrammarEngine.rakumod`
- [x] 4.4 Delete `t/server.t`
- [x] 4.5 Delete `grammar-snapshots.sqlite3`
- [x] 4.6 Update AGENTS.md

## 5. Update Tests

- [x] 5.1 Remove server-dependent tests
- [x] 5.2 Add in-browser grammar evaluation tests
- [x] 5.3 `npm test` passes (33 tests)

## 6. Verify

- [ ] 6.1 Open `index.html` and verify runtime loads
- [ ] 6.2 Type a grammar and verify Trace/Match populate
- [ ] 6.3 Type invalid grammar and verify error shown
- [ ] 6.4 Test actions code and .made display
- [ ] 6.5 Test URL sharing
- [ ] 6.6 Test on different browser/device
