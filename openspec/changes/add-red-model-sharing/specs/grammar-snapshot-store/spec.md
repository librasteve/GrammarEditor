## ADDED Requirements

### Requirement: Grammar snapshot Red model

The backend SHALL define a Red model `GrammarSnapshot is table('grammar_snapshots')` with columns:
- `id` (Str, primary key) — the SHA1 hex string
- `grammar_code` (Str) — the grammar source code
- `string_input` (Str) — the test input string
- `actions_code` (Str) — the optional actions class source code
- `state` (Str) — optional JSON string for pane visibility and sizes

The model SHALL use Red's SQLite driver for persistent storage. Red SHALL be initialized at server startup via `database 'SQLite', :database($db-path)`. The Red SQLite driver creates the `.sqlite3` file and the `grammar_snapshots` table automatically on first connection.

#### Scenario: Red model maps to SQLite table
- **WHEN** the server starts and Red initializes with the SQLite driver
- **THEN** a `grammar_snapshots` table is created in the SQLite database
- **AND** the table has columns: `id` (TEXT PRIMARY KEY), `grammar_code` (TEXT), `string_input` (TEXT), `actions_code` (TEXT), `state` (TEXT)

#### Scenario: Snapshot stores all content fields
- **WHEN** a row is inserted with grammar code, input string, and actions code
- **THEN** the row stores all three fields
- **AND** the id is set to the SHA1 hex digest of their concatenation (including state)

#### Scenario: Snapshot stores pane state
- **WHEN** a row is inserted with a `state` JSON string containing pane visibility and sizes
- **THEN** the `state` field SHALL be stored alongside the content fields
- **AND** the id SHALL include the state in its SHA1 computation

### Requirement: SQLite database file location

The SQLite database file SHALL be stored at a configurable path. The default location SHALL be `grammar-snapshots.sqlite3` in the server's working directory. The path SHALL be overridable via the `GRAMMAR_SNAPSHOTS_DB` environment variable.

#### Scenario: Default database file path
- **WHEN** the server starts without the `GRAMMAR_SNAPSHOTS_DB` environment variable
- **THEN** the database file is created at `grammar-snapshots.sqlite3` in the working directory

#### Scenario: Custom database file path via environment variable
- **WHEN** the `GRAMMAR_SNAPSHOTS_DB` environment variable is set to `/data/snapshots.db`
- **THEN** the database file is created at `/data/snapshots.db`

#### Scenario: Database file auto-created
- **WHEN** the server starts and the database file does not exist
- **THEN** Red's SQLite driver creates the file automatically
- **AND** the `grammar_snapshots` table is created

### Requirement: SHA1 content-based addressing

The snapshot id SHALL be computed as the lowercase SHA1 hex digest of the concatenation `grammar_code + "\0" + string_input + "\0" + actions_code + "\0" + state_json`. If two snapshots have identical content AND identical pane state, they SHALL have the same id and the second save SHALL be a no-op (idempotent). The `state_json` SHALL be serialized with lexicographically sorted keys to ensure deterministic hashing. If the `state` field is null or empty, it SHALL be treated as the empty string for SHA1 computation.

#### Scenario: Identical content and state produce same id
- **WHEN** two snapshots with identical grammar, string, actions, and pane state are saved
- **THEN** both save operations return the same id
- **AND** no duplicate row is created (idempotent)

#### Scenario: Different content produces different id
- **WHEN** two snapshots differ in any content field (grammar, string, actions)
- **THEN** they receive different ids

#### Scenario: Different pane state produces different id
- **WHEN** two snapshots have identical content but different pane visibility or sizes
- **THEN** they receive different ids
- **AND** both are stored as separate rows

#### Scenario: Identical content, one with null state
- **WHEN** a snapshot is saved without a `state` field and another is saved with identical content plus a `state` field
- **THEN** they receive different ids (because state was included in the hash)

### Requirement: Snapshot retrieval by id

The backend SHALL support retrieving a snapshot by its SHA1 id using Red's `^find(:$id)` method. If no snapshot exists for the given id, the backend SHALL return a 404 response. When a snapshot exists, the response SHALL include all stored fields including `state`.

#### Scenario: Retrieve existing snapshot with state
- **WHEN** a snapshot with a given id exists and has a `state` field
- **THEN** the backend returns `grammar_code`, `string_input`, `actions_code`, and `state`

#### Scenario: Retrieve existing snapshot without state
- **WHEN** a snapshot with a given id exists but has a null `state` field
- **THEN** the backend returns `grammar_code`, `string_input`, and `actions_code`
- **AND** the `state` field SHALL be absent or null in the response

#### Scenario: Retrieve non-existent snapshot
- **WHEN** a snapshot id does not exist in storage
- **THEN** the backend returns a 404 status

### Requirement: Pane state JSON schema

The `state` field SHALL contain a JSON string with the following structure:

- `panelVisibility`: object with boolean keys `trace`, `match`, `actions`, `made` indicating whether each panel is visible (true) or hidden (false)
- `panelSizes`: object with numeric flex ratio values for each resizable panel boundary:
  - `leftRight`: the flex ratio of the left half (0-1); the right half gets `1 - leftRight`
  - `leftPanels`: object with keys `grammar`, `actions`, `string` — each a flex ratio representing that panel's proportion within the left column
  - `rightPanels`: object with keys `trace`, `match` — each a flex ratio representing that panel's proportion within the right top row
  - `made`: flex ratio of the Made panel within the right column (0-1)

All ratio values SHALL sum to 1 within their respective container. If `actions` is hidden, the `actions` entry in `leftPanels` SHALL be omitted. If only one of `trace`/`match` is visible, the `rightPanels` map SHALL contain only the visible panel's key with value 1.

#### Scenario: State serialized with sorted keys
- **WHEN** the `state` JSON is serialized for SHA1 computation
- **THEN** object keys SHALL be sorted lexicographically
- **AND** the JSON SHALL NOT contain whitespace or newlines

#### Scenario: Default state on absent field
- **WHEN** a snapshot is loaded with a null or missing `state` field
- **THEN** the frontend SHALL fall back to the default layout (all four panels visible, equal flex ratios)

### Requirement: SQLite persistent storage via Red ORM

Snapshots SHALL be stored in a SQLite database file on disk via Red. Snapshots SHALL persist across server restarts. The server SHALL initialize Red with the SQLite driver at startup; Red creates the database file if it does not exist.

#### Scenario: Snapshots survive restart
- **WHEN** the server is stopped and restarted
- **THEN** previously stored snapshots are retrievable via their SHA1 ids

#### Scenario: Database file location is configurable
- **WHEN** the `GRAMMAR_SNAPSHOTS_DB` environment variable is set
- **THEN** Red's SQLite driver uses the specified path for the database file
- **WHEN** the environment variable is not set
- **THEN** Red's SQLite driver defaults to `grammar-snapshots.sqlite3` in the working directory

### Requirement: Docker volume support

When deploying in a containerized environment (Docker), the database file path SHALL be configurable via `GRAMMAR_SNAPSHOTS_DB` so it can be mapped to a persistent Docker volume. The default path `grammar-snapshots.sqlite3` SHALL be relative to the working directory inside the container; operators SHOULD mount a volume at the configured path.

#### Scenario: Docker volume mapped for persistence
- **WHEN** a Docker container is run with `-v /host/data:/app/data -e GRAMMAR_SNAPSHOTS_DB=/app/data/snapshots.db`
- **THEN** the database file is created at `/app/data/snapshots.db` inside the container
- **AND** the data persists across container restarts and re-creations
