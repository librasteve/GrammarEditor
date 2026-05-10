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

### Requirement: WebSocket actions field

The backend SHALL accept a new optional field `actions` in the incoming WebSocket JSON message. The field SHALL contain a string of Raku code representing a complete actions class definition.

#### Scenario: Actions field present
- **WHEN** the server receives `{grammar: "...", string: "...", actions: "class MyActions { method TOP($/) { make ... } }"}`
- **THEN** it SHALL process the actions code along with the grammar and string

#### Scenario: Actions field absent
- **WHEN** the server receives `{grammar: "...", string: "..."}` without an `actions` field
- **THEN** it SHALL behave identically to the current behavior (no actions processing)

### Requirement: Actions class compilation

The backend SHALL compile the actions code by EVALing it directly. If the actions code is invalid, the backend SHALL return a JSON response with an `error` field containing the compilation error message.

#### Scenario: Valid actions code
- **WHEN** the server receives valid actions class code
- **THEN** it SHALL compile the actions class successfully

#### Scenario: Invalid actions code returns error
- **WHEN** the server receives invalid actions class code
- **THEN** it SHALL return `{error: "<compilation error>"}`

### Requirement: Parse with actions

When actions code is provided and successfully compiled, the backend SHALL instantiate the EVAL'd class and pass the resulting actions object as `:$actions` to `$grammar.parse($string, :$actions)`. The existing trace instrumentation SHALL remain active.

#### Scenario: Parse with actions class
- **WHEN** a valid grammar, valid actions class, and string are provided
- **THEN** the backend SHALL call `$grammar.parse($string, :$actions)`
- **AND** SHALL return both trace and match results (unchanged)

### Requirement: .made serialization

When actions are provided and the parse succeeds, the backend SHALL include a `made` field in the JSON response containing the serialized `.made` value of the top-level Match object. The value SHALL be serialized via the `.raku` method for a human-readable representation.

#### Scenario: .made is a string
- **WHEN** the actions class sets `.made` to a string value
- **THEN** the response SHALL include `made: "<string .raku representation>"`

#### Scenario: .made is a number
- **WHEN** the actions class sets `.made` to a numeric value
- **THEN** the response SHALL include `made: <number .raku representation>`

#### Scenario: .made is Nil
- **WHEN** no `.make()` call is made in the actions class
- **THEN** the response SHALL not include a `made` field

### Requirement: .made returned alongside trace and match

The `made` field SHALL be returned alongside the existing `trace` and `match` fields. The `trace` and `match` fields SHALL be present regardless of whether actions are provided.

#### Scenario: Made field alongside trace and match
- **WHEN** actions are provided and the parse succeeds
- **THEN** the response SHALL contain `{trace: {...}, match: {...}, made: "<value>"}`
