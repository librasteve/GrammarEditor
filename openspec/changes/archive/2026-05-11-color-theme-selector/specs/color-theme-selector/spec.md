## ADDED Requirements

### Requirement: Theme selector dropdown

The toolbar SHALL contain a `<select>` dropdown labeled "Theme" that lets the user switch between pre-curated color palettes. The dropdown SHALL be placed between the PRO button and the toolbar spacer, styled to match the toolbar button aesthetic. Selecting a theme SHALL immediately apply the new palette and re-render all colored surfaces.

#### Scenario: Theme dropdown visible in toolbar
- **WHEN** the page loads
- **THEN** a "Theme" dropdown is visible in the toolbar
- **AND** it lists 12+ palette options
- **AND** the currently active palette is selected

#### Scenario: Selecting a theme changes colors
- **WHEN** the user selects a different theme from the dropdown
- **THEN** the string panel colors update to the new palette
- **AND** the trace and match panel colors update to the new palette
- **AND** the rule-to-color mapping is reset (rules get reassigned colors from the new palette)

### Requirement: 12+ curated palettes

The dropdown SHALL offer at least 12 pre-curated palettes. Each palette SHALL contain exactly 12 colors suitable for rule matching against a dark background (`#1e1e2e`).

#### Scenario: Default palette loads on page load
- **WHEN** the page loads
- **THEN** the default palette ("Vitesse Dark") is active
- **AND** the dropdown shows "Vitesse Dark" as selected

#### Scenario: Palette registry is extensible
- **WHEN** a new palette entry is added to the registry
- **THEN** it appears in the dropdown automatically
- **AND** no code changes are needed beyond adding the entry
