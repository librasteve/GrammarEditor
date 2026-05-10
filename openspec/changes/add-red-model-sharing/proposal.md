## Why

The current share feature embeds the full grammar code, string, and actions as base64/gzip query parameters in the URL, making URLs extremely long and unshareable in many contexts (chat apps, email, documentation). A server-side storage model lets us generate short, readable URLs that persist independently of URL length limits.

## What Changes

- Add a **Red model** (Raku ORM, https://github.com/FCO/Red) with **SQLite backend** for storing grammar snapshots on disk
- Database file stored at a configurable path (default: `grammar-snapshots.sqlite3` in the server directory)
- Generate a unique ID via SHA1(grammar_code + string + action_code + state) for each snapshot
- Replace base64/gzip query-param sharing with path-based URLs: `/sha1`
- Add backend HTTP endpoints: POST `/_store` to save a snapshot, GET `/_store/:id` to retrieve one
- Update the frontend share button to POST a snapshot and copy the short URL
- On page load, detect a path segment matching a SHA1 hash and load the snapshot
- **NEW**: Store pane visibility state (which of Trace, Match, Actions, Made panels are visible/hidden) and pane sizes (flex ratios between all resizable panels) alongside editor content in the snapshot
- **NEW**: Restore pane visibility and sizes exactly as saved when loading a snapshot from a SHA1 URL
- **BREAKING**: Old share URLs with `?g=...&s=...` query params will no longer work

## Capabilities

### New Capabilities
- `grammar-snapshot-store`: Server-side persistent storage of grammar snapshots (grammar code, string, actions code, and UI state) using Red ORM with SQLite, keyed by SHA1 hash. Exposes HTTP POST/GET endpoints. Data survives server restarts.

### Modified Capabilities
- `grammar-editor-ui`: The sharing requirement changes from URL-param encoding to server-side storage with path-based URLs. The share flow becomes: capture editor content + pane state → POST snapshot → copy short URL. On load: detect SHA1 path → GET snapshot → fill editors + restore pane state (visibility and sizes).
- `grammar-engine-api`: New HTTP endpoints `POST /_store` and `GET /_store/:id` need to be added to the router, and the WebSocket-only routing needs updating to support these REST endpoints.

## Impact

- `server.raku`: Add Red model class with SQLite driver, SHA1 generation, store/retrieve logic, new HTTP routes, database file initialization
- `index.html`: Rewrite share functions (remove base64 encode/decode, add POST/GET fetch calls), change URL param detection to path detection
- Backend dependencies: Add `Red` and `Digest::SHA1::Native` modules (`zef install Red Digest::SHA1::Native`; Red requires `libpq-dev` system package for the DB::Pg transitive dependency — install via `apt-get install libpq-dev` in Docker or `brew install libpq` on macOS)
- Database file: A new `grammar-snapshots.sqlite3` file will be created in the server directory (path configurable via `GRAMMAR_SNAPSHOTS_DB` environment variable)
- Docker: If deploying via Docker, the database file path should be mounted on a persistent volume so snapshots survive container restarts
- No changes to `js/editor.js` or `lib/GrammarEngine.rakumod`
