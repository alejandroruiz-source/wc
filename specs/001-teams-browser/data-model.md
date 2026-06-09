# Data Model: Teams Browser

**Feature**: `001-teams-browser` | **Date**: 2026-06-08

## Entities

### Team (source: openfootball `worldcup.teams.json`)

Represents a national football team as returned by the openfootball public API.
No fields are persisted; the object lives only in Alpine reactive state during the
browser session.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `name` | string | API | Full team name, e.g. "Argentina" |
| `code` | string | API | FIFA 3-letter code, e.g. "ARG" |
| `group` | string | API | Group letter A–L, e.g. "A" |
| `confederation` | string | API | FIFA acronym, e.g. "CONMEBOL" |
| `region` | string | **Derived** | Human-readable region from `CONFEDERATION_REGION` map |
| `flagEmoji` | string | **Derived** | Unicode flag emoji from `FIFA_TO_ISO` + Regional Indicator formula |
| `isoCode` | string | **Derived** | ISO 3166-1 alpha-2 code looked up via `FIFA_TO_ISO` |

**Derivation rules**:
- `region`: `CONFEDERATION_REGION[team.confederation]` — fallback `"Unknown Region"` if
  confederation not in map (logged as a data warning, card still renders).
- `isoCode`: `FIFA_TO_ISO[team.code]` — fallback `null` if code not in map.
- `flagEmoji`: if `isoCode` is non-null, computed via Regional Indicator formula;
  otherwise `"🌐"` (globe) as neutral placeholder.

**Sort order**: Teams are sorted once after fetch:
1. Primary: `group` ascending (A before B, … L last).
2. Secondary: `name` ascending lexicographically (case-insensitive).

Sorted array is stored in Alpine state and never re-sorted during filtering/search.

**Validation**:
- `name`: must be a non-empty string. Cards with empty names are excluded from display
  and logged as a data warning.
- `code`: must be a 3-character string. Missing code → `isoCode = null` → globe emoji.
- `group`: must be a single uppercase letter A–L. Groups outside this range are treated
  as group "?" and sorted last.
- `confederation`: must be one of the six known FIFA acronyms. Unknown acronym →
  `region = "Unknown Region"`.

### FilterState

Represents the current user-driven filter and search selections. Stored in the Alpine
component's reactive `$data` object; reset when the component is destroyed (navigation
away from Teams section).

| Field | Type | Default | Constraint |
|-------|------|---------|------------|
| `activeConfederation` | `string \| null` | `null` | One of the six confederation acronyms, or `null` (no chip active) |
| `searchQuery` | string | `""` | Trimmed on comparison; leading/trailing whitespace ignored |
| `isLoading` | boolean | `true` | `true` during fetch; `false` after resolution or error |
| `hasError` | boolean | `false` | `true` if fetch fails or response is not parseable JSON |
| `errorMessage` | string | `""` | Human-readable message shown when `hasError` is `true` |

**Derived (computed) values** — not stored, re-evaluated on each Alpine render:
- `filteredTeams`: `allTeams` filtered by `activeConfederation` (if non-null) and
  `searchQuery` (case-insensitive `name.includes()`). Filter is applied to the
  pre-sorted `allTeams` array, preserving sort order.
- `availableConfederations`: distinct `confederation` values from `allTeams`, sorted
  alphabetically, used to render chip buttons. Computed once after fetch completes.
- `hasResults`: `filteredTeams.length > 0`.

### ConfederationConfig (static lookup — `js/config.js`)

Not a runtime entity; a static export that maps FIFA confederation acronyms to
geographic region labels and provides the `FIFA_TO_ISO` lookup table.

```js
// Shape — not stored in state
{
  CONFEDERATION_REGION: { [confederationAcronym: string]: string },
  FIFA_TO_ISO: { [fifaCode: string]: string | null },
}
```

`FIFA_TO_ISO` covers all 48 WC2026 qualified teams. Keys not in the map return
`undefined`; callers treat this as `null` and fall back to the globe emoji.

## State Transitions

```
App opens Teams section
  └─► isLoading = true
        └─► fetch(worldcup.teams.json)
              ├─► SUCCESS: allTeams = sorted array, isLoading = false
              │         User interactions:
              │           tap chip ──► activeConfederation toggled
              │           type in search ──► searchQuery updated
              │           tap Clear ──► activeConfederation = null, searchQuery = ""
              │           filteredTeams recomputed on every render
              └─► FAILURE: hasError = true, errorMessage set, isLoading = false
                        User interaction:
                          tap Retry ──► isLoading = true, hasError = false → re-fetch
```

## Notes

- No entities are written anywhere. There is no create / update / delete lifecycle.
- All derived fields (`region`, `flagEmoji`, `isoCode`) are computed during the
  fetch-completion handler and stored in each team object in `allTeams`. They are not
  recomputed on every render.
- `allTeams` is never mutated after the initial sort-and-enrich step.
