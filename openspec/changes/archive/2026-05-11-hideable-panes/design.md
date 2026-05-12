## Context

The Grammar and Input panels currently lack visibility toggles. All other panels (Trace, Match, Actions, Made) have toggle controls either in the panel toggles bar or via the existing toolbar toggle system. Grammar and Input are the only panels that are always visible and cannot be hidden.

The existing toggle infrastructure (`collapsed` CSS class, resize handle `setupResizeHandles()`, and share URL pane state capture) already supports arbitrary panels — Grammar and Input just never had toggles wired up.

## Goals / Non-Goals

**Goals:**
- Add a visibility toggle button to the Grammar panel header
- Add a visibility toggle button to the Input panel header
- When hidden, remaining left-column panels expand to fill freed space (via flexbox)
- Resize handles adjacent to the toggled panel update correctly
- Toggle state is persisted in share URLs and restored on load

**Non-Goals:**
- Adding toggles to the top toolbar (`#panel-toggles`) — toggles are in the panel headers
- Changing the existing toggle behavior for other panels
- New CSS or layout framework changes beyond what's needed for the toggle buttons

## Decisions

**Decision: Use panel-header buttons for toggles**
The existing toggle pattern uses the toolbar bar for trace/match/actions/made. Grammar and Input will use a simple eye-toggle button in their panel header (matching the existing save/open button style). This avoids cluttering the toolbar and keeps the toggle close to the panel it controls.

**Decision: Reuse `collapsed` CSS class and flexbox layout**
The `.collapsed { display: none }` pattern already exists and works with flexbox — no layout recalculation needed beyond running `setupResizeHandles()` after toggling. This is simpler than a JS-driven layout manager.

## Risks / Trade-offs

- **Toggle in header vs toolbar**: Having toggles in the panel header instead of the toolbar is a minor inconsistency. Mitigation: the eye icon matches the existing toolbar toggle icon, making the behavior recognizable.
- **All left panels could be hidden**: If Grammar, Actions, and Input are all hidden, the left column would be empty. Mitigation: this is a user choice; the right column would expand to full width automatically via the existing `updateRightHalf()` logic (which checks if all right panels are hidden).
