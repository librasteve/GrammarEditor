## ADDED Requirements

### Requirement: POST /_store endpoint

The backend SHALL expose an HTTP POST endpoint at `/_store` that accepts a JSON body with `grammar_code`, `string_input`, and optional `actions_code` fields. It SHALL compute the SHA1 hash of their concatenation, store the snapshot, and return `{id: "<sha1>"}`.

#### Scenario: Store snapshot with all fields
- **WHEN** a POST request is sent to `/_store` with `{"grammar_code": "token TOP { ... }", "string_input": "hello", "actions_code": "class MyActions { ... }"}`
- **THEN** the response status is 200
- **AND** the response body contains `{"id": "<40-char hex sha1>"}`
- **AND** the snapshot is stored in memory

#### Scenario: Store snapshot without actions_code
- **WHEN** a POST request is sent to `/_store` with only `grammar_code` and `string_input`
- **THEN** the snapshot is stored with `actions_code` set to empty string
- **AND** a valid id is returned

#### Scenario: Store duplicate content is idempotent
- **WHEN** two identical POST requests are sent to `/_store`
- **THEN** both return the same id
- **AND** only one entry exists in storage

### Requirement: GET /_store/:id endpoint

The backend SHALL expose an HTTP GET endpoint at `/_store/:id` that retrieves a snapshot by its SHA1 id. It SHALL return `{grammar_code, string_input, actions_code}` on success, or 404 if not found.

#### Scenario: Retrieve existing snapshot
- **WHEN** a GET request is sent to `/_store/abc123...` with a valid existing id
- **THEN** the response status is 200
- **AND** the response body contains `grammar_code`, `string_input`, and `actions_code` fields

#### Scenario: Retrieve non-existing snapshot returns 404
- **WHEN** a GET request is sent to `/_store/0000...` (non-existent id)
- **THEN** the response status is 404
- **AND** the response body contains an error message
