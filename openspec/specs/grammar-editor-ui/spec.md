## ADDED Requirements

### Requirement: Four-panel layout

The UI SHALL display four panels. On screens wider than 768px, the layout SHALL be a left-half/right-half layout with the grammar editor and input string on the left (top/bottom) and trace and match on the right (left/right). On screens 768px or narrower, the panels SHALL stack vertically in a single column in this order: grammar editor, input string, trace, match. Each panel SHALL have a minimum height of 200px on narrow screens. The trace and match panels SHALL each have a visible toggle in their header that lets users hide or show the panel. When hidden, the remaining panels SHALL expand to fill the available space. The grammar and string panel headers SHALL include save and open buttons.

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

### Requirement: Panel visibility toggle

The trace and match panels SHALL have a toggle control in their panel header. Clicking the toggle SHALL hide the panel. Clicking again SHALL show it. When a panel is hidden, the remaining panels SHALL expand to fill the freed space.

#### Scenario: Toggle hides trace panel
- **WHEN** the user clicks the toggle on the Trace panel header
- **THEN** the Trace panel becomes hidden
- **AND** the Match panel expands to fill the right-half area

#### Scenario: Toggle shows hidden panel
- **WHEN** the user clicks the toggle on a hidden panel's header
- **THEN** the panel becomes visible again
- **AND** all panels share the available space evenly

### Requirement: Error display

The UI SHALL display grammar compilation errors and runtime errors in an error bar or overlay below the panels.

#### Scenario: Compilation error shown

- **WHEN** the user types invalid Raku grammar code
- **THEN** the error message from the backend is displayed in the error area

### Requirement: Save grammar and string to file

The grammar panel SHALL have a save button that downloads the grammar code as a `.raku` file. The string panel SHALL have a save button that downloads the string content as a `.txt` file.

#### Scenario: Save grammar button downloads .raku file
- **WHEN** the user clicks the save button in the grammar panel header
- **THEN** a file download is triggered with the grammar code content
- **AND** the file extension is `.raku`

#### Scenario: Save string button downloads .txt file
- **WHEN** the user clicks the save button in the string panel header
- **THEN** a file download is triggered with the string content
- **AND** the file extension is `.txt`

### Requirement: Open file into grammar or string

The grammar panel SHALL have an open button that opens a file picker for `.raku` files and loads the content into the grammar editor. The string panel SHALL have an open button that opens a file picker for `.txt` files and loads the content into the string editor.

#### Scenario: Open grammar loads .raku file
- **WHEN** the user clicks the open button in the grammar panel header and selects a `.raku` file
- **THEN** the file content replaces the grammar editor content

#### Scenario: Open string loads .txt file
- **WHEN** the user clicks the open button in the string panel header and selects a `.txt` file
- **THEN** the file content replaces the string editor content

### Requirement: URL-based sharing of editor state

The UI SHALL support encoding the current grammar code and input string as base64 query parameters (`g` and `s`) in the page URL. On page load, if these parameters are present, the editors SHALL be populated with the decoded values. A share button SHALL generate and copy such a URL.

#### Scenario: Page loads with grammar parameter
- **WHEN** the page URL contains a `g` query parameter with a base64-encoded grammar
- **THEN** the grammar editor SHALL contain the decoded grammar code
- **AND** syntax highlighting SHALL be applied

#### Scenario: Page loads with string parameter
- **WHEN** the page URL contains an `s` query parameter with a base64-encoded string
- **THEN** the string editor SHALL contain the decoded string

#### Scenario: Page loads with both parameters
- **WHEN** the page URL contains both `g` and `s` query parameters with base64-encoded values
- **THEN** both editors SHALL be populated with the decoded content
- **AND** the grammar SHALL be sent to the backend for evaluation

#### Scenario: Page loads without parameters
- **WHEN** the page URL contains neither `g` nor `s` query parameters
- **THEN** the editors SHALL use their default values

### Requirement: Share button copies URL to clipboard

The UI SHALL have a share button in the toolbar area. When clicked, it SHALL generate a URL containing the current grammar and string as base64-encoded query parameters and copy it to the clipboard. The button SHALL provide brief visual feedback.

#### Scenario: Share button copies URL
- **WHEN** the user clicks the share button
- **THEN** a URL with base64-encoded `g` and `s` query parameters is copied to the clipboard
- **AND** the button briefly shows feedback (e.g., "Copied!")

#### Scenario: Share button with default content
- **WHEN** the user clicks the share button with the default grammar and string
- **THEN** the copied URL contains the default content encoded as base64

#### Scenario: Share button after editing
- **WHEN** the user edits the grammar or string and clicks the share button
- **THEN** the copied URL reflects the current editor content

### Requirement: Actions editor panel

The UI SHALL display an Actions editor panel on the left column, positioned between the Grammar editor and the String editor. The Actions editor SHALL be a code editor textarea with Raku syntax highlighting, matching the style of the Grammar editor. The Actions editor SHALL be hidden by default (collapsed toggle).

#### Scenario: Actions panel hidden on load
- **WHEN** the page loads
- **THEN** the Actions panel is collapsed (hidden)
- **AND** the Grammar and String panels fill the left column

### Requirement: Actions panel toggle

The panel toggles bar SHALL include an Actions toggle. When the toggle is clicked, the Actions panel SHALL show or hide. When shown, the Grammar, Actions, and String panels SHALL share the left column equally (1/3 each).

#### Scenario: Toggle shows actions panel
- **WHEN** the user clicks the Actions toggle
- **THEN** the Actions panel becomes visible between Grammar and String
- **AND** the three left-column panels share the available space equally

#### Scenario: Toggle hides actions panel
- **WHEN** the user clicks the Actions toggle on a visible panel
- **THEN** the Actions panel becomes collapsed
- **AND** the Grammar and String panels fill the left column

### Requirement: Actions code editor

The Actions panel SHALL contain a textarea for editing Raku class code. The textarea SHALL have Raku syntax highlighting applied in real time, using the same custom highlighter as the Grammar editor. The textarea SHALL support tab indentation.

#### Scenario: Actions code is highlighted
- **WHEN** the user types valid Raku code into the Actions editor
- **THEN** tokens (keywords, class names, method declarations) are rendered in distinct colors

### Requirement: Actions code sent to backend

The UI SHALL include the actions code in the WebSocket message sent to the backend whenever the actions code, grammar code, or input string changes (debounced by 300ms). The WebSocket message SHALL include a new field `actions` containing the actions class code.

#### Scenario: Actions code sent on edit
- **WHEN** the user modifies the actions code
- **THEN** after a 300ms debounce, a WebSocket message with `{grammar, string, actions}` is sent to the backend

#### Scenario: Actions code empty sends null
- **WHEN** the actions code is empty
- **THEN** the `actions` field in the WebSocket message is `null` or empty string

### Requirement: Made panel

The UI SHALL display a Made panel in the right column, positioned below the Trace and Match panels as a full-width row. The Made panel SHALL be hidden by default (collapsed toggle). When visible, the right column SHALL split into two rows: top row (Trace | Match, 50/50) and bottom row (Made, full width).

#### Scenario: Made panel hidden on load
- **WHEN** the page loads
- **THEN** the Made panel is collapsed (hidden)
- **AND** the right column appears identical to the current layout

#### Scenario: Made panel shown via toggle
- **WHEN** the user clicks the Made toggle
- **THEN** the Made panel becomes visible below Trace and Match
- **AND** the right column shows Trace | Match in the top half, Made in the bottom half

### Requirement: Made panel toggle

The panel toggles bar SHALL include a Made toggle alongside Trace and Match toggles.

#### Scenario: Toggle shows made panel
- **WHEN** the user clicks the Made toggle when it is unchecked
- **THEN** the Made panel becomes visible

#### Scenario: Toggle hides made panel
- **WHEN** the user clicks the Made toggle when it is checked
- **THEN** the Made panel becomes hidden

### Requirement: Made value display

The Made panel SHALL display the `.made` value of the top-level match as a `.raku` string representation. If `.made` is not present, the panel SHALL display nothing. The Made panel SHALL update automatically when the backend returns a new response (debounced same as Trace/Match).

#### Scenario: Made value is displayed as .raku string
- **WHEN** the backend returns a response with a `made` field containing a `.raku` representation
- **THEN** the Made panel SHALL display the string directly in a styled code block

#### Scenario: No made value
- **WHEN** the backend returns a response without a `made` field
- **THEN** the Made panel SHALL be empty

### Requirement: Right column layout with Made panel

When the Made panel is visible, the right column SHALL use a nested flex layout: top row (flex-direction: row) with Trace and Match panels, bottom row with Made panel (full width, flex: 0 0 25% of right column height).

#### Scenario: Right column layout with made visible
- **WHEN** Trace, Match, and Made are all visible
- **THEN** Trace and Match share the top row equally
- **AND** Made occupies the bottom 1/4 of the right column

#### Scenario: Right column layout with made hidden
- **WHEN** Made is hidden but Trace and Match are visible
- **THEN** Trace and Match fill the right column in the existing layout
