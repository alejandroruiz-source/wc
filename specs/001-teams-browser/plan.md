# Implementation Plan: Teams Browser

**Branch**: `001-teams-browser` | **Date**: 2026-06-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-teams-browser/spec.md`

## Summary

The Teams Browser section fetches all 48 WC2026 participating teams from the openfootball
public JSON API at runtime and renders them as a filterable, searchable card grid. Cards
are sorted by group (A–L) then alphabetically within each group, showing an emoji flag,
team name, confederation–region label (e.g. "UEFA – Europe"), and group badge. A single
row of confederation chip buttons and a text search box narrow results in real time. The
entire feature runs browser-side with no backend or persistence, deployed as static HTML
on GitHub Pages. Alpine.js v3 drives reactive filter and search state with zero build
tooling required.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (vanilla + Alpine.js v3)

**Primary Dependencies**: Alpine.js v3.x (CDN script tag, ~7 KB gzipped) for reactive
data binding and DOM diffing. No other runtime dependencies.

**Storage**: N/A — no persistence (Constitution Principle I).

**Testing**: Browser-based manual validation per `quickstart.md`; no automated test
framework. Visual regression verified by opening `index.html` via a local HTTP server.

**Target Platform**: Static HTML on GitHub Pages; modern evergreen browsers (Chrome,
Firefox, Safari, Edge — current minus one major version). Viewport minimum: 375 px.

**Project Type**: Static SPA — single `index.html` entry point, Alpine.js reactive
components, modular JS files loaded as ES modules from relative paths.

**Performance Goals**: All 48 team cards visible within 3 s on a 4G connection; search
DOM updates within 200 ms of the last keystroke; total page weight under 200 KB
uncompressed (JS + CSS combined).

**Constraints**: No backend; no persistence; no build step required; all assets either
inline, relative-path local, or loaded from stable CDN URLs.

**Scale/Scope**: 48 teams, 1 external data fetch (openfootball teams.json), up to 6
confederation chips, 1 search input, 1 card grid view.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Pre-Phase 0 | Post-Phase 1 |
|-----------|------|-------------|--------------|
| I. Static-First, No-Backend | No server logic; GitHub Pages deployable | ✅ PASS | ✅ PASS |
| II. Canonical External Data Sources | Fetches only from openfootball teams endpoint | ✅ PASS | ✅ PASS |
| III. Mobile-First, Responsive Design | CSS mobile-first; chips wrap; cards reflow | ✅ PASS | ✅ PASS |
| IV. Lightweight & Minimal Dependencies | Alpine.js ~7 KB gzipped; no build step | ✅ PASS | ✅ PASS |
| V. Time Zone Awareness | N/A — Teams section has no time values | ✅ N/A | ✅ N/A |

No violations. Complexity Tracking table omitted (no gates failed).

## Project Structure

### Documentation (this feature)

```text
specs/001-teams-browser/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── data-contract.md # External API shape contract
│   └── state-contract.md# Alpine component data contract
└── tasks.md             # NOT created here — output of /speckit-tasks
```

### Source Code (repository root)

```text
index.html              # SPA entry point: shell nav + Teams section markup
css/
└── main.css            # Mobile-first styles: cards, chips, search, loading, error
js/
├── config.js           # Confederation→Region map, emoji-flag helpers, constants
├── data.js             # fetch() wrapper; error normalisation for openfootball APIs
└── teams.js            # Alpine.js teams component: filter, search, sort logic
```

**Structure Decision**: Flat static SPA. No build tooling. Alpine.js loaded from
jsDelivr CDN as a `<script defer>` tag in `index.html`. JS files loaded as ES modules
(`<script type="module">`). Future sections (Groups, Schedule) extend `index.html` and
add files under `js/` without restructuring the top-level layout.
