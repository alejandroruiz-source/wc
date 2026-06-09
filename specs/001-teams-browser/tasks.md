---
description: "Task list for Teams Browser feature implementation"
---

# Tasks: Teams Browser

**Input**: Design documents from `specs/001-teams-browser/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Static SPA at repository root:
- `index.html` — entry point and all section markup
- `css/main.css` — all styles (mobile-first)
- `js/config.js` — static lookup tables and helpers
- `js/data.js` — fetch layer
- `js/teams.js` — Alpine.js reactive component

---

## Phase 1: Setup

**Purpose**: Create project file skeleton — no logic yet, just structure.

- [x] T001 Create project directory structure and empty files: `index.html`, `css/main.css`, `js/config.js`, `js/data.js`, `js/teams.js` at repository root
- [x] T002 [P] Scaffold `index.html`: HTML5 boilerplate, `<meta name="viewport">`, Alpine.js CDN `<script defer>` tag, `<script type="module">` tag for `js/teams.js`, Teams section skeleton `<section id="teams">`
- [x] T003 [P] Scaffold `css/main.css`: CSS reset, CSS custom properties (colors, spacing, border-radius, breakpoints `--bp-md: 640px`, `--bp-lg: 1024px`), mobile-first `body` and `*` base rules

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and config modules that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Implement `js/config.js`: export `CONFEDERATION_REGION` map (6 entries: UEFA→Europe, CONMEBOL→South America, CONCACAF→North/Central America & Caribbean, CAF→Africa, AFC→Asia, OFC→Oceania), export `FIFA_TO_ISO` lookup table (all 48 WC2026 teams), export `flagEmoji(isoCode)` helper that returns the Unicode flag string or `'🌐'` for null/unrecognised codes
- [x] T005 Implement `js/data.js`: export `fetchTeams()` async function — GET `https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json` (or teams.json if it exists), validate that response has a `teams` array, enrich each team object with `region` (from `CONFEDERATION_REGION`), `isoCode` (from `FIFA_TO_ISO`), `flagEmoji` (from helper), normalise `group` to uppercase single letter or `'?'`; sort enriched array by `group` ASC then `name` ASC (case-insensitive); return sorted `Team[]`; throw a typed `FetchError` on HTTP failure, parse failure, or empty/missing `teams` array

**Checkpoint**: `js/config.js` and `js/data.js` are complete and importable — user story phases can now begin.

---

## Phase 3: User Story 1 — Browse All Teams (Priority: P1) 🎯 MVP

**Goal**: All 48 team cards are visible on load, ordered by group (A–L) then alphabetically.
Loading and error states are handled.

**Independent Test**: Open `http://localhost:8080` → Teams section shows 48 cards sorted
by group; a spinner appears during fetch; a retry button appears when the network is
blocked. (See `quickstart.md` §US1.)

### Implementation for User Story 1

- [x] T006 [US1] Implement `js/teams.js`: register `Alpine.data('teamsSection', ...)` with state (`allTeams`, `activeConfederation = null`, `searchQuery = ''`, `isLoading = true`, `hasError = false`, `errorMessage = ''`), getters (`filteredTeams` — returns `allTeams` at this stage; `hasResults = filteredTeams.length > 0`), and methods (`init()` calling `fetchTeams()` from `js/data.js` to populate `allTeams`, `retry()` resetting error state and re-fetching)
- [x] T007 [P] [US1] Add team card markup to `index.html` Teams section: Alpine `x-data="teamsSection"` on `<section>`, `x-for` loop over `filteredTeams`, each card renders `flagEmoji`, `name`, confederation–region label formatted as `confederation + ' – ' + region` (e.g. "UEFA – Europe"), and group badge (e.g. "Group A")
- [x] T008 [P] [US1] Add loading state markup to `index.html` Teams section: element with `x-show="isLoading"` containing a visible loading indicator
- [x] T009 [P] [US1] Add error state markup to `index.html` Teams section: element with `x-show="hasError && !isLoading"` showing `errorMessage` text and a "Retry" button wired to `x-on:click="retry()"`
- [x] T010 [US1] Add card grid CSS to `css/main.css`: CSS Grid container (`display: grid`, `1fr` single-column base, `repeat(2, 1fr)` at `--bp-md`, `repeat(3, 1fr)` at `--bp-lg`), card styles (padding, box-shadow, border-radius, flex column layout for flag + name + meta)
- [x] T011 [P] [US1] Add loading and error state CSS to `css/main.css`: loading indicator styles (e.g. pulse/fade animation or spinner), error message container, retry button base styles (padding, border, min tap target height 44px)

**Checkpoint**: US1 is independently functional. Open `index.html` via local server —
48 team cards load sorted by group, spinner shows during fetch, error + retry appear
when network is blocked. Verify all quickstart.md §US1 scenarios pass before continuing.

---

## Phase 4: User Story 2 — Filter by Confederation (Priority: P2)

**Goal**: Six confederation chip buttons appear above the card grid. Tapping a chip
filters the grid to that confederation; re-tapping or "Clear" restores all teams.

**Independent Test**: All chips visible, tap "UEFA – Europe" → only UEFA teams shown,
chip appears active; tap chip again → 48 teams return; filter with ≤2 team confederation
(e.g. OFC) → fewer cards with no empty grid. (See `quickstart.md` §US2.)

### Implementation for User Story 2

- [x] T012 [US2] Add `availableConfederations` getter and `selectChip(key)` method to `js/teams.js`: getter returns distinct `ConfederationChip[]` (each with `key`, `label` as `key + ' – ' + region`, `active = key === activeConfederation`) derived from `allTeams`, sorted alphabetically by key; `selectChip(key)` toggles `activeConfederation` (set to key if not active, null if already active)
- [x] T013 [US2] Update `filteredTeams` getter in `js/teams.js` to filter `allTeams` by `activeConfederation` when non-null (keep team if `team.confederation === activeConfederation`)
- [x] T014 [P] [US2] Add `isFiltered` getter and `clearFilters()` method to `js/teams.js`: `isFiltered = activeConfederation !== null || searchQuery.trim() !== ''`; `clearFilters()` sets both to initial values (`null` and `''`)
- [x] T015 [US2] Add confederation chip bar markup to `index.html` Teams section: `x-for` over `availableConfederations`, each chip is a `<button>` displaying `label`, with `:class` binding for active visual state, `x-on:click="selectChip(chip.key)"`; chip bar placed above the card grid
- [x] T016 [P] [US2] Add Clear button markup to `index.html` Teams section: `<button x-show="isFiltered" x-on:click="clearFilters()">Clear</button>` positioned in the filter controls row
- [x] T017 [US2] Add "no results" message markup to `index.html` Teams section: element with `x-show="!isLoading && !hasError && !hasResults"` containing "No teams match your filters." text
- [x] T018 [P] [US2] Add chip bar, chip button, and Clear button CSS to `css/main.css`: chip bar as `display: flex; flex-wrap: wrap; gap: 8px`, each chip `min-height: 44px`, distinct active vs inactive background/border/colour, Clear button consistent with chip styling, all chips accessible on 375px viewport without horizontal scroll

**Checkpoint**: US2 is independently functional. Confirm US1 still works. Tap chips,
verify filtered counts, verify Clear restores all teams, verify OFC (few teams) shows
cards not empty grid. Verify chip bar fits on 375px without horizontal scroll.

---

## Phase 5: User Story 3 — Search by Name (Priority: P3)

**Goal**: A text input filters cards in real time (≤200ms) by team name, combining with
any active confederation chip.

**Independent Test**: Type "bra" → Brazil appears; clear → 48 teams return; activate
UEFA chip and type "eng" → only UEFA teams containing "eng" shown; type "zzz" → no-results
message shown. (See `quickstart.md` §US3.)

### Implementation for User Story 3

- [x] T019 [US3] Add search input markup to `index.html` Teams section: `<input type="search" x-model="searchQuery" placeholder="Search teams…">` with an associated `<label>` (accessible), placed in the filter controls row alongside chip bar
- [x] T020 [US3] Update `filteredTeams` getter in `js/teams.js` to also filter by `searchQuery`: apply `team.name.toLowerCase().includes(searchQuery.trim().toLowerCase())` on top of the existing confederation filter; both filters applied simultaneously on each render
- [x] T021 [P] [US3] Add search input CSS to `css/main.css`: `width: 100%` on mobile, max-width cap on wider screens, `min-height: 44px`, consistent visual style with chip bar (border, border-radius, padding, font)
- [x] T022 [US3] Verify combined filter+search in `js/teams.js`: confirm `filteredTeams` correctly AND-combines `activeConfederation` and `searchQuery` filters; ensure "no results" message (`x-show="!hasResults"` from T017) fires correctly for both search-empty and filter-empty states

**Checkpoint**: All three user stories independently functional. Run the full quickstart.md
smoke test — 48 cards, chip filter, search, combined filter+search, no-results, retry,
and 375px mobile viewport checks should all pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual refinement, constitution compliance verification, and final validation.

- [x] T023 [P] Verify `js/config.js` `FIFA_TO_ISO` coverage: confirm all 48 WC2026 team codes are mapped; add any missing entries; document the England/UK special case (FIFA code `ENG` → use 🇬🇧 flag via ISO `GB`) in a comment in `js/config.js`
- [x] T024 [P] Add visual polish CSS to `css/main.css`: flag emoji `font-size` and line-height, group badge pill style, card hover/focus state, inter-section spacing, consistent heading typography for the Teams section title
- [x] T025 [P] Add `<title>`, `<meta name="description">`, `lang="en"` on `<html>`, and ARIA labels to all interactive elements (chip buttons, search input, retry button) in `index.html`
- [x] T026 Run full quickstart.md validation end-to-end: US1 (48 cards, loading, error/retry), US2 (chip filter, clear, no-results), US3 (search, combined, no-results), and mobile check at 375px; document any deviations found
- [x] T027 [P] Verify total uncompressed file weight of `index.html` + `css/main.css` + `js/config.js` + `js/data.js` + `js/teams.js` stays under 200 KB (constitution Principle IV); log sizes to confirm compliance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational — no dependency on US2 or US3
- **US2 (Phase 4)**: Depends on US1 completion (builds on Alpine component and card grid)
- **US3 (Phase 5)**: Depends on US2 completion (adds to `filteredTeams` getter)
- **Polish (Phase 6)**: Depends on all user stories complete

### Within Each Phase

- All tasks marked [P] within a phase can run in parallel
- T005 (data.js) must complete before T006 (teams.js init wiring)
- T006 must complete before T007–T009 (markup needs the Alpine component defined)
- T013 (filteredTeams update) must complete before T015 (chip markup activates filtering)
- T020 (search update to filteredTeams) must complete before T022 (combined filter verify)

### Parallel Opportunities

```bash
# Phase 1 — run in parallel after T001:
T002: Scaffold index.html
T003: Scaffold css/main.css

# Phase 2 — run in parallel:
T004: Implement js/config.js

# Phase 3 — after T006 completes:
T007: Card markup          T008: Loading markup
T009: Error markup         T011: Loading/error CSS
```

---

## Implementation Strategy

### MVP First (User Story 1 only — Phases 1–3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open `http://localhost:8080` → 48 team cards visible, sorted,
   error/retry functional. Run quickstart.md §US1.
5. Deploy to GitHub Pages to confirm static hosting works end-to-end.

### Incremental Delivery

1. Setup + Foundational → modules ready
2. Add US1 → 48 cards load and display → **MVP Demo**
3. Add US2 → confederation chip filtering → **Demo with filtering**
4. Add US3 → name search → **Full Teams Browser feature**
5. Polish → visual polish + weight check → **Production ready**

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- [US1/US2/US3] label maps each task to its user story for traceability
- Each US checkpoint should be validated independently before proceeding
- No build step — `index.html` opens directly in a browser via local HTTP server
- Constitution gates are tracked in `plan.md`; no violations to resolve
