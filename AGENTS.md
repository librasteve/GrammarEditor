# Grammar-Editor

Web-based grammar editor with a JS frontend and a Raku backend.

## Architecture

- **Frontend**: `index.html` — single-file HTML/CSS/JS app. Connects to backend via WebSocket.
- **Backend**: `server.raku` — Raku/Cro WebSocket server. Receives grammar code + input string, returns grammar trace + match results via JSON.
- **Highlighting**: Uses [Shiki](https://shiki.style) with its built-in Raku TextMate grammar (`@shikijs/langs/raku`). Highlighted via `js/highlight.js` which imports Shiki from CDN (esm.sh) or node_modules in tests.

## Setup + commands

### Prerequisites

- [Rakudo](https://raku.org) (Raku compiler)
- [Cro](https://cro.services) — WebSocket HTTP server
  ```bash
  zef install Cro::HTTP Cro::WebSocket JSON::Fast
  ```

### Run

1. **Start the server**:
   ```bash
   raku server.raku
   ```
2. **Open in browser**:
   ```bash
   open http://localhost:3001
   ```

### Usage

- Edit grammar code in the top-left panel (Raku syntax highlighted live)
- Edit the input string in the top-right panel
- Trace and Match panels update automatically (debounced 300ms)
- Hover trace items to see highlighted regions in the string panel
- Ctrl+Enter (or Cmd+Enter) to force re-parse
- Errors appear in a bar at the bottom

### Tests

1. **Run Raku backend tests**:
   ```bash
   raku -I. t/server.t
   ```
2. **Run JS frontend tests**:
   ```bash
   npm test
   ```

## Convention

- Frontend: vanilla HTML/CSS/JS in `index.html`
- Backend: Raku in `server.raku`
- Core logic extracted to `lib/GrammarEngine.rakumod` and `js/editor.js` for testing
- Tests in `t/` directory
- Changes tracked in `openspec/changes/<name>/`


