---
description: "Task list for Match Schedule feature implementation"
---

# Tasks: Match Schedule

**Input**: Design documents from `specs/004-match-schedule/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)

## Path Conventions

Static SPA at repository root — Match Schedule adds to the existing file set:
- `index.html` — add Schedule `<section>`, nav link, and `js/schedule.js` script tag
- `css/main.css` — add day-group header, match-card, match-times, and day-filter styles
- `js/config.js` — add `VENUE_TIMEZONES` lookup and `lookupVenueTimezone()` helper
- `js/data.js` — add `fetchSchedule()`, `parseMatchTime()`, `enrichMatch()` for schedule
- `js/schedule.js` — new file: Alpine.js `scheduleSection` component

---

## Phase 1: Setup

**Purpose**: Wire the new module into the existing SPA before any component logic is written.

- [x] T001 Add `<script type="module" src="js/schedule.js">` to `index.html` `<head>` immediately after the existing `js/groups.js` module script (before the Alpine CDN `<script defer>` tag), and add `<a href="#schedule" class="nav-link">Schedule</a>` to the `<nav>` in the site header — `index.html`

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add venue timezone lookup to `config.js` and schedule fetch+parse logic to
`data.js` so the `scheduleSection` component has everything it needs.

**⚠️ CRITICAL**: T003 imports from `config.js` so T002 MUST complete before T003.

- [x] T002 Add `VENUE_TIMEZONES` object to `js/config.js` (export it): a plain object mapping
  16 host city substring keys to IANA timezone identifiers — entries: `"New York"` →
  `"America/New_York"`, `"Los Angeles"` → `"America/Los_Angeles"`, `"Dallas"` →
  `"America/Chicago"`, `"Santa Clara"` → `"America/Los_Angeles"`, `"Miami"` →
  `"America/New_York"`, `"Seattle"` → `"America/Los_Angeles"`, `"Boston"` →
  `"America/New_York"`, `"Atlanta"` → `"America/New_York"`, `"Kansas City"` →
  `"America/Chicago"`, `"Houston"` → `"America/Chicago"`, `"Philadelphia"` →
  `"America/New_York"`, `"Toronto"` → `"America/Toronto"`, `"Vancouver"` →
  `"America/Vancouver"`, `"Mexico City"` → `"America/Mexico_City"`, `"Guadalajara"` →
  `"America/Mexico_City"`, `"Monterrey"` → `"America/Monterrey"`;
  also export `lookupVenueTimezone(ground)` — iterates `Object.keys(VENUE_TIMEZONES)`,
  returns `VENUE_TIMEZONES[key]` for first key where `ground.includes(key)`, otherwise
  returns `null` — `js/config.js`

- [x] T003 Add schedule fetch layer to `js/data.js`:
  (a) `parseMatchTime(dateStr, timeStr)` — splits `timeStr` (e.g. `"13:00 UTC-6"`) on `' '`
  to get `["13:00", "UTC-6"]`, parses hours/minutes, parses offset via
  `parseInt(offsetStr.replace('UTC',''))`, returns `Date.UTC(year, month-1, day, h-offset, m)`;
  (b) `enrichScheduleMatch(raw)` — calls `parseMatchTime`, calls `lookupVenueTimezone(raw.ground)`,
  returns `{ round, date, utcDate: new Date(utcMs), team1: raw.team1, team2: raw.team2,
  group: raw.group || null, matchNum: raw.num || null, ground: raw.ground, venueTimezone }`;
  (c) private `_doFetchSchedule()` — fetches the schedule URL
  `https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json`,
  checks `r.ok`, throws `FetchError` on failure, reads `response.matches`, maps with
  `enrichScheduleMatch`, sorts by `utcDate` ascending;
  (d) `let _schedulePromise = null` at module scope;
  (e) export `fetchSchedule()` — same Promise-cache pattern as `fetchTeams()`:
  returns `_schedulePromise` if non-null, otherwise assigns
  `_doFetchSchedule().catch(err => { _schedulePromise = null; throw err; })` and returns it —
  `js/data.js`

**Checkpoint**: `fetchSchedule()` resolves to a sorted `EnrichedMatch[]`; concurrent calls
return the same Promise; rejection clears cache so retry issues a fresh request.

---

## Phase 3: User Story 1 — Browse Full Match Schedule (Priority: P1) 🎯 MVP

**Goal**: Full match schedule rendered on page load, grouped by calendar date, with each
match showing teams, matchday label, kick-off time in user's local timezone, and kick-off
time in venue's local timezone. Loading and error states handled.

**Independent Test**: Open `http://localhost:8080` → scroll to Schedule section → day groups
load in chronological order → each match shows two teams and two time values → mobile 375 px
no horizontal scroll → error + Retry on offline. (See `quickstart.md` §Scenarios 1–3.)

### Implementation for User Story 1

- [x] T004 [US1] Create `js/schedule.js` (new file): `import { fetchSchedule, FetchError }
  from './data.js'`; register `Alpine.data('scheduleSection', ...)` via
  `document.addEventListener('alpine:init', ...)` with:
  **State**: `allMatches: []`, `isLoading: true`, `hasError: false`, `errorMessage: ''`,
  `selectedDay: ''`, `userTimezone: ''`;
  **`availableDays` getter** — returns `Array<{ value: string, label: string }>` of unique
  `match.date` values in sorted order, with `label` computed via
  `new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })`;
  **`filteredDayGroups` getter** — builds a `Map<string, EnrichedMatch[]>` keyed by
  `match.date`; if `selectedDay` is non-empty filters to that key only; converts Map to
  sorted `Array<{ date, label, matches }>` where `label` uses same date formatting as
  `availableDays` and `matches` are sorted by `utcDate` ascending;
  **`hasResults` getter** — `filteredDayGroups.length > 0`;
  **`init()`** — sets `this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'`,
  then calls `this._load()`;
  **`_load()`** — sets `isLoading = true`, `hasError = false`, `errorMessage = ''`,
  awaits `fetchSchedule()`, sets `allMatches`; on `FetchError` sets `hasError = true` and
  `errorMessage = err.message`; on generic error sets generic message; always sets
  `isLoading = false` in finally;
  **`retry()`** — delegates to `_load()`;
  **`formatLocalTime(utcDate)`** — returns
  `utcDate.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone: this.userTimezone, timeZoneName:'short' })`;
  **`formatVenueTime(utcDate, venueTimezone)`** — if `venueTimezone` is null returns
  `utcDate.toUTCString().slice(17,22) + ' UTC'`; otherwise returns
  `utcDate.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone: venueTimezone, timeZoneName:'short' })` —
  `js/schedule.js`

- [x] T005 [P] [US1] Add Schedule section markup to `index.html` between the closing
  `</section>` of the Groups section and the `<footer>`:
  `<section id="schedule" class="section" x-data="scheduleSection" aria-labelledby="schedule-heading">`;
  `<h2 id="schedule-heading" class="section-title">Schedule</h2>`;
  loading state `<div class="loading-state" x-show="isLoading" x-cloak aria-live="polite">` with `.spinner`
  and "Loading schedule…" text;
  error state `<div class="error-state" x-show="hasError && !isLoading" x-cloak role="alert">` with
  error icon, `x-text="errorMessage"` paragraph, and `<button class="btn btn--retry"
  x-on:click="retry()" aria-label="Retry loading schedule">Try Again</button>`;
  content wrapper `<div x-show="!isLoading && !hasError" x-cloak>` containing:
  day-filter bar placeholder `<!-- T007 adds day-filter here -->`;
  no-results message `<p class="no-results" x-show="!hasResults" x-cloak role="status" aria-live="polite">No matches on this day.</p>`;
  `<div class="schedule-days" x-show="hasResults" x-cloak>` with
  `<template x-for="group in filteredDayGroups" :key="group.date">`;
  each iteration renders `<div class="day-group">` with
  `<h3 class="day-group__header" x-text="group.label"></h3>` and
  `<div class="day-group__matches">` containing
  `<template x-for="match in group.matches" :key="match.date + match.team1 + match.team2">`;
  each match renders `<article class="match-card">` with:
  `<span class="match-card__round" x-text="match.round"></span>`;
  `<div class="match-teams">` containing two `.match-team` divs each with
  `<span class="match-team__flag" aria-hidden="true" x-text="match.team1Flag"></span>` and
  `<span class="match-team__name" x-text="match.team1"></span>` (repeat for team2),
  and a `<span class="match-team--vs">vs</span>` between them;
  `<div class="match-times">` with two `.match-time` divs:
  first with `<span class="match-time__label" x-text="userTimezone"></span>` and
  `<span class="match-time__value" x-text="formatLocalTime(match.utcDate)"></span>`;
  second with `<span class="match-time__label" x-text="match.ground"></span>` and
  `<span class="match-time__value" x-text="formatVenueTime(match.utcDate, match.venueTimezone)"></span>` —
  `index.html`

- [x] T006 [P] [US1] Add Schedule CSS to `css/main.css` after the existing groups styles:
  `.schedule-days { display: flex; flex-direction: column; gap: var(--space-xl); }`;
  `.day-group__header { font-size: var(--text-lg); font-weight: 700; color: var(--color-primary);
  padding-bottom: var(--space-xs); border-bottom: 2px solid var(--color-accent); margin-bottom: var(--space-md); }`;
  `.day-group__matches { display: flex; flex-direction: column; gap: var(--space-sm); }`;
  `.match-card { background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md);
  display: flex; flex-direction: column; gap: var(--space-xs); box-shadow: var(--shadow-sm); }`;
  `.match-card__round { font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.05em; }`;
  `.match-teams { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }`;
  `.match-team { display: flex; align-items: center; gap: var(--space-xs); flex: 1; min-width: 0; }`;
  `.match-team:last-of-type { justify-content: flex-end; }`;
  `.match-team__flag { font-size: 1.5rem; line-height: 1; flex-shrink: 0; }`;
  `.match-team__name { font-size: var(--text-sm); font-weight: 700; color: var(--color-text);
  overflow-wrap: break-word; }`;
  `.match-team--vs { font-size: var(--text-sm); color: var(--color-text-muted);
  font-weight: 500; flex-shrink: 0; }`;
  `.match-times { display: flex; gap: var(--space-lg); flex-wrap: wrap;
  padding-top: var(--space-xs); border-top: 1px solid var(--color-border); }`;
  `.match-time { display: flex; flex-direction: column; gap: 2px; min-width: 0; }`;
  `.match-time__label { font-size: 0.65rem; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 18ch; }`;
  `.match-time__value { font-size: var(--text-sm); font-weight: 600; color: var(--color-text); }` —
  `css/main.css`

**Checkpoint**: US1 independently functional. Open `http://localhost:8080` → Schedule section
shows all matches grouped by date; each match shows two times; spinner during load;
error + retry on offline; mobile 375 px renders without horizontal scroll.
Run quickstart.md §Scenarios 1–3.

---

## Phase 4: User Story 2 — Filter by Day (Priority: P2)

**Goal**: A `<select>` dropdown listing all match dates lets the user filter to a single day.
Selecting "All days" restores the full schedule. Selecting a day with no matches shows an
empty-state message.

**Independent Test**: With schedule loaded, change `<select>` to a specific date → only that
day's matches visible → change back to "All days" → full schedule restored.
(See `quickstart.md` §Scenarios 4–5.)

### Implementation for User Story 2

- [x] T007 [US2] Replace the `<!-- T007 adds day-filter here -->` comment in `index.html`
  Schedule content wrapper with the day-filter bar:
  `<div class="day-filter-bar">` containing
  `<label for="day-select" class="sr-only">Filter by day</label>` and
  `<select id="day-select" class="day-select" x-model="selectedDay"
  aria-label="Filter matches by day">` with
  `<option value="">All days</option>` followed by
  `<template x-for="day in availableDays" :key="day.value">` rendering
  `<option :value="day.value" x-text="day.label"></option>` — `index.html`

- [x] T008 [P] [US2] Add day-filter CSS to `css/main.css` after the `.match-time__value` rule:
  `.day-filter-bar { margin-bottom: var(--space-lg); }`;
  `.day-select { min-height: 44px; padding: var(--space-sm) var(--space-md);
  border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font: inherit;
  font-size: var(--text-sm); background: var(--color-surface); color: var(--color-text);
  width: 100%; max-width: 400px; cursor: pointer;
  transition: border-color .15s, box-shadow .15s; }`;
  `.day-select:focus { outline: none; border-color: var(--color-primary-lt);
  box-shadow: 0 0 0 2px rgba(42, 95, 158, .2); }` — `css/main.css`

**Checkpoint**: US2 functional. Day select shows all unique match dates; selecting one
narrows the schedule; selecting "All days" restores; selecting a date with no matches shows
no-results message.

---

## Phase 5: Polish & Validation

**Purpose**: Verify timezone correctness, Promise cache, quickstart scenarios, and weight budget.

- [x] T009 [P] Verify dual timezone display: open `http://localhost:8080` in a browser,
  scroll to Schedule section, find any group-stage match — confirm both a local time (with
  timezone abbreviation) and a venue time (city name + time) appear on every match card;
  use DevTools Sensors to override timezone (e.g., Asia/Tokyo) and hard-refresh — confirm
  local times update to JST while venue city times stay the same

- [x] T010 [P] Verify single HTTP request: open `http://localhost:8080` in DevTools → Network,
  filter by `worldcup.json`, hard-refresh (Ctrl+Shift+R) — confirm exactly **1** network
  request fires for `worldcup.json` even though `scheduleSection` calls `fetchSchedule()`
  on mount

- [x] T011 [P] Run quickstart.md end-to-end validation: all 8 scenarios — full schedule
  (102 matches, grouped dates), dual timezones, day filter, empty state, error + Retry,
  single request, mobile 375 px no horizontal scroll, UTC fallback label — document any
  deviations

- [x] T012 [P] Verify total uncompressed file weight stays under 200 KB: measure
  `index.html + css/main.css + js/config.js + js/data.js + js/teams.js + js/groups.js + js/schedule.js`
  and confirm sum < 200 KB (constitution Principle IV)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — T002 then T003 (sequential within Phase 2)
- **US1 (Phase 3)**: Depends on T003 complete — T004, T005, T006 can then run in parallel
- **US2 (Phase 4)**: Depends on US1 complete — T007, T008 can run in parallel
- **Polish (Phase 5)**: Depends on US2 complete — T009–T012 can all run in parallel

### Within Phase 3

- T004 (`js/schedule.js`) MUST complete before T005 (`index.html` markup) — the component
  must be defined before the template references it
- T004 and T006 (`css/main.css`) target different files → can run in parallel once T003 done
- T005 and T006 target different files → can run in parallel once T004 done

### Parallel Opportunities

```bash
# Phase 2 — sequential (T002 must precede T003):
T002: VENUE_TIMEZONES in config.js
T003: fetchSchedule() in data.js  ← depends on T002

# Phase 3 — after T003:
T004: scheduleSection component (js/schedule.js)
# After T004:
T005: Schedule section markup (index.html)
T006: Schedule CSS (css/main.css)

# Phase 4 — after Phase 3:
T007: Day-filter markup (index.html)
T008: Day-filter CSS (css/main.css)

# Phase 5 — after Phase 4:
T009: Timezone verification
T010: Single-request cache check
T011: Quickstart validation
T012: File weight check
```

---

## Implementation Strategy

### MVP (User Story 1 — All of Phase 3)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002 → T003) — **CRITICAL**
3. Complete Phase 3: User Story 1 (T004 → T005 + T006)
4. **STOP and VALIDATE**: Open `http://localhost:8080` → Schedule section shows all matches
   with dual timezones; DevTools shows 1 HTTP request; mobile layout correct.
   Run quickstart.md §Scenarios 1–3.

### Incremental Delivery

1. T001 + T002 + T003: Wire and fetch layer → foundation ready
2. T004: Component logic → scheduleSection exists but no markup yet
3. T005 + T006: Markup + CSS → Schedule section visible in browser
4. T007 + T008: Day filter → US2 complete
5. T009–T012: Polish validation → production ready

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- T002 (VENUE_TIMEZONES) changes `config.js` — verify existing teams/groups sections still work after adding exports
- T003 (fetchSchedule) changes `data.js` — verify teams section retry still works after adding schedule cache
- No test tasks generated — not requested in spec
- Constitution gate V (timezone) is verified in T009; UTC fallback is part of T004/`formatVenueTime`
