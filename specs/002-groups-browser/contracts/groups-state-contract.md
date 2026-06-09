# State Contract: Alpine.js Groups Component

**Feature**: `002-groups-browser` | **Date**: 2026-06-08

## Component Identity

Alpine.js component registered as `groupsSection` via `Alpine.data('groupsSection', ...)`.
Mounted on the `<section id="groups">` element in `index.html`.
Registered in `js/groups.js`, loaded as a `<script type="module">` before the Alpine CDN script.

## Data Shape (component `$data`)

```js
{
  // --- Fetched & enriched state (set once after successful fetch) ---
  allTeams: Team[],   // same enriched Team[] returned by fetchTeams(); sorted group ASC, name ASC

  // --- Async state ---
  isLoading: boolean,      // true during fetch
  hasError:  boolean,      // true on fetch failure or parse failure
  errorMessage: string,    // non-empty when hasError is true

  // --- Methods ---
  init():   Promise<void>,   // called by Alpine on mount; triggers initial fetch
  retry():  Promise<void>,   // resets error state and re-calls fetchTeams()
}
```

## Computed Properties

```js
get groupedTeams(): Array<{ id: string, teams: Team[] }>
  // Partitions allTeams by team.group, sorts groups alphabetically (A → L),
  // sorts teams within each group by name ascending (case-insensitive).
  // Teams with group === '?' are omitted.
  // Returns [] when allTeams is empty (before or during load).

get hasGroups(): boolean
  // groupedTeams.length > 0
  // Used to guard the panel grid against empty renders.
```

## Team Object Shape

See `specs/001-teams-browser/contracts/state-contract.md` for the full `Team` interface.
The Groups component uses: `name`, `flagEmoji`, `confederation`, `region`, `group`, `code`.

## Data Layer: fetchTeams() Caching Contract

`fetchTeams()` in `js/data.js` MUST be updated to:
1. Store the in-flight/resolved Promise in a module-level variable (`_teamsPromise`)
2. Return the same Promise on subsequent calls within the same page load
3. Clear `_teamsPromise` when the fetch rejects (so retry re-fetches correctly)

```js
// Pseudocode — implementation in js/data.js
let _teamsPromise = null;
export function fetchTeams() {
  if (!_teamsPromise) {
    _teamsPromise = _doFetch().catch(err => { _teamsPromise = null; throw err; });
  }
  return _teamsPromise;
}
```

This contract ensures zero redundant HTTP requests when both `teamsSection` and
`groupsSection` call `fetchTeams()` simultaneously on page load.

## UI Event Bindings

| User Action | Binding | Method called | State change |
|-------------|---------|---------------|--------------|
| Page load | `x-init` | `init()` | isLoading = true → fetchTeams() → allTeams set |
| Tap "Retry" button | `x-on:click` | `retry()` | hasError = false, isLoading = true → fetchTeams() |

## Visibility Rules (Alpine `x-show`)

| Element | Shown when |
|---------|------------|
| Loading indicator | `isLoading === true` |
| Error message + Retry button | `hasError === true && !isLoading` |
| Group panel grid | `!isLoading && !hasError && hasGroups` |

## Section Navigation

The `<header>` navigation MUST include a "Groups" link pointing to `#groups`:

```html
<a href="#groups" class="nav-link">Groups</a>
```

The existing "Teams" link remains; no active-state toggling is required for the MVP.
