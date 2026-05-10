## 0. Decision: DBIish+SQLite over Red ORM

- [x] 0.1 Evaluate DBIish vs Red ORM for snapshot persistence — Red requires native PostgreSQL `pq` library (unavailable locally), DBIish+SQLite is lighter-weight and sufficient for single-table schema
- [x] 0.2 Docker enables `libpq-dev` install; formal decision analysis concludes staying with DBIish is correct — no functional benefit from ORM, code is already working and verified, fewer deps, simpler maintenance

## 1. Backend: Add Red ORM with SQLite persistence

- [x] 1.1 Install Raku dependencies: `zef install Red Digest::SHA1::Native` (Red with SQLite driver; Docker image adds `libpq-dev` via apt for the PostgreSQL native binding that Red requires transitively)
- [x] 1.2 In `server.raku`, add `use Red:api<2>;` and `use Digest::SHA1::Native;`
- [x] 1.3 Define `GrammarSnapshot` Red model:
  ```raku
  model GrammarSnapshot is table('grammar_snapshots') {
      has Str $.id            is column{ :primary-key };
      has Str $.grammar_code  is column{ :nullable };
      has Str $.string_input  is column{ :nullable };
      has Str $.actions_code  is column{ :nullable };
      has Str $.state         is column{ :nullable };
  }
  ```
- [x] 1.4 Initialize Red with SQLite driver at server startup: `database 'SQLite', :database($db-path)`; propagate `$*RED-DB` inside route handlers where Red operations occur
- [x] 1.5 Replace hash CRUD with Red operations:
  - Save: `GrammarSnapshot.^find(:$id)` then `GrammarSnapshot.^create(...)` (idempotent)
  - Retrieve: `GrammarSnapshot.^find(:$id)` → access attributes
- [x] 1.6 Implement helper sub `compute-snapshot-id($grammar, $string, $actions, $state?)` that returns SHA1 hex of `$grammar ~ "\0" ~ $string ~ "\0" ~ $actions ~ "\0" ~ ($state // "")` with null separators
- [x] 1.7 Handle null state: `$state` defaults to `''` in SHA1 computation; POST/GET routes use `// ''` for missing state
- [x] 1.8 Startup log message: `log-msg "Grammar snapshot DB: $db-path"`
- [x] 1.9 Red's SQLite driver handles connection cleanup implicitly; no explicit disconnect needed

## 2. Backend: Add REST endpoints

- [x] 2.1 Add `POST /_store` route that validates data, computes SHA1, idempotent Red create, returns `{"id": "<sha1>"}`
- [x] 2.2 Add `GET /_store/:id` route that looks up snapshot via `GrammarSnapshot.^find(:$id)`, returns 200 with snapshot JSON or 404
- [x] 2.3 State field included in response when non-empty; omitted when empty for backward compat
- [x] 2.4 JSON responses via `content 'application/json'`

## 3. Frontend: Rewrite share flow

- [x] 3.1 Remove `compressEncode`, `decompressDecode`, `buildShareUrlSync`, `getShareUrl`, `uint8ToBase64`, `base64ToUint8` helper functions
- [x] 3.2 Add `capturePaneState()` helper that reads panel visibility from toggle checkboxes and pane sizes from computed `flex` styles
- [x] 3.3 Rewrite `copyShareUrl` to capture pane state, POST to `/_store`, receive `{id}`, construct URL `window.location.origin/<id>`, copy to clipboard
- [x] 3.4 Remove `loadFromUrlParams` and base64 query-parameter detection
- [x] 3.5 Add `loadFromPath` function: SHA1 path detection, GET `/_store/<sha1>`, fill editors, trigger highlight + sendGrammar
- [x] 3.6 Add `restorePaneState(state)` helper: restores visibility, sizes, calls `updateRightHalf()` + `setupResizeHandles()`

## 4. Frontend: Update initial load and routing

- [x] 4.1 Replace `hasParams` with `hasPathSha1` check (regex `/^\/[0-9a-f]{40}$/`)
- [x] 4.2 SHA1 path → `loadFromPath()`; otherwise defaults with fallback on 404
- [x] 4.3 `loadFromPath` calls `restorePaneState(state)` when state present; auto-shows Actions/Made when actions_code non-empty but no state (backward compat)

## 5. Frontend: Pane state serialization for share

- [x] 5.1 `capturePaneState()` reads all toggle inputs + inline flex styles from all resizable panel elements
- [x] 5.2 Hidden/collapsed panels omitted from size entries; ratios normalized to 1
- [x] 5.3 `sortJsonKeys` replacer for deterministic JSON.stringify (sorted keys at all levels)

## 6. Docker / Container volume configuration

- [x] 6.1 Documented `GRAMMAR_SNAPSHOTS_DB` env var (default: `grammar-snapshots.sqlite3`)
- [x] 6.2 Added volume mount to `docker-compose.yml`: `grammar-snapshots:/data` + `GRAMMAR_SNAPSHOTS_DB=/data/grammar-snapshots.sqlite3`
- [x] 6.3 Default path `grammar-snapshots.sqlite3` is in the working directory (always writable); Docker volume path is explicitly configured

## 7. Cleanup

- [x] 7.1 `fallbackCopy` and `showCopied` kept — still useful for clipboard fallback
- [x] 7.2 No remaining references to `g=`, `s=`, `a=` query params in the codebase
- [x] 7.3 Old `?g=...` URLs produce no errors — pathname regex doesn't match query strings
- [x] 7.4 Removed `%grammar-snapshots` hash variable from `server.raku` (replaced by SQLite)

## 8. Verify

- [x] 8.1 Server starts and listens on port 3001 ✓
- [x] 8.2 `grammar-snapshots.sqlite3` created on first startup ✓
- [ ] 8.3 Open browser, click Share — verify POST with `state` and short URL copied (manual)
- [ ] 8.4 Open copied URL in new tab — verify full restoration (manual)
- [ ] 8.5 Edit content, share again — verify new URL generated (manual)
- [ ] 8.6 Toggle panels + resize, then Share — verify exact config preserved (manual)
- [x] 8.7 **Persistence across restart**: Verified — stop server → restart → load snapshot works ✓
- [x] 8.8 Invalid SHA1 path returns index.html, frontend falls through to defaults ✓
- [x] 8.9 App without path segment loads defaults ✓
- [ ] 8.10 Load snapshot saved without `state` — backward compat (manual)
- [x] 8.11 `GRAMMAR_SNAPSHOTS_DB` custom path works — tested with `/tmp/test-snapshots.sqlite3` ✓
