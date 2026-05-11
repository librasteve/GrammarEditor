## ADDED Requirements

### Requirement: Grammar panel visibility toggle

The Grammar panel header SHALL include a toggle button. Clicking the toggle SHALL hide the panel. Clicking again SHALL show it. When hidden, the remaining left-column panels (Actions, Input) SHALL expand to fill the freed space.

#### Scenario: Toggle hides grammar panel
- **WHEN** the user clicks the toggle button in the Grammar panel header
- **THEN** the Grammar panel becomes hidden
- **AND** the remaining panels in the left column expand to fill the space

#### Scenario: Toggle shows hidden grammar panel
- **WHEN** the user clicks the toggle button on a hidden Grammar panel header
- **THEN** the Grammar panel becomes visible again
- **AND** all left-column panels share the available space

### Requirement: Input panel visibility toggle

The Input panel header SHALL include a toggle button. Clicking the toggle SHALL hide the panel. Clicking again SHALL show it. When hidden, the remaining left-column panels (Grammar, Actions) SHALL expand to fill the freed space.

#### Scenario: Toggle hides input panel
- **WHEN** the user clicks the toggle button in the Input panel header
- **THEN** the Input panel becomes hidden
- **AND** the remaining panels in the left column expand to fill the space

#### Scenario: Toggle shows hidden input panel
- **WHEN** the user clicks the toggle button on a hidden Input panel header
- **THEN** the Input panel becomes visible again
- **AND** all left-column panels share the available space
