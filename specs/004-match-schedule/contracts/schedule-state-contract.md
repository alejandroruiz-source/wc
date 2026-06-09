# Contract: scheduleSection Alpine Component

**Feature**: `004-match-schedule` | **Date**: 2026-06-08

## Component Registration

```js
Alpine.data('scheduleSection', () => ({ ... }))
// mounted via: <section x-data="scheduleSection">
```

## State Properties

| Property | Type | Initial | Description |
|---|---|---|---|
| `allMatches` | `EnrichedMatch[]` | `[]` | Full sorted match list from feed |
| `isLoading` | `boolean` | `true` | True while fetch is in progress |
| `hasError` | `boolean` | `false` | True when last fetch failed |
| `errorMessage` | `string` | `''` | User-facing error description |
| `selectedDay` | `string` | `''` | ISO date string of active day filter, or `''` for all days |
| `userTimezone` | `string` | `''` | IANA timezone detected from browser on init |

## Computed Getters

### `availableDays` → `DayOption[]`

Returns all unique match dates in chronological order for populating the `<select>` filter.

```ts
type DayOption = { value: string; label: string }
// value: ISO date string "2026-06-11"
// label: locale string "Thursday, 11 June 2026"
```

Derived from `allMatches` — sorted, deduplicated `date` strings.

### `filteredDayGroups` → `DayGroup[]`

Returns the grouped, filtered match list for rendering.

```ts
type DayGroup = {
  date: string;       // ISO date "2026-06-11"
  label: string;      // "Thursday, 11 June 2026"
  matches: EnrichedMatch[];
}
```

- If `selectedDay` is empty: returns all day groups in chronological order.
- If `selectedDay` is set: returns a single-element array with only that day's group, or an empty array if that day has no matches.

### `hasResults` → `boolean`

`filteredDayGroups.length > 0`

## Methods

### `init()` → `Promise<void>`

Auto-called by Alpine on mount. Detects `userTimezone` via
`Intl.DateTimeFormat().resolvedOptions().timeZone`, then calls `_load()`.

### `_load()` → `Promise<void>`

Sets `isLoading = true`, calls `fetchSchedule()` from `data.js`, sets `allMatches`.
On `FetchError`: sets `hasError = true`, `errorMessage = err.message`.
On generic error: sets `hasError = true`, `errorMessage = 'An unexpected error occurred. Please try again.'`
Always sets `isLoading = false` in `finally`.

### `retry()` → `Promise<void>`

Delegates to `_load()`. Because `fetchSchedule()` clears its cache on rejection,
retry issues a fresh HTTP request.

### `formatLocalTime(utcDate)` → `string`

Formats `utcDate` in `userTimezone` using `Intl.DateTimeFormat`.
Returns `"13:00 CST"` style (hour, minute, short timezone name).
Falls back to UTC if `userTimezone` is empty.

### `formatVenueTime(utcDate, venueTimezone)` → `string`

Formats `utcDate` in `venueTimezone` using `Intl.DateTimeFormat`.
If `venueTimezone` is `null`: returns `"19:00 UTC"`.
Returns same format as `formatLocalTime`.

## EnrichedMatch Shape

See [data-model.md](../data-model.md) for full field list.

Key fields used in the template:

| Field | Used for |
|---|---|
| `round` | Matchday label badge |
| `date` | Day-group key |
| `utcDate` | Time formatting via `formatLocalTime` / `formatVenueTime` |
| `team1`, `team2` | Team names |
| `team1Flag`, `team2Flag` | Flag emoji (empty string for knockout placeholders) |
| `ground` | Venue city display |
| `venueTimezone` | Passed to `formatVenueTime` |
| `group` | Group label (null in knockout) |

## Loading / Error States

Follows the same pattern as `teamsSection` and `groupsSection`:

- `x-show="isLoading"` — spinner + "Loading schedule…" text
- `x-show="hasError && !isLoading"` — error icon, `x-text="errorMessage"`, retry button
- `x-show="!isLoading && !hasError"` — content wrapper

## Day Filter Binding

```html
<select x-model="selectedDay">
  <option value="">All days</option>
  <template x-for="day in availableDays" :key="day.value">
    <option :value="day.value" x-text="day.label"></option>
  </template>
</select>
```
