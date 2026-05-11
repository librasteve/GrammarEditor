## Context

The current `highlightRaku()` function in `js/editor.js` (also duplicated inline in `index.html`) is a simple character-by-character tokenizer that recognizes: keywords, strings, comments (`#` and `//`), basic `<foo>` rule calls, rule names, braces, quantifiers (`+`, `*`, `?`) and alternation (`||`, `|`, `&&`, `&`). It does not handle: variables (`$var`, `@var`, `%var`), adverbs (`:g`, `:i`, `:my($x)`), character classes (`<[a-z]>`, `<-[aeiou]>`, `<(a|b)>`), assertions (`<?before>`, `<!after>`, `<?[...]>`), POD blocks (`=begin`, `=end`), type declarations (`Str`, `Int`, `Match`), subroutine/method signatures, or the Raku regex braid.

The editor consists of a grammar panel and an actions panel, both using the same highlighter. Highlighting is rendered by writing HTML into a `<code>` element behind the transparent textarea.

## Goals / Non-Goals

**Goals:**
- Replace `highlightRaku()` with [Shiki](https://github.com/shikijs/shiki), using its built-in Raku TextMate grammar (`@shikijs/langs/raku`). Shiki uses the same grammar engine as VS Code and is actively maintained (13k+ stars, v4.x).
- Add Shiki as a runtime dependency (CDN or bundled)
- Keep the overlay rendering approach (transparent textarea + `<pre><code>` pattern)
- All existing tests must continue to pass; expand test coverage

**Non-Goals:**
- Not building a full Raku parser from scratch — deferring to Shiki's TextMate grammar ecosystem
- Not changing the overlay rendering approach (transparent textarea + `<pre><code>` pattern)
- Not adding language detection or multi-language support beyond Raku

## Decisions

1. **Use Shiki with built-in Raku grammar** — Shiki v4.x bundles `@shikijs/langs/raku` natively (with alias `perl6`). This TextMate grammar is the same one used by VS Code and provides accurate tokenization for Raku keywords, variables, adverbs, character classes, assertions, POD, types, operators, and more.

2. **Runtime integration via CDN or bundled** — Use Shiki's browser-compatible build. In the browser, Shiki can run with `shiki/core` + a bundled Raku grammar, or use the full `shiki` package. The wrapper module will call `codeToHtml(code, { lang: 'raku', theme: '..." })` and extract the inner HTML.

3. **Theme and styling** — Shiki outputs HTML with a `<pre class="shiki"><code>` wrapper and inline-styled spans (or CSS-variable-based themes). We will configure it with a dark theme matching the Catppuccin Mocha palette and extract the `<code>` inner HTML for our overlay.

4. **Module extraction** — A wrapper module `js/highlight.js` will encapsulate the Shiki setup and provide the same `highlightRaku(code)` interface that `index.html` and `js/editor.js` already use. This keeps the API stable regardless of the underlying engine.

5. **Fallback strategy** — If Shiki's Raku grammar has gaps for our specific use case, the wrapper can post-process the HTML to add or correct token classes.

## Risks / Trade-offs

- **[Bundle size]** Shiki is larger than a custom tokenizer (~2MB full, ~200KB core + lang). Mitigation: use the `shiki/core` subset with only the Raku grammar loaded; or use Shiki on the server side and cache results.
- **[CDN dependency]** The editor requires network access to load Shiki on first use. Mitigation: preload and cache aggressively; bundle via npm as a project dependency.
- **[Theme mismatch]** Shiki's built-in themes may not perfectly match Catppuccin Mocha. Mitigation: use a custom Shiki theme or post-process the output colors.
- **[Test compatibility]** Tests need to work against Shiki's output HTML structure. Mitigation: write tests against the `highlightRaku()` wrapper output, isolating tests from Shiki's internal HTML format.
