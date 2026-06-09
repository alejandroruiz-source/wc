<!--
SYNC IMPACT REPORT
==================
Version change: NEW → 1.0.0 (initial ratification)

Modified principles: N/A (all new)

Added sections:
  - Core Principles (5 principles)
  - Technology Constraints
  - Deployment & Distribution
  - Governance

Removed sections: N/A

Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check section is generic; no changes required
  ✅ .specify/templates/spec-template.md — Generic structure; aligned with principle constraints
  ✅ .specify/templates/tasks-template.md — Generic task phases; aligned with SPA/static-first approach

Follow-up TODOs: None — all fields resolved from world-cup.md and project context.
-->

# WC2026 Constitution

## Core Principles

### I. Static-First, No-Backend Architecture

The application MUST run entirely in the browser with no server-side logic and no backend
services. All data fetching, filtering, rendering, and state management MUST occur client-side.

- No persistence layer is permitted: no server databases, no localStorage for data, no
  IndexedDB, no cookies carrying application state.
- The entire application MUST be deployable as a set of static HTML/CSS/JS files with no
  server configuration (e.g., GitHub Pages).
- Any "API calls" MUST target publicly accessible, read-only external URLs — no proxying,
  no auth tokens embedded in source, no server-side relay.

### II. Canonical External Data Sources

All football data MUST be sourced exclusively from the openfootball public JSON resources.
No data duplication, scraping from other origins, or hardcoded datasets are permitted.

Authoritative endpoints:
- **Teams**: `https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.teams.json`
- **Groups**: `https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.groups.json`
- **Schedule**: `https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json`

Data MUST be fetched at runtime. In-memory caching within a single page session is
acceptable; persisting fetched data across sessions is not.

### III. Mobile-First, Responsive Design

Every view and component MUST be designed for mobile screens first, then scaled up to
tablet and desktop breakpoints.

- Touch interactions (tap, swipe) MUST be fully supported on all interactive elements.
- Layout MUST reflow gracefully across viewport sizes without horizontal scrolling.
- No feature may be desktop-only; all three sections (Teams, Groups, Schedule) MUST be
  fully functional and usable on a small-screen mobile device.

### IV. Lightweight & Minimal Dependencies

The application MUST use a lightweight web framework that supports modern, reactive UI
patterns. Heavy full-stack frameworks (Angular, full React with build pipeline, etc.) are
prohibited unless the bundle size remains comparable to lightweight alternatives.

- Preferred options: Alpine.js, Preact, Svelte (compiled to static), Lit, or vanilla JS.
- Total page-load weight SHOULD remain under 200 KB (uncompressed JS + CSS).
- Dependencies MUST be justified; each added library must solve a problem that cannot
  be solved cleanly with 20 or fewer lines of vanilla code.
- No build tools are required; if a build step is used, it MUST produce self-contained
  static output with no runtime server dependency.

### V. Time Zone Awareness (NON-NEGOTIABLE)

The Schedule section MUST display every match time in two time zones simultaneously:
the **user's local time** (detected via browser `Intl` API) and the **match location's
local time** (derived from venue/city data in the schedule feed).

- Time zone detection MUST use `Intl.DateTimeFormat().resolvedOptions().timeZone` or
  equivalent browser-native API — no third-party geolocation services.
- Match location time zones MUST be mapped from the city/venue fields in the schedule
  data; a hardcoded lookup table for 2026 host cities (USA, Canada, Mexico) is acceptable.
- Ambiguous or missing venue data MUST fall back to displaying UTC with a visible label,
  never silently showing a wrong time.

## Technology Constraints

- **Runtime target**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — current
  minus one major version). No IE11 support required.
- **Framework**: Lightweight only (see Principle IV). Choice MUST be documented in
  `plan.md` under Technical Context before implementation begins.
- **Styling**: Any CSS approach (utility-first, component, vanilla) is acceptable as long
  as it is mobile-first and produces a visually polished result.
- **Flag icons**: MUST be sourced from a public CDN, an inline SVG sprite, or emoji —
  never fetched individually from an unversioned path that could break.
- **No build-time secrets**: No API keys, tokens, or credentials of any kind. All external
  URLs used in the app MUST be public and unauthenticated.

## Deployment & Distribution

- **Target host**: GitHub Pages (static file serving only).
- **Entry point**: `index.html` at the repository root (or `docs/index.html` if configured
  for GitHub Pages `docs/` mode).
- **CI/CD**: Deployment MUST be achievable via a simple `git push` to the configured
  Pages branch, with no required external CI pipeline (though one may be added optionally).
- **Assets**: All JS/CSS assets MUST be either inline, relative-path local files, or
  loaded from stable public CDN URLs with integrity hashes where feasible.

## Governance

This constitution supersedes all prior practices and informal decisions for the WC2026
project. All feature implementation MUST pass the Constitution Check in `plan.md` before
Phase 0 research begins, and MUST be re-verified after Phase 1 design.

- Amendments require: (1) a documented rationale, (2) a version bump following semantic
  versioning rules, and (3) propagation of changes to all affected templates.
- Complexity violations (e.g., adding a backend, adding persistence) MUST be recorded in
  the Complexity Tracking table in `plan.md` with explicit justification.
- All pull requests MUST verify compliance with the five Core Principles before merge.
- Simplicity is the default; any deviation from the lightweight, static-first approach
  requires written justification traceable to a user requirement in `spec.md`.

**Version**: 1.0.0 | **Ratified**: 2026-06-08 | **Last Amended**: 2026-06-08
