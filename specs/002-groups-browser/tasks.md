---
description: "Task list for Groups Browser feature implementation"
---

# Tasks: Groups Browser

**Input**: Design documents from `specs/002-groups-browser/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1)

## Path Conventions

Static SPA at repository root — Groups Browser adds to the existing file set:
- `index.html` — add Groups `<section>` and nav link; add `js/groups.js` script tag
- `css/main.css` — add group panel grid and team row styles
- `js/data.js` — add module-level Promise cache to `fetchTeams()`
- `js/groups.js` — new file: Alpine.js `groupsSection` component

---

## Phase 1: Setup

**Purpose**: Wire the new module into the existing SPA before any component logic is written.

- [x] T001 Add `<script type="module" src="js/groups.js">` to `index.html` `<head>` immediately after the existing `js/teams.js` module script (before the Alpine CDN `<script defer>` tag), and add `<a href="#groups" class="nav-link">Groups</a>` to the `<nav>` in the site header

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add module-level Promise cache to `fetchTeams()` in `js/data.js` so that
both `teamsSection` and `groupsSection` share a single HTTP request per page load.

**⚠️ CRITICAL**: The Groups component calls `fetchTeams()` from `js/data.js`. Without
the cache, simultaneous `init()` calls from both Alpine components would fire two
identical HTTP requests. This change MUST complete before T003.

- [x] T002 Update `js/data.js`: extract the existing fetch+parse logic into a private
  `_doFetchTeams()` helper; declare `let _teamsPromise = null` at module scope; rewrite
  `fetchTeams()` to return `_teamsPromise` if non-null, otherwise assign
  `_doFetchTeams().catch(err => { _teamsPromise = null; throw err; })` to `_teamsPromise`
  and return it — on rejection the cache is cleared so the `retry()` method in each
  component works correctly

**Checkpoint**: `fetchTeams()` returns the same Promise on concurrent calls; failed calls
reset the cache so retry issues a fresh request.

---

## Phase 3: User Story 1 — Browse All Groups (Priority: P1) 🎯 MVP

**Goal**: 12 group panels (A–L) visible on load, each listing its 4 member teams with
flag emoji, name, and confederation–region label. Loading and error states handled.

**Independent Test**: Open `http://localhost:8080` → scroll to Groups section → 12 group
panels visible in alphabetical order, each with 4 teams; spinner during fetch; error +
Retry when network is blocked. (See `quickstart.md` for full validation steps.)

### Implementation for User Story 1

- [x] T003 [US1] Create `js/groups.js` (new file): `import { fetchTeams, FetchError } from './data.js'`;
  register `Alpine.data('groupsSection', ...)` via `document.addEventListener('alpine:init', ...)` with:
  state (`allTeams: []`, `isLoading: true`, `hasError: false`, `errorMessage: ''`);
  `groupedTeams` getter — partition `allTeams` by `team.group`, omit entries where
  `team.group === '?'`, sort groups alphabetically A→L, sort teams within each group by
  `name` ascending case-insensitive, return `Array<{ id: string, teams: Team[] }>`;
  `hasGroups` getter (`groupedTeams.length > 0`);
  `init()` calling `_load()`;
  `_load()` — `isLoading = true`, calls `fetchTeams()`, sets `allTeams`, handles
  `FetchError` and generic errors (same error-state pattern as `js/teams.js`);
  `retry()` calling `_load()`

- [x] T004 [P] [US1] Add Groups section markup to `index.html` between the closing `</section>` of
  the Teams section and the `<footer>`: `<section id="groups" class="section" x-data="groupsSection"
  aria-labelledby="groups-heading">`; `<h2 id="groups-heading" class="section-title">Groups</h2>`;
  loading state `<div class="loading-state" x-show="isLoading" x-cloak aria-live="polite">` with
  `.spinner` and "Loading groups…" text; error state `<div class="error-state" x-show="hasError
  && !isLoading" x-cloak role="alert">` with error icon, `x-text="errorMessage"` paragraph, and
  `<button class="btn btn--retry" x-on:click="retry()" aria-label="Retry loading groups">Try Again</button>`;
  content wrapper `<div x-show="!isLoading && !hasError" x-cloak>` containing
  `<div class="groups-grid">` with `<template x-for="group in groupedTeams" :key="group.id">`,
  each iteration renders `<article class="group-panel">` with
  `<h3 class="group-panel__title">Group&nbsp;<span x-text="group.id"></span></h3>`,
  `<ul class="team-list">` with `<template x-for="team in group.teams" :key="team.code">` where
  each `<li class="team-row">` contains `<span class="team-row__flag" aria-hidden="true"
  x-text="team.flagEmoji"></span>`, `<span class="team-row__name" x-text="team.name"></span>`,
  `<span class="team-row__confederation" x-text="team.confederation + ' – ' + team.region"></span>`

- [x] T005 [P] [US1] Add Groups CSS to `css/main.css`:
  `.groups-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-md); }`
  with `@media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }` and
  `@media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr); }`;
  `.group-panel { background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: var(--space-md); box-shadow: var(--shadow-sm); }`;
  `.group-panel__title { font-size: var(--text-lg); font-weight: 700; color: var(--color-primary);
  padding-bottom: var(--space-xs); border-bottom: 2px solid var(--color-accent);
  margin-bottom: var(--space-sm); }`;
  `.team-list { list-style: none; display: flex; flex-direction: column; gap: 0; }`;
  `.team-row { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) 0;
  border-bottom: 1px solid var(--color-border); }`;
  `.team-row:last-child { border-bottom: none; }`;
  `.team-row__flag { font-size: 1.5rem; line-height: 1; flex-shrink: 0; }`;
  `.team-row__name { font-size: var(--text-sm); font-weight: 700; color: var(--color-text); }`;
  `.team-row__confederation { font-size: 0.75rem; color: var(--color-text-muted); }`

**Checkpoint**: US1 independently functional. Open `http://localhost:8080` → Groups section
shows 12 panels with 4 teams each; spinner during load; error + retry on offline; mobile
375px renders without horizontal scroll. Run quickstart.md §US1.

---

## Phase 4: Polish & Validation

**Purpose**: Verify the Promise cache, validate against quickstart scenarios, confirm
weight budget.

- [x] T006 [P] Verify single HTTP request: open `http://localhost:8080` in a browser with
  DevTools → Network, filter by `worldcup.teams.json`, hard-refresh (Ctrl+Shift+R) —
  confirm exactly **1 network request** fires even though both `teamsSection` and
  `groupsSection` call `fetchTeams()` on mount

- [x] T007 [P] Run quickstart.md end-to-end validation: 12 group panels A–L, 4 teams each,
  48 total team entries, flag/name/confederation on every row, loading state, error + Retry,
  mobile 375px no horizontal scroll — document any deviations

- [x] T008 [P] Verify total uncompressed file weight stays under 200 KB: measure
  `index.html + css/main.css + js/config.js + js/data.js + js/teams.js + js/groups.js`
  and confirm sum < 200 KB (constitution Principle IV)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS US1**
- **US1 (Phase 3)**: Depends on Foundational (T002) — T003, T004, T005 can then run in parallel
- **Polish (Phase 4)**: Depends on all US1 tasks complete

### Within Phase 3

- T003 (`js/groups.js`) MUST complete before T004 (`index.html` markup) to ensure the
  component is defined before the template references it
- T004 (`index.html`) and T005 (`css/main.css`) target different files → can run in parallel
  once T003 is done

### Parallel Opportunities

```bash
# Phase 3 — after T003 completes:
T004: Groups section markup (index.html)
T005: Groups CSS (css/main.css)

# Phase 4 — after Phase 3:
T006: Verify single HTTP request
T007: Run quickstart.md validation
T008: File weight check
```

---

## Implementation Strategy

### MVP (User Story 1 — All of Phase 3)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational cache (T002) — **CRITICAL**
3. Complete Phase 3: User Story 1 (T003 → T004+T005)
4. **STOP and VALIDATE**: Open `http://localhost:8080` → 12 groups visible; DevTools shows
   1 HTTP request; mobile layout correct. Run quickstart.md.

### Incremental Delivery

1. T001 + T002: Wire and cache → foundation ready
2. T003: Component logic → groups component exists but no markup yet
3. T004 + T005: Markup + CSS → Groups section visible in browser
4. T006–T008: Polish validation → production ready

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- T002 (cache) changes behaviour of `fetchTeams()` in `data.js` — verify the Teams section
  still works correctly after this change (retry should still fire a fresh request)
- No filtering or search needed for Groups MVP; component is read-only display
- Constitution gates are all green; no violations to track
