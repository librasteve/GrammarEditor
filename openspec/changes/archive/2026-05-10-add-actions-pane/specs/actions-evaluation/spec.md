## ADDED Requirements

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

When actions are provided and the parse succeeds, the backend SHALL include a `made` field in the JSON response containing the serialized `.made` value of the top-level Match object. The serialization SHALL use JSON::Fast's `to-json` to handle any type (scalar, array, hash, or complex object).

#### Scenario: .made is a string
- **WHEN** the actions class sets `.made` to a string value
- **THEN** the response SHALL include `made: "<string value>"`

#### Scenario: .made is a hash/object
- **WHEN** the actions class sets `.made` to a hash
- **THEN** the response SHALL include `made: { ... }` as a JSON object

#### Scenario: .made is Nil
- **WHEN** no `.make()` call is made in the actions class
- **THEN** the response SHALL include `made: null`

### Requirement: .made returned alongside trace and match

The `made` field SHALL be returned alongside the existing `trace` and `match` fields. The `trace` and `match` fields SHALL be present regardless of whether actions are provided.

#### Scenario: Made field alongside trace and match
- **WHEN** actions are provided and the parse succeeds
- **THEN** the response SHALL contain `{trace: {...}, match: {...}, made: <value>}`
