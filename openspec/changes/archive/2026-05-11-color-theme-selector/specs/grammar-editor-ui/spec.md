## MODIFIED Requirements

### Requirement: Color-coded trace display

The trace panel SHALL render the grammar trace as a nested tree. Each trace node SHALL show the rule name and whether it matched or failed. Matched nodes SHALL have a green indicator; failed nodes SHALL have a red indicator. Each node SHALL be assigned a color that is used consistently across trace, string highlight, and match highlight. Colors SHALL be drawn from the currently active theme palette and SHALL update when the user selects a different theme.

#### Scenario: Matched rule shown in green
- **WHEN** the backend returns a trace with a matched rule
- **THEN** that trace node displays a green badge or border

#### Scenario: Failed rule shown in red
- **WHEN** the backend returns a trace with a failed rule
- **THEN** that trace node displays a red badge or border

#### Scenario: Colors update on theme change
- **WHEN** the user selects a new theme from the dropdown
- **THEN** all trace node colors update to the new palette
- **AND** the string panel coloring updates
- **AND** the match panel coloring updates
