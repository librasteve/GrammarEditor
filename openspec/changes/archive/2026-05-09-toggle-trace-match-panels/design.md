## Context

The right half of the layout contains Trace and Match panels side by side. Adding a toggle lets users collapse either panel. The layout uses flexbox, so hiding a panel is as simple as toggling `display: none` on the panel element — the remaining panels auto-expand to fill the space.

## Goals / Non-Goals

**Goals:**
- Toggle button in Trace and Match panel headers (e.g., an eye icon or checkbox)
- Clicking hides the panel; clicking again shows it
- Remaining panels expand to fill the freed space
- State is tracked in JS (no persistence needed across page reloads)
- Works on mobile (stacked layout) and desktop (side-by-side)

**Non-Goals:**
- No animation for show/hide transition (simple instant toggle is fine)
- No persistence of toggle state (reset on page reload)
- No toggle for Grammar or String panels

## Decisions

1. **Simple checkbox in header** — Add a checkbox or eye toggle in each panel header between the label and the right edge. Clicking it toggles the panel's visibility.
2. **CSS class for hidden state** — Define a `.panel.hidden { display: none; }` class. JS toggles it via `classList.toggle`.
3. **Panel expansion is automatic** — Since `#right-half` uses `flex-direction: row` (desktop) or `column` (mobile), hiding one panel via `display: none` makes the other fill the space naturally via `flex: 1`.
4. **Event delegation** — Click handler on the toggle element; no need for additional event listeners.

## Risks / Trade-offs

- **Layout shift** — Hiding a panel causes an instant layout change. No animation, but avoids complexity.
- **Empty space on mobile** — If both trace and match are hidden, `#right-half` collapses to nothing. This is fine — the remaining grammar and string panels take the full width.
