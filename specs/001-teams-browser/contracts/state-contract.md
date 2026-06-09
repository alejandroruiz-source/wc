# State Contract: Alpine.js Teams Component

**Feature**: `001-teams-browser` | **Date**: 2026-06-08

## Component Identity

Alpine.js component registered as `teamsSection` via `Alpine.data('teamsSection', ...)`.
Mounted on the `<section id="teams">` element in `index.html`.

## Data Shape (component `$data`)

```js
{
  // --- Fetched & enriched state (set once after successful fetch) ---
  allTeams: Team[],               // sorted: group ASC, name ASC; enriched with derived fields

  // --- Filter & search state (mutated by user interactions) ---
  activeConfederation: string | null,  // null = no filter; one of 6 confederation acronyms
  searchQuery: string,                 // raw input value; comparison is trimmed + lowercased

  // --- Async state ---
  isLoading: boolean,             // true during fetch
  hasError: boolean,              // true on fetch failure or parse failure
  errorMessage: string,           // non-empty when hasError is true

  // --- Methods ---
  init():        void,            // called by Alpine on mount; triggers initial fetch
  fetchTeams():  Promise<void>,   // performs fetch, enriches data, sets allTeams
  retry():       void,            // resets error state and calls fetchTeams()
  selectChip(confederation: string): void,  // toggles activeConfederation
  clearFilters(): void,           // resets activeConfederation and searchQuery
}
```

## Computed Properties (Alpine `get` or inline expressions)

```js
get filteredTeams(): Team[]
  // Returns allTeams filtered by activeConfederation (if set)
  // AND by searchQuery (case-insensitive name.includes()).
  // Preserves allTeams sort order.

get availableConfederations(): ConfederationChip[]
  // Returns distinct confederation acronyms from allTeams, each paired with its
  // region label from CONFEDERATION_REGION map, sorted alphabetically by acronym.
  // Computed once when allTeams is populated; does not change during a session.

get hasResults(): boolean
  // filteredTeams.length > 0

get isFiltered(): boolean
  // activeConfederation !== null || searchQuery.trim() !== ''
  // Used to show/hide the "Clear" control.
```

## Team Object Shape (after enrichment in `fetchTeams`)

```ts
interface Team {
  name:          string;   // from API
  code:          string;   // from API (FIFA 3-letter)
  group:         string;   // from API, normalised to uppercase single letter or "?"
  confederation: string;   // from API, normalised to uppercase; "UNKNOWN" if absent
  region:        string;   // derived: CONFEDERATION_REGION[confederation] or "Unknown Region"
  isoCode:       string | null; // derived: FIFA_TO_ISO[code] or null
  flagEmoji:     string;   // derived: Unicode flag or "🌐"
}
```

## ConfederationChip Shape

```ts
interface ConfederationChip {
  key:    string;  // confederation acronym (e.g., "UEFA")
  label:  string;  // display string (e.g., "UEFA – Europe")
  active: boolean; // true when this.activeConfederation === key
}
```

## UI Event Bindings

| User Action | Binding | Method called | State change |
|-------------|---------|---------------|--------------|
| Page load | `x-init` | `init()` | isLoading = true → fetchTeams() |
| Tap confederation chip | `x-on:click` | `selectChip(key)` | toggles activeConfederation |
| Type in search box | `x-model` | — | searchQuery updated on each keystroke |
| Tap "Clear" button | `x-on:click` | `clearFilters()` | activeConfederation = null, searchQuery = "" |
| Tap "Retry" button | `x-on:click` | `retry()` | hasError = false, isLoading = true → fetchTeams() |

## Visibility Rules (Alpine `x-show` / `x-if`)

| Element | Shown when |
|---------|------------|
| Loading indicator | `isLoading === true` |
| Error message + Retry button | `hasError === true && !isLoading` |
| Confederation chip bar + Search box | `!isLoading && !hasError` |
| Team card grid | `!isLoading && !hasError && hasResults` |
| "No results" message | `!isLoading && !hasError && !hasResults` |
| "Clear" button | `!isLoading && !hasError && isFiltered` |
