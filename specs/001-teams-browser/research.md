# Research: Teams Browser

**Feature**: `001-teams-browser` | **Date**: 2026-06-08

## Decision 1: UI Framework

**Decision**: Alpine.js v3 (loaded from jsDelivr CDN)

**Rationale**: Alpine.js provides reactive data binding (`x-data`, `x-for`, `x-show`,
`x-model`) directly in HTML markup with zero build tooling. It is ~7 KB gzipped
(well under the 200 KB constitution limit), has no runtime dependencies, and loads
via a single `<script defer>` CDN tag. The `x-for` directive renders the team card
grid from an array; `x-model` binds the search input; `x-on:click` toggles chips.
No virtual DOM overhead, no JSX, no npm — a plain HTML file works immediately.

**Alternatives considered**:
- Vanilla JS: viable but requires manual DOM diffing for reactive search/filter; ~40+
  lines of boilerplate for what Alpine expresses in 5 HTML attributes.
- Preact + HTM: ~5 KB but requires an import map or CDN ESM setup; slightly more
  complex for a project that targets non-technical deployment.
- Vue 3 (CDN): ~34 KB gzipped — heavier than needed; overkill for 48 items.
- React CDN: ~42 KB + ReactDOM — violates Principle IV spirit; no justification.

## Decision 2: CSS Strategy

**Decision**: Custom vanilla CSS — CSS Grid for the card grid, Flexbox for chip row and
card internals; mobile-first media queries.

**Rationale**: Zero dependencies (no CDN required for styles), full control over the
card layout, and the constitution's Principle IV explicitly allows vanilla CSS. The
Teams section UI is simple enough (card grid + chip bar + search box) that a bespoke
~200-line stylesheet is maintainable and produces no unused rules. Mobile-first
breakpoints: base styles target 375 px; one breakpoint at 640 px adds a second card
column; a second breakpoint at 1024 px goes to three or four columns.

**Alternatives considered**:
- Tailwind CSS CDN Play: convenient for prototyping but the Play CDN injects a large
  runtime script unsuitable for production GitHub Pages; purged Tailwind requires a
  build step (violates Principle IV "no build tools required").
- Pico.css: classless, minimal (~10 KB) but opinionated table/form styles conflict with
  the custom card-grid layout needed here.
- Bootstrap 5 CDN: ~50 KB CSS + ~30 KB JS — exceeds justification threshold per
  Principle IV (problem solvable with far fewer lines of vanilla code).

## Decision 3: Flag Display — Emoji Derivation Strategy

**Decision**: Convert the team's ISO 3166-1 alpha-2 country code to a Unicode flag
emoji using Regional Indicator Symbol pairs. Maintain a small FIFA-3-letter →
ISO-2-letter lookup table in `js/config.js` for the WC2026 team set.

**Rationale**: Emoji flags render natively on all target browsers with no image assets
or CDN calls. The openfootball teams.json uses FIFA 3-letter codes (e.g., `"USA"`,
`"BRA"`). A static lookup of 48 entries in `config.js` is negligible in size and
maintenance cost. For unrecognized codes, fall back to a globe emoji (🌐) so no card
is ever blank.

Emoji construction formula:
```
flagEmoji(isoCode) = String.fromCodePoint(
  0x1F1E6 + isoCode.charCodeAt(0) - 65,
  0x1F1E6 + isoCode.charCodeAt(1) - 65
)
```

**Notable mappings** (FIFA code → ISO 3166-1 alpha-2):
- USA → US, BRA → BR, ARG → AR, MEX → MX, CAN → CA
- ENG → GB-ENG (England has no standalone ISO code; use 🏴󠁧󠁢󠁥󠁮󠁧󠁿 or flag of GB 🇬🇧)
- KOR → KR, JPN → JP, AUS → AU, NZL → NZ
- Full table: documented in `js/config.js` alongside the `FIFA_TO_ISO` export.

**Alternatives considered**:
- Flag CDN icon libraries (e.g., flag-icons.css): requires an additional CDN dependency
  and ~individual SVG/PNG fetches per team; violates Principle IV minimalism.
- Inline SVG sprites: feasible but adds ~50+ KB to the HTML for 48 flags.

## Decision 4: Confederation → Region Mapping

**Decision**: Hardcode a `CONFEDERATION_REGION` map in `js/config.js`. Derive the
region label for any team from its confederation acronym at render time.

```js
// js/config.js
export const CONFEDERATION_REGION = {
  UEFA:     'Europe',
  CONMEBOL: 'South America',
  CONCACAF: 'North, Central America & Caribbean',
  CAF:      'Africa',
  AFC:      'Asia',
  OFC:      'Oceania',
};
```

**Rationale**: All 48 WC2026 qualified teams belong to one of these six confederations.
The mapping is stable (FIFA confederations do not change). Hardcoding 6 entries in
`config.js` costs nothing and removes any runtime derivation ambiguity.

**Alternatives considered**:
- Deriving region from a separate API call: unnecessary complexity; no such endpoint
  exists in the openfootball feed.
- Storing region labels in a translation file: overkill for 6 entries and one language.

## Decision 5: openfootball Teams Data Shape

**Decision**: Treat `worldcup.teams.json` as the authoritative team list. Assumed
schema (to be verified on first fetch during implementation):

```jsonc
{
  "name": "World Cup 2026",
  "teams": [
    {
      "name": "United States",
      "code": "USA",            // FIFA 3-letter code
      "group": "A",             // Group letter A–L
      "confederation": "CONCACAF" // FIFA confederation acronym
    }
    // ... 47 more
  ]
}
```

If `confederation` is absent from the feed, fall back to `worldcup.groups.json` to
derive confederation from the group context, or prompt a constitution amendment to
allow a small inline lookup table.

If `group` is absent from `teams.json`, cross-reference with `worldcup.groups.json`
(already an authorised endpoint) to enrich team objects before rendering.

**Alternatives considered**: No alternative data sources are permitted (Constitution
Principle II).

## Decision 6: Sort Implementation

**Decision**: Client-side sort applied once after fetch, before storing teams in Alpine
reactive state. Sort key: `[group letter (A-Z), team name (A-Z)]`.

**Rationale**: 48 items — a one-time `Array.sort()` on fetch completion is imperceptible.
Sorting once and storing sorted order means filter/search operations only need to filter
the pre-sorted array, preserving order without re-sorting on every keystroke.

## NEEDS CLARIFICATION — Resolved

All NEEDS CLARIFICATION items from the spec were resolved during `/speckit-clarify`.
No open items remain.
