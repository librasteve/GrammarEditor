## MODIFIED Requirements

### Requirement: Panel visibility toggle

The trace, match, grammar, and input panels SHALL have a toggle control in their panel header. Clicking the toggle SHALL hide the panel. Clicking again SHALL show it. When a panel is hidden, the remaining panels SHALL expand to fill the freed space.

#### Scenario: Toggle hides trace panel
- **WHEN** the user clicks the toggle on the Trace panel header
- **THEN** the Trace panel becomes hidden
- **AND** the Match panel expands to fill the right-half area

#### Scenario: Toggle shows hidden panel
- **WHEN** the user clicks the toggle on a hidden panel's header
- **THEN** the panel becomes visible again
- **AND** all panels share the available space evenly

#### Scenario: Toggle hides grammar panel
- **WHEN** the user clicks the toggle on the Grammar panel header
- **THEN** the Grammar panel becomes hidden
- **AND** the remaining left-column panels expand to fill the space

#### Scenario: Toggle hides input panel
- **WHEN** the user clicks the toggle on the Input panel header
- **THEN** the Input panel becomes hidden
- **AND** the remaining left-column panels expand to fill the space

## REMOVED Requirements

### Requirement: Right column layout with Made panel

**Reason**: Replaced by generalized layout behavior — all panels now use the same collapsed/flex layout.

**Migration**: No migration needed; the Made panel continues to work via the same `collapsed` class mechanism.

## ADDED Requirements

### Requirement: Resize handles update on grammar/input toggle

The resize handle creation SHALL respond to Grammar and Input panel visibility changes. When either panel is toggled, adjacent resize handles SHALL be shown or hidden accordingly.

#### Scenario: Handle between Grammar and Actions updates on grammar toggle
- **WHEN** the user hides the Grammar panel
- **THEN** the resize handle between Grammar and Actions panels is hidden
- **AND** when the Grammar panel is shown again, the handle reappears

#### Scenario: Handle between Actions and Input updates on input toggle
- **WHEN** the user hides the Input panel
- **THEN** the resize handle between Actions and Input panels is hidden
- **AND** when the Input panel is shown again, the handle reappears
