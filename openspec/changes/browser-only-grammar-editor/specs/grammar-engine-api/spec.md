## MODIFIED Requirements

### Requirement: WebSocket endpoint

**Reason**: Replaced by in-browser Raku execution
**Migration**: Grammar evaluation now happens in-browser. The `sendGrammar()` function is replaced with a call to `Peril.dispatch()` or the equivalent bridge. All WebSocket-related code (`connectWS`, `scheduleReconnect`, `sendMessage`, `debouncedSend`, `ws` variable) is removed.

### Requirement: Grammar compilation and parse

The system SHALL compile and evaluate grammar code entirely in-browser using the embedded Raku runtime. On any change to grammar, actions, or string input (debounced 300ms), the system SHALL pass the current code to the Raku runtime for compilation and parsing.

#### Scenario: Grammar evaluated on input change
- **WHEN** the user modifies grammar code, actions code, or the string input
- **THEN** after a 300ms debounce, the grammar is compiled and parsed in-browser

#### Scenario: Compilation error shown
- **WHEN** grammar compilation fails in-browser
- **THEN** the error message is displayed in the error bar

### Requirement: Infinite loop protection

The Raku runtime SHALL enforce an execution limit to prevent infinite loops during grammar evaluation.

#### Scenario: Infinite loop detected
- **WHEN** a grammar causes excessive recursive calls
- **THEN** execution is terminated and an error is displayed

### Requirement: .made serialization

When actions are provided and the parse succeeds, the Raku runtime SHALL return the `.made` value of the top-level Match object, serialized via the `.raku` method.

#### Scenario: .made value returned
- **WHEN** actions are provided and the parse succeeds
- **THEN** the `.made` value is returned alongside trace and match
