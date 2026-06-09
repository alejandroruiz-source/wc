# Implementation Plan: Match Schedule

**Branch**: `004-match-schedule` | **Date**: 2026-06-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-match-schedule/spec.md`

## Summary

Add a Schedule section to the WC2026 SPA that displays all 102 WC2026 fixtures from the
openfootball `worldcup.json` feed. Matches are grouped by calendar date and each entry shows
both teams with flags, the kick-off time in the user's local timezone, and the kick-off time
in the venue's local timezone. A day-filter `<select>` lets users narrow to a single date.
The implementation follows the Alpine.js component pattern established by `teamsSection` and
`groupsSection`, adds `fetchSchedule()` to `data.js` with the same Promise-cache pattern, and
adds a `VENUE_TIMEZONES` lookup to `config.js` mapping the 16 WC2026 host city strings to
IANA timezone identifiers.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2020+), no build step

**Primary Dependencies**: Alpine.js v3.14.1 (CDN), browser `Intl` API (built-in)

**Storage**: N/A — no persistence; in-memory cache per page load only

**Testing**: Manual browser validation (see `quickstart.md`)

**Target Platform**: Evergreen browsers (Chrome, Firefox, Safari, Edge current−1)

**Project Type**: Static SPA — GitHub Pages deployable

**Performance Goals**: Schedule section fully rendered within 3 s on standard broadband

**Constraints**: Total page weight < 200 KB uncompressed; no backend; no auth tokens

**Scale/Scope**: 102 match fixtures, ~35 unique match dates, 16 host venues

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I — Static-First | No backend, no persistence | ✅ PASS | `fetchSchedule()` is a client-side `fetch()` with in-memory Promise cache only |
| II — Canonical Data | Must use `worldcup.json` from openfootball | ✅ PASS | Schedule URL per constitution: `…/2026/worldcup.json` |
| III — Mobile-First | All layouts mobile-first | ✅ PASS | Match rows and day-group headers designed for 320 px+ first |
| IV — Lightweight | No new heavy dependencies | ✅ PASS | Only built-in `Intl` API for timezone formatting; no new CDN libraries |
| V — Timezone Awareness | Two times per match (local + venue) | ✅ PASS | `parseMatchTime()` converts feed time string to UTC; `Intl.DateTimeFormat` renders in both timezones; UTC label fallback for unknown venues |

**Post-Phase 1 re-check**: All five gates pass — no violations identified in design artifacts.

## Project Structure

### Documentation (this feature)

```text
specs/004-match-schedule/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── schedule-state-contract.md  ← Phase 1 output
└── tasks.md             ← /speckit-tasks output (not yet created)
```

### Source Code (repository root)

This feature adds to the existing single-file SPA layout:

```text
index.html       ← add Schedule <section>; add <script> for js/schedule.js; add nav link
css/main.css     ← add day-group header, match-row, day-filter select, match-time styles
js/config.js     ← add VENUE_TIMEZONES lookup (city substring → IANA timezone id)
js/data.js       ← add fetchSchedule(), parseMatchTime(), enrichMatch() for schedule data
js/schedule.js   ← new file: Alpine.js scheduleSection component
```

No new directories needed. All additions are to existing files plus one new JS module.

## Complexity Tracking

No constitution violations — no entry required.
