## ADDED Requirements

### Requirement: Four-panel layout

The UI SHALL display four panels. On screens wider than 768px, the layout SHALL be a left-half/right-half layout with the grammar editor and input string on the left (top/bottom) and trace and match on the right (left/right). On screens 768px or narrower, the panels SHALL stack vertically in a single column in this order: grammar editor, input string, trace, match. Each panel SHALL have a minimum height of 200px on narrow screens.

#### Scenario: Layout renders correctly on load

- **WHEN** the page loads on a screen wider than 768px
- **THEN** four panels are visible in the left-half/right-half layout
- **AND** the grammar editor and input string panels share the left half equally (top/bottom)
- **AND** the trace and match panels share the right half equally (left/right)
- **AND** the trace and match panels have the same height

#### Scenario: Layout stacks on narrow screens

- **WHEN** the page loads on a screen 768px or narrower
- **THEN** the four panels stack vertically in a single column
- **AND** each panel has a minimum height of 200px
- **AND** the page is vertically scrollable

### Requirement: Rainbow syntax highlighting

The grammar editor textarea SHALL use the Rainbow JS library to apply Raku syntax highlighting in real time. Highlighting SHALL update as the user types.

#### Scenario: Grammar code is highlighted

- **WHEN** the user types valid Raku grammar code into the editor
- **THEN** tokens (keywords, regex atoms, rule names) are rendered in distinct colors via Rainbow

### Requirement: WebSocket communication

The UI SHALL establish a WebSocket connection to the backend on page load. It SHALL send the current grammar code and input string to the backend whenever either value changes (debounced by 300ms). It SHALL receive structured trace and match data and re-render the trace and match panels.

#### Scenario: Sends grammar and string on edit

- **WHEN** the user modifies the grammar code or input string
- **THEN** after a 300ms debounce, a WebSocket message with `{grammar, string}` is sent to the backend
- **AND** the frontend waits for a response to update the panels

#### Scenario: WebSocket reconnection

- **WHEN** the WebSocket connection is lost
- **THEN** the client retries connection with exponential backoff (1s, 2s, 4s, max 30s)
- **AND** displays a "Reconnecting..." indicator

### Requirement: Color-coded trace display

The trace panel SHALL render the grammar trace as a nested tree. Each trace node SHALL show the rule name and whether it matched or failed. Matched nodes SHALL have a green indicator; failed nodes SHALL have a red indicator. Each node SHALL be assigned a unique color that is used consistently across trace, string highlight, and match highlight. Node identities SHALL be unique per rendering to ensure sibling nodes with the same rule name receive distinct colors.

#### Scenario: Matched rule shown in green

- **WHEN** the backend returns a trace with a matched rule
- **THEN** that trace node displays a green badge or border

#### Scenario: Failed rule shown in red

- **WHEN** the backend returns a trace with a failed rule
- **THEN** that trace node displays a red badge or border

#### Scenario: Sibling rules with same name have distinct colors
- **WHEN** a trace tree contains multiple sibling nodes with the same rule name (e.g., repeated `<digit>`)
- **THEN** each sibling node SHALL have a different color assigned

### Requirement: String region highlighting on hover

Hovering over a trace node or match node SHALL highlight the corresponding substring in the input string panel, using the same color assigned to that node. The highlight overlay SHALL have an opacity of 0.08 to keep the underlying text readable.

#### Scenario: Trace hover highlights string region

- **WHEN** the user hovers over a trace node
- **THEN** the substring that the rule attempted to match is highlighted with the node's color in the string panel

#### Scenario: Match hover highlights string region

- **WHEN** the user hovers over a match node
- **THEN** the substring that the rule matched is highlighted with the node's color in the string panel

### Requirement: Cross-panel highlighting on hover

Hovering over a match node SHALL highlight the corresponding trace node in the trace panel. Hovering over a trace node SHALL highlight the corresponding match node in the match panel. The highlight uses the same node color at 0.08 opacity. Hovering over either a trace or match node SHALL also highlight the corresponding string region.

#### Scenario: Match hover highlights corresponding trace node
- **WHEN** the user hovers over a match node
- **THEN** the corresponding trace node is highlighted in the trace panel using the same color
- **AND** the corresponding string region is highlighted

#### Scenario: Trace hover highlights corresponding match node
- **WHEN** the user hovers over a trace node
- **THEN** the corresponding match node is highlighted in the match panel using the same color
- **AND** the corresponding string region is highlighted

#### Scenario: Leaving hover clears all highlights
- **WHEN** the user stops hovering over a trace or match node
- **THEN** all highlights in trace, match, and string panels are cleared

### Requirement: Error display

The UI SHALL display grammar compilation errors and runtime errors in an error bar or overlay below the panels.

#### Scenario: Compilation error shown

- **WHEN** the user types invalid Raku grammar code
- **THEN** the error message from the backend is displayed in the error area
