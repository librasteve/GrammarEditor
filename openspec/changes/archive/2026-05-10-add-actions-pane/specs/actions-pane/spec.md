## ADDED Requirements

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

The Made panel SHALL display the `.made` value of the top-level match as pretty-printed JSON. If `.made` is `Nil`, the panel SHALL display "null" in gray. The Made panel SHALL update automatically when the backend returns a new response (debounced same as Trace/Match).

#### Scenario: Made value is rendered as JSON
- **WHEN** the backend returns a response with a `made` field
- **THEN** the Made panel SHALL display `JSON.stringify(made, null, 2)` in a styled code block

#### Scenario: Made value is null
- **WHEN** the backend returns a response with `made: null`
- **THEN** the Made panel SHALL display "null" in gray

#### Scenario: No actions class provided
- **WHEN** no actions class is provided and no `made` field is returned
- **THEN** the Made panel SHALL display "null" or a placeholder in gray

### Requirement: Right column layout with Made panel

When the Made panel is visible, the right column SHALL use a nested flex layout: top row (flex-direction: row) with Trace and Match panels, bottom row with Made panel (full width, flex: 0 0 25% of right column height).

#### Scenario: Right column layout with made visible
- **WHEN** Trace, Match, and Made are all visible
- **THEN** Trace and Match share the top row equally
- **AND** Made occupies the bottom 1/4 of the right column

#### Scenario: Right column layout with made hidden
- **WHEN** Made is hidden but Trace and Match are visible
- **THEN** Trace and Match fill the right column in the existing layout
