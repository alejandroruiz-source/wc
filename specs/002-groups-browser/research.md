# Research: Groups Browser

**Feature**: `002-groups-browser` | **Date**: 2026-06-08

## Decision 1: Data Source — Reuse Teams Data

**Decision**: Derive group membership from the `group` field on each `Team` object
returned by `fetchTeams()` (from `worldcup.teams.json`). Do NOT use `worldcup.groups.json`.

**Rationale**: Discovered in feature 001 that `worldcup.groups.json` contains teams as
bare strings without metadata, making it useless for rendering cards with flags and
confederations. The `worldcup.teams.json` feed includes a `group` field on every team
record, which is sufficient to derive a complete groups view.

**Alternatives considered**:
- `worldcup.groups.json` — rejected; teams are bare strings, no metadata for card rendering
- Hardcoded group assignments — rejected; violates Principle II (canonical data sources)

---

## Decision 2: Data Sharing — Module-Level Promise Cache

**Decision**: Add a module-level Promise cache inside `data.js` so that `fetchTeams()`
deduplicates concurrent calls and returns the same in-flight or resolved Promise.

```
First call:   _cache = null → creates fetch Promise, stores in _cache, returns it
Second call:  _cache set → returns existing Promise immediately (no new HTTP request)
On error:     _cache is cleared → next call will retry
On retry:     component calls fetchTeams() again → _cache is null → new fetch
```

**Rationale**: When `index.html` mounts both `teamsSection` and `groupsSection`,
both `init()` methods fire simultaneously and call `fetchTeams()`. Without caching,
two identical HTTP requests are made. The module-level cache ensures exactly one
request per page load, with correct retry behaviour.

**Alternatives considered**:
- `Alpine.$store` for shared state — possible but introduces coupling between components;
  the data layer is the right place for this concern, not the view layer
- HTTP browser cache — `raw.githubusercontent.com` sets `max-age=300`; second request may
  still hit the network on the first page view. Module cache is deterministic and instant.
- Each section fetches independently — simplest, but doubles network traffic and means both
  sections show loading spinners independently instead of finishing together

---

## Decision 3: Layout — Responsive Group Panel Grid

**Decision**: Groups section uses a CSS Grid of group panels. Breakpoints:
- Mobile (< 640 px): 1 panel per row — allows 4 team rows to be readable
- Tablet (≥ 640 px): 2 panels per row
- Desktop (≥ 1024 px): 3 panels per row

Inside each panel, teams are listed as compact rows (no card box-shadow), showing
flag emoji, team name, and confederation–region label inline. This is denser than the
full team cards in the Teams section because each panel already provides group context.

**Rationale**: At 375 px, a 2-column layout would give each panel ~170 px — too narrow
for legible 4-team rows with flags and confederation text. 1-column gives full width,
matching the Teams section's mobile experience. At 1024 px, 3 columns is less dense than
4 — appropriate because group panels are taller than team cards.

**Alternatives considered**:
- 2 columns on mobile — rejected; too narrow for team name + confederation at 375 px
- 4 columns on desktop (matching Teams grid) — rejected; group panels are taller; 3 columns
  gives a better aspect ratio and matches the 12-group count (3×4 = 12, fills the grid exactly)
- Accordion / expand-collapse per group — rejected; adds interaction complexity for no benefit;
  all 12 groups visible on load is the primary requirement
- Tabbed view per group — rejected; navigation overhead, not mobile-first

---

## Decision 4: Team Rows Inside Group Panels

**Decision**: Within each group panel, teams are rendered as simple flex rows, not full
cards. Each row shows: `[flag] [name] · [confederation – region]`. No box-shadow, no
hover lift — the panel itself is the card.

**Rationale**: Nesting full `.team-card` elements inside group panels would make panels
too tall on mobile. Compact rows allow all 4 teams to be legible within a manageable
panel height. The confederation label is useful context (matches the Teams section's
card display) but is visually subordinate to the team name.

**Alternatives considered**:
- Full `.team-card` nested in panel — rejected; too tall, mobile panels would require
  vertical scrolling just to see all 4 teams in one group
- Name only (no confederation) — rejected; spec FR-003 requires confederation–region label
