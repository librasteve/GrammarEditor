## MODIFIED Requirements

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
