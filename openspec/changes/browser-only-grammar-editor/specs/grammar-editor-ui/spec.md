## MODIFIED Requirements

### Requirement: Four-panel layout

The UI SHALL display the same four-panel layout (Grammar, String, Trace, Match) plus Actions and Made panels. The layout behavior on desktop and mobile SHALL remain unchanged.

#### Scenario: Layout unchanged on load
- **WHEN** the page loads on a screen wider than 768px
- **THEN** four panels are visible in the left-half/right-half layout (unchanged)

### Requirement: WebSocket communication

**Reason**: Replaced by in-browser Raku execution. The WebSocket connection, reconnection logic, debounced send, and status bar indicators for connection state are removed.

**Migration**: Grammar evaluation triggers `Peril.dispatch()` instead of `ws.send()`. The status bar now shows "Ready" or "Loading..." (runtime initialization state) instead of "Connected" / "Reconnecting".

### Requirement: Grammar evaluation on edit

The UI SHALL trigger grammar evaluation (in-browser) whenever the grammar code, actions code, or input string changes (debounced by 300ms). The debounced send function SHALL call the in-browser Raku bridge instead of WebSocket.

#### Scenario: Grammar re-evaluated on edit
- **WHEN** the user modifies the grammar code, actions code, or input string
- **THEN** after a 300ms debounce, the grammar is re-evaluated via the in-browser Raku runtime

#### Scenario: Initial evaluation on load
- **WHEN** the page loads and the Raku runtime is ready
- **THEN** the default grammar and string are evaluated in-browser

### Requirement: Error display

The UI SHALL display grammar compilation errors and runtime errors in the error bar. Errors from the in-browser Raku runtime SHALL use the same display mechanism as before.

#### Scenario: Compilation error shown
- **WHEN** the user types invalid Raku grammar code
- **THEN** the error message from the in-browser runtime is displayed in the error area

### Requirement: URL-based sharing of editor state

The system SHALL support URL-based sharing using LZ-String compression (base64) to encode the grammar, actions, and string into the URL fragment. The backend snapshot store (`/_store` API) is removed.

#### Scenario: Share URL encodes state
- **WHEN** the user clicks the share button
- **THEN** a URL with LZ-String compressed grammar, actions, and string is generated and copied

#### Scenario: Page loads with shared state
- **WHEN** the page URL contains a compressed state fragment
- **THEN** the editors are populated with the decoded content
- **AND** the grammar is evaluated in-browser

### Requirement: Actions panel, Made panel

These panels operate unchanged, but their data source changes from WebSocket responses to in-browser Raku responses.

#### Scenario: Actions code evaluated in-browser
- **WHEN** the user types valid Raku actions code
- **THEN** after the 300ms debounce, the actions code is compiled and evaluated in-browser alongside the grammar

#### Scenario: Made panel populated from in-browser
- **WHEN** actions are provided and the parse succeeds in-browser
- **THEN** the .made value is displayed in the Made panel
