## MODIFIED Requirements

### Requirement: URL-based sharing of editor state (was: URL-param-based sharing)

The UI SHALL support sharing the current editor state by posting it to the server and generating a short URL based on the returned SHA1 id. The UI SHALL also detect when the page URL contains a SHA1-like path segment and load the corresponding snapshot from the server. The old `?g=...&s=...` query parameters SHALL NOT be supported.

#### Scenario: Share button saves and copies short URL
- **WHEN** the user clicks the Share button
- **THEN** the UI captures the current editor content (grammar code, string, actions code) AND the current pane state (visibility of Trace/Match/Actions/Made panels and flex sizes of all resizable panel boundaries)
- **AND** sends a POST request to `/_store` with `{grammar_code, string_input, actions_code, state}` where `state` is the serialized pane state JSON
- **AND** receives a SHA1 id in response
- **AND** constructs a URL `http://<host>/<sha1>`
- **AND** copies that URL to the clipboard

#### Scenario: Page loads with SHA1 path segment
- **WHEN** the page URL contains a path segment that matches a 40-character hex string (SHA1)
- **THEN** the UI sends a GET request to `/_store/<sha1>`
- **AND** populates the grammar, string, and actions editors with the returned data
- **AND** restores pane visibility to match the `state.panelVisibility` values (hiding/showing Trace, Match, Actions, Made panels accordingly)
- **AND** restores pane sizes to match the `state.panelSizes` values (applying flex ratios to all resizable panel boundaries)
- **AND** triggers syntax highlighting and grammar evaluation

#### Scenario: Page loads with SHA1 path segment that has no state
- **WHEN** the page URL contains a SHA1 path segment and the returned snapshot has no `state` field
- **THEN** the UI populates editors with content
- **AND** uses the default layout (all panels visible, equal flex ratios)
- **AND** auto-shows Actions and Made panels if actions_code is non-empty (backward compatibility with state-less snapshots)

#### Scenario: Page loads without SHA1 path segment
- **WHEN** the page URL does not contain a SHA1 path segment
- **THEN** the editors use their default values

#### Scenario: Invalid SHA1 path segment returns 404
- **WHEN** the page URL contains a 40-char hex path segment that does not exist in storage
- **THEN** the UI displays the default content (as if no path segment was present)

### Requirement: Share button copies URL to clipboard

The UI SHALL have a share button in the toolbar area. When clicked, it SHALL capture the current editor content AND current pane state (visibility and sizes), POST to `/_store`, receive a SHA1 id, construct a short URL, and copy it to the clipboard. The button SHALL provide brief visual feedback.

#### Scenario: Share button saves content and pane state
- **WHEN** the user clicks the share button
- **THEN** a POST request to `/_store` is made with `{grammar_code, string_input, actions_code, state}`
- **AND** `state` contains the current pane visibility and size data
- **AND** the returned SHA1 id is used to construct `http://<host>/<sha1>`
- **AND** the URL is copied to the clipboard
- **AND** the button briefly shows feedback (e.g., "Copied!")

#### Scenario: Share button with default content
- **WHEN** the user clicks the share button with the default grammar and string
- **THEN** the snapshot (including default pane state) is stored and the copied URL contains the SHA1

#### Scenario: Share button after editing
- **WHEN** the user edits the grammar, string, or actions and clicks the share button
- **THEN** a new snapshot with the current content and pane state is stored and the URL reflects the new SHA1

#### Scenario: Share button after panel toggle or resize
- **WHEN** the user hides the Match panel, resizes the left/right divider, then clicks Share
- **THEN** the saved `state.panelVisibility.match` is `false`
- **AND** the saved `state.panelSizes.leftRight` reflects the adjusted ratio
- **AND** opening the shared URL reproduces the same panel configuration

### Requirement: Snapshot loading restores full pane state

When a snapshot with a `state` field is loaded from a SHA1 URL, the UI SHALL restore pane visibility and pane sizes exactly as captured. When a snapshot without a `state` field is loaded, the UI SHALL fall back to legacy behavior (auto-show Actions/Made panels if actions_code is non-empty).

#### Scenario: Snapshot with state restores pane visibility
- **WHEN** a snapshot with `state.panelVisibility = {trace: true, match: false, actions: true, made: false}` is loaded
- **THEN** the Trace panel is visible
- **AND** the Match panel is hidden (collapsed)
- **AND** the Actions panel is visible
- **AND** the Made panel is hidden
- **AND** all panel toggle checkboxes reflect the restored state

#### Scenario: Snapshot with state restores pane sizes
- **WHEN** a snapshot with custom `state.panelSizes` values is loaded
- **THEN** the left/right halves have the saved flex ratio applied
- **AND** the grammar/actions/string panels in the left column have the saved flex ratios applied
- **AND** the trace/match panels in the right top row have the saved flex ratios applied
- **AND** the Made panel has the saved flex ratio applied
- **AND** resize handles are re-created to match the restored layout

#### Scenario: Snapshot without state uses legacy auto-show
- **WHEN** a snapshot without a `state` field but with non-empty actions code is loaded
- **THEN** the Actions and Made panels are shown automatically (backward compatibility)
- **AND** all panels use default equal flex ratios

## REMOVED Requirements

### Requirement: Base64 URL-param sharing

**Reason**: Replaced by server-side snapshot storage with SHA1-based short URLs
**Migration**: Use the new Share button which stores snapshots on the server and copies short URLs. Old `?g=...&s=...` URLs will not work.
