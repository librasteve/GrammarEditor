## ADDED Requirements

### Requirement: WebSocket endpoint

The backend SHALL expose a WebSocket endpoint at `/ws`. On connection, it SHALL accept JSON messages and respond with JSON messages.

#### Scenario: Successful connection

- **WHEN** a client connects to `/ws`
- **THEN** the connection is accepted
- **AND** the server is ready to receive messages

### Requirement: Grammar compilation and parse

The backend SHALL receive a JSON message with fields `grammar` (string) and `string` (string). It SHALL compile the grammar code by wrapping it in `my grammar MyGrammar { ... }` and EVALing it. It SHALL then parse the input string using the compiled grammar with instrumentation to capture a trace tree.

#### Scenario: Valid grammar and string

- **WHEN** the server receives `{grammar: "token TOP { <digit>+ }", string: "123"}`
- **THEN** it compiles the grammar, parses the string, and returns a response with `trace` and `match` fields

#### Scenario: Compilation error

- **WHEN** the server receives invalid grammar code
- **THEN** it returns a JSON response with an `error` field containing the compilation error message

### Requirement: Trace tree structure

The trace tree SHALL be a nested JSON structure. Each node SHALL contain:
- `rule`: the rule name (string)
- `match`: boolean indicating success/failure
- `data`: the substring that was consumed (string)
- `pos_start`: integer position in the input string where this rule started
- `pos_end`: integer position where it ended (or the current position on failure)
- `children`: array of child trace nodes

#### Scenario: Trace includes position data

- **WHEN** a parse completes
- **THEN** every trace node includes `pos_start` and `pos_end` fields for substring correlation

### Requirement: Match result structure

The match result SHALL be a nested JSON structure mirroring the grammar's match tree. Each node SHALL contain the rule name and the matched substring.

#### Scenario: Match result returned

- **WHEN** a parse succeeds
- **THEN** the response includes a `match` field with the nested match structure

### Requirement: Infinite loop protection

The backend SHALL include a maximum execution limit (1000 recursive calls) to prevent infinite loops. If exceeded, it SHALL return an error.

#### Scenario: Infinite loop detected

- **WHEN** a grammar causes more than 1000 wrapped rule invocations
- **THEN** the server returns a `{error: "Infinite loop"}` response

### Requirement: Execution timeout

The backend SHALL enforce a configurable timeout (default 10 seconds) for grammar evaluation. If the worker does not respond within the timeout, the backend SHALL return a timeout error to the client.

#### Scenario: Grammar execution times out
- **WHEN** a grammar takes longer than the configured timeout to evaluate
- **THEN** the server returns `{"error": "Grammar execution timed out"}`

#### Scenario: Worker unavailable
- **WHEN** the server cannot connect to the grammar worker
- **THEN** the server returns `{"error": "Grammar worker unavailable"}`
