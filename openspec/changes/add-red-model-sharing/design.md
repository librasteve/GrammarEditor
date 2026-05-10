## Context

The current sharing system encodes grammar code, input string, and actions code as base64/gzip query parameters (`?g=...&s=...&a=...`). This produces very long URLs (often thousands of characters) that cannot be shared in many messaging apps, email clients, or documentation. The grammar content is also limited by URL length restrictions (~2KB in some browsers/proxies). A server-side storage model solves both problems by generating short, permanent URLs.

The backend currently uses Cro::HTTP with only a WebSocket route at `/ws` and a catch-all GET for `index.html`. We need to add REST-style endpoints for storing and retrieving grammar snapshots.

An initial in-memory approach was tried (plain Raku hash) but snapshots are lost on server restart. Users who share URLs during a session expect them to work after a restart — the editor is a development tool used iteratively. **Red ORM** (https://github.com/FCO/Red, https://fco.github.io/Red/) with the SQLite driver provides persistent storage with a native Raku ORM. The SQLite database file lives on disk in the project directory and survives restarts.

An initial attempt at using Red failed because the native PostgreSQL `pq` library binding was unavailable on the development machine. A temporary DBIish implementation was used during that period. With the project now containerized in Docker (rakudo-star, Debian-based), `libpq-dev` is installed via `apt-get`, which satisfies the transitive dependency and allows Red to install cleanly. The code has been switched back to Red.

## Goals / Non-Goals

**Goals:**
- Store grammar snapshots (grammar code + string + actions code) keyed by SHA1 hash of their concatenation
- Store pane visibility state (which of Trace, Match, Actions, Made panels are visible/hidden) and pane sizes (flex ratios for all resizable panel boundaries) alongside editor content in snapshots
- **Persist snapshots across server restarts using a SQLite database file via Red ORM**
- Provide `POST /_store` to save a snapshot and return its SHA1 ID
- Provide `GET /_store/:id` to retrieve a snapshot
- Replace frontend share flow: capture editor content + pane state → POST snapshot → get short URL → copy to clipboard
- Detect SHA1 path segments on page load → fetch snapshot → populate editors and restore pane state exactly
- Remove the base64 query-parameter sharing mechanism
- Add `Red` (with SQLite driver) and `Digest::SHA1::Native` dependencies to the project
- Support a configurable database file path via environment variable (default: `grammar-snapshots.sqlite3`)

**Non-Goals:**
- Authentication, rate limiting, or access control
- Garbage collection or expiration of old snapshots
- Support for the old `?g=...&s=...` share URLs (breaking change)
- Changes to the grammar evaluation pipeline, WebSocket protocol, or trace/match rendering
- Responsive adaptation of loaded pane state (state is restored as-is; if saved on a wide screen and loaded on a narrow screen, the layout may need manual adjustment — acceptable for a development tool)
- Migration of in-memory snapshots to SQLite (all existing snapshots are ephemeral — no migration needed)

## Decisions

- **Red ORM with SQLite over in-memory hash**: The `%grammar-snapshots` hash loses data on restart. Red with the SQLite driver provides a Raku-native ORM that writes to a `.sqlite3` file on disk, survives restarts, and uses Red's model DSL for typed column definitions. Red requires `libpq-dev` as a transitive dependency — installed via `apt-get` in the Docker image.

- **Design Decision: Red model for schema definition, not CRUD convenience**: Red's model DSL (`model ... is table(...) { has ... is column{...} }`) provides self-documenting schema definitions. The model class defines all columns with their types and constraints in one place. Red's `^find` and `^create` methods replace raw SQL for the simple CRUD operations needed.

- **SQLite file path convention**: The database file defaults to `grammar-snapshots.sqlite3` in the server's working directory. Overridable via `GRAMMAR_SNAPSHOTS_DB` environment variable for flexibility (e.g., `/data/snapshots.db` in Docker). The `.sqlite3` extension follows SQLite convention.

- **SHA1 over UUID or sequential ID**: SHA1 provides content-addressable storage: identical snapshots produce identical URLs, avoiding duplicates. The snapshot is uniquely identified by its content, not by insertion order. SHA1 gives a compact 40-char hex string suitable for URLs.

- **Path-based `/sha1` over query params**: More readable, cleaner, and not subject to URL length limits. The server can match SHA1-like path segments directly.

- **Separate `/_store` prefix**: Keeps snapshot API routes isolated from the main app. The leading underscore is a convention that minimizes collision risk with grammar-related paths.

- **Remove old base64 URLs entirely**: Maintaining backward compatibility for `?g=...&s=...` would add complexity and the old URLs are already unwieldy. This is a clean break.

- **Frontend uses `fetch` for store/load over WebSocket**: Store/load are request-response operations that don't benefit from WebSocket. Standard HTTP fetch is simpler and works immediately without connection setup.

- **Pane state stored as JSON `state` field in snapshot model**: The snapshot model gains a `state` column (JSON text string) that stores pane visibility (booleans for Trace, Match, Actions, Made) and pane sizes (flex ratios for all resizable panel boundaries: left/right halves, grammar/actions/string panels, trace/match columns, top-row/made rows). Storing as a serialized JSON blob keeps the model flexible for future additions without schema migrations.

- **Pane state included in SHA1 content addressing**: The SHA1 hash is computed from `grammar_code + "\0" + string_input + "\0" + actions_code + "\0" + state_json`. This means saving with different layout preferences produces different URLs, ensuring exact reproduction when loading. The state JSON is serialized with sorted keys to guarantee deterministic hashing.

- **Default state assumed when `state` field is absent**: Snapshots created before this change (or via the current change without state, if the backend encounters a null state) degrade gracefully — the default layout (all four panels with default toggles and flex ratios) is used. This ensures forward/backward compatibility.

- **Red's `$*RED-DB` dynamic variable**: Red uses the dynamic variable `$*RED-DB` for database connection propagation. It is set at the top level and redeclared inside route handler blocks (`my $*RED-DB = $red-db;`) to ensure it's available in Red's model methods called from within Cro's async handlers.

- **Docker volume for persistence in containerized deployment**: When running in a container, the database file path should be on a mounted volume (e.g., `docker run -v /host/path/snapshots:/data -e GRAMMAR_SNAPSHOTS_DB=/data/snapshots.db ...`). This ensures snapshots survive container restarts.

## Risks / Trade-offs

- [Red is experimental (pre-1.0)] → Red v0.2.4 is actively maintained. API is stable for the basic `^find`/`^create` operations used here. If Red becomes unmaintained, migrating to DBIish is straightforward (single table, simple CRUD).
- [Red's `$*RED-DB` dynamic scope] → Cro's async handlers break the dynamic scope chain. Mitigated by explicitly redeclaring `my $*RED-DB = $red-db;` inside each route handler before any Red operations.
- [libpq-dev required as transitive dep] → Red depends on DB::Pg which requires the native `pq` library. Docker image installs `libpq-dev` via apt-get (~15MB). Local development requires `brew install libpq` on macOS or `apt install libpq-dev` on Linux.
- [Old share URLs break] → Announce in release notes. The old URLs were already impractical due to length.
- [SHA1 collision risk] → Negligible for this use case. Even partial collisions won't happen with the small number of snapshots expected.
- [Memory growth from unbounded snapshots] → Mitigated by SQLite on disk — snapshots don't consume server RAM. The database file will grow linearly but each snapshot is a few KB. If needed later, add an LRU eviction or max-count cap.
- [SQLite concurrent write contention] → The server handles one request at a time (single-process Cro), so no concurrent write issues. SQLite's WAL mode could be enabled for future multi-worker scenarios.
- [File permissions for SQLite file] → The server process needs write access to its working directory (or the directory containing the DB file). Container deployments must ensure the volume is writable by the container user.
- [New Raku dependencies] → Requires `zef install Red Digest::SHA1::Native` plus `libpq-dev` system package. Both `Red` and `Digest::SHA1::Native` are well-maintained Raku modules.
- [Loaded pane state may not fit narrow viewports] → If a snapshot was saved on a wide screen with custom panel sizes, loading on a narrow (mobile/768px) screen may result in cramped layout. Acceptable for a development tool; users can readjust. The stacked single-column layout at ≤768px overrides flex settings anyway.
