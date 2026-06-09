# Implementation Plan: Groups Browser

**Branch**: `002-groups-browser` | **Date**: 2026-06-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-groups-browser/spec.md`

## Summary

Display all 12 WC2026 groups (A–L), each showing its 4 member teams as compact cards.
Group data is derived from the `group` field already present on enriched `Team` objects
fetched by the existing Teams data layer. A module-level Promise cache in `data.js`
ensures both sections share a single HTTP request per page load.

## Technical Context

**Language/Version**: JavaScript (ES modules, no transpilation) — same as feature 001

**Primary Dependencies**: Alpine.js v3.14.1 (CDN) — same as feature 001

**Storage**: N/A — no persistence

**Testing**: Manual via Live Server / `http://localhost:8080`

**Target Platform**: Modern evergreen browsers; GitHub Pages static hosting

**Project Type**: Static SPA — new section added to existing `index.html`

**Performance Goals**: Groups section visible within 3 s on broadband; zero redundant
HTTP requests (teams data shared with Teams section via Promise cache)

**Constraints**: Total page weight remains under 200 KB; no backend; no build tools

**Scale/Scope**: 12 groups × 4 teams = 48 team entries, one page load

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static-First, No-Backend | ✅ PASS | Pure browser rendering, no server logic |
| II. Canonical Data Sources | ✅ PASS | Reuses `worldcup.teams.json` — same as Teams section |
| III. Mobile-First | ✅ PASS | Grid: 1 col mobile → 2 col tablet → 3 col desktop |
| IV. Lightweight (<200 KB) | ✅ PASS | Adding ~1.5 KB JS + ~1 KB CSS; total stays under 30 KB |
| V. Time Zone Awareness | N/A | No timestamps in Groups section |

**Complexity Tracking**: No violations. Groups reuses existing data layer entirely.

## Project Structure

### Documentation (this feature)

```text
specs/002-groups-browser/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── groups-state-contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created by /speckit-plan)
```

### Source Code (changes to repository root)

```text
index.html          — add <section id="groups"> markup; add "Groups" nav link
css/main.css        — add group panel grid, team-row styles
js/data.js          — add module-level Promise cache to fetchTeams()
js/groups.js        — new: Alpine.js groupsSection component
```

**Structure Decision**: Additive — Groups Browser slots into the existing single-file
SPA alongside the Teams section. No new directories are needed.

## Phase 0: Research Findings → research.md

See [research.md](research.md) for all decisions.

## Phase 1: Design Artifacts

- [data-model.md](data-model.md) — Group and Team entity shapes
- [contracts/groups-state-contract.md](contracts/groups-state-contract.md) — Alpine component API
- [quickstart.md](quickstart.md) — Runnable validation scenarios
