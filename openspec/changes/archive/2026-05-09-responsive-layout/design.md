## Context

The layout uses a CSS grid with `#app { grid-template-columns: 1fr 1fr }`. On narrow screens, the four panels become squashed. The viewport meta tag is already set (`width=device-width, initial-scale=1.0`), so only CSS changes are needed.

## Goals / Non-Goals

**Goals:**
- Below 768px width: single-column stacked layout (grammar → string → trace → match)
- Each panel is at least 200px tall on mobile
- Panels are scrollable when content overflows
- `overflow: hidden` on body is removed on mobile to allow scrolling
- Desktop layout unchanged

**Non-Goals:**
- No touch/gesture enhancements
- No tab-based panel switching
- No JS changes

## Decisions

1. **Media query at 768px** — Standard Bootstrap breakpoint for tablets/mobile. Above this the desktop 2-column grid remains.
2. **Stack order** — Grammar → String → Trace → Match (same left-to-right, top-to-bottom order as desktop)
3. **Min-height per panel** — 200px to give enough room for editing on mobile
4. **Body overflow** — Change to `overflow: auto` on mobile so the page can scroll when panels exceed viewport height
5. **No JS changes** — All responsive behavior is CSS-only via media queries

## Risks / Trade-offs

- **Long trace trees on mobile** — Deeply nested traces may be hard to navigate on small screens. Mitigation: panels scroll independently.
- **Desktop-only features** — The keyboard shortcut (Ctrl+Enter) works on mobile keyboards via external keyboards only. No mitigation needed — standard mobile behavior.
