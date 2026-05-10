## MODIFIED Requirements

### Requirement: Four-panel layout

The UI SHALL display four panels. On screens wider than 768px, the layout SHALL be a left-half/right-half layout with the grammar editor and input string on the left (top/bottom) and trace and match on the right (left/right). On screens 768px or narrower, the panels SHALL stack vertically in a single column in this order: grammar editor, input string, trace, match. Each panel SHALL have a minimum height of 200px on narrow screens. The trace and match panels SHALL each have a visible toggle in their header that lets users hide or show the panel. When hidden, the remaining panels SHALL expand to fill the available space. The grammar and string panel headers SHALL include save and open buttons.

## ADDED Requirements

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
