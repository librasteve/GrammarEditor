## Context

The current Grammar Editor requires: a Raku/Cro HTTP+WebSocket server (`server.raku`), a separate grammar-worker process (`grammar-worker.raku`), and the `lib/GrammarEngine.rakumod` module. This three-process architecture (browser → Cro server → worker) adds deployment complexity, especially for users who just want to use the editor.

MemoizedDOM's `gh-pages/` contains `perl6.js` (77MB) — a Raku/Perl 6 runtime compiled to JavaScript via Emscripten — and `webperl.js`, a bridge that loads `<script type="text/perl6">` blocks and executes them in-browser through the compiled runtime. The `todo6.html` demo shows Raku code defining reactive DOM components that run client-side.

## Goals / Non-Goals

**Goals:**
- Eliminate the Raku/Cro backend and grammar-worker entirely
- Grammar compilation, parsing, trace generation, and match extraction run in-browser via `perl6.js` + `webperl.js`
- The resulting app is a single `index.html` with `perl6.js` and `webperl.js` as assets
- All existing panels (Grammar, Actions, String, Trace, Match, Made) work identically
- Shiki-based syntax highlighting remains unchanged

**Non-Goals:**
- Not reducing the size of `perl6.js` (77MB is a known constraint)
- Not changing the highlight implementation (already migrated to Shiki)
- Not supporting offline/air-gapped use (CDN needed for Shiki, though `perl6.js` can be local)
- Not adding PWA or service worker support

## Decisions

1. **`perl6.js` + `webperl.js` as local assets** — Copy from MemoizedDOM's `gh-pages/` into this project. Loaded via `<script>` tags. The 77MB runtime is the cost of running Raku in the browser.

2. **Raku grammar code embedded in `<script type="text/perl6">`** — The grammar evaluation code (compiling the grammar, running the parse, producing trace/match data) is written in Raku and placed in a `<script type="text/perl6">` block. `webperl.js` loads and executes it.

3. **Bridge via window.Peril** — `webperl.js` exposes a `window.Peril` object (or similar) to communicate between JS and Raku. JS sends grammar/string/actions to Raku; Raku returns trace/match/made data via a callback.

4. **Existing UI/panel code unchanged** — The HTML panels, resize handles, toggles, sharing, and save/open remain the same. Only the "send to backend" step changes to "call Raku in-browser".

5. **Removed files** — `server.raku`, `grammar-worker.raku`, `lib/GrammarEngine.rakumod`, `t/server.t` are deleted.

## Risks / Trade-offs

- **[77MB download]** `perl6.js` is very large. Mitigation: cache aggressively via HTTP; users load it once per browser session. Could also serve it from CDN or use progressive loading.
- **[Experimental runtime]** The Raku-in-JS runtime may have bugs or missing features compared to native Rakudo/MoarVM. Mitigation: test thoroughly with real grammars; fall back to custom tokenization if needed.
- **[Startup time]** Loading and initializing the 77MB WASM/JS runtime takes several seconds. Mitigation: show a loading indicator; init the runtime eagerly on page load before user types.
- **[Browser compatibility]** Emscripten-compiled runtimes may not work in all browsers (Safari, older Chrome). Mitigation: test in target browsers; show unsupported message if init fails.
