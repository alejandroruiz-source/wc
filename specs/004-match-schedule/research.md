# Research: Match Schedule

**Date**: 2026-06-08 | **Feature**: `004-match-schedule`

## Decision 1: Schedule Data Shape

**Decision**: The `worldcup.json` feed is a flat array of 102 match objects under the `matches` key.
Each match has: `round`, `date`, `time`, `team1`, `team2`, `ground`, and optionally `group`
(group-stage only) or `num` (knockout only). There are no score or result fields — this is a
pre-tournament fixture list.

**Rationale**: Direct inspection of the feed endpoint confirms the flat structure. No nesting
by round or group exists at the JSON level; all grouping must be done client-side.

**Alternatives considered**: The `worldcup.groups.json` endpoint was considered for group
references but is not needed — the schedule already carries the `group` field inline.

---

## Decision 2: Time String Parsing

**Decision**: The `time` field uses the non-standard format `"HH:MM UTC±N"` (e.g.,
`"13:00 UTC-6"`, `"20:00 UTC-7"`, `"15:00 UTC-4"`). All observed offsets in the 2026 feed
are whole-hour integers from −8 to −3.

**Rationale**:
- Split on space: `[timeStr, offsetStr]`
- Parse offset: `parseInt(offsetStr.replace('UTC', ''))` → e.g., −6
- Construct UTC timestamp: `Date.UTC(year, month-1, day, hours - offset, minutes)`
  (subtracting a negative offset adds hours — UTC = local + |offset| for western zones)
- This gives a proper `Date` object that `Intl.DateTimeFormat` can format in any timezone

The `date` field (ISO `"YYYY-MM-DD"`) represents the **venue-local** calendar date and is
used as the grouping key for day groups. UTC-derived dates are used only for time display.

**Alternatives considered**: Treating the `time` string as UTC directly (wrong — times in the
feed are local-to-venue). Using a third-party date library (rejected: overkill for 15 lines
of parsing; violates Principle IV lightweight constraint).

---

## Decision 3: Venue Timezone Lookup

**Decision**: A hardcoded lookup table `VENUE_TIMEZONES` in `config.js` maps keyword
substrings from the `ground` field to IANA timezone identifiers. If no match is found, the
display falls back to UTC with a visible label (Constitution Principle V requirement).

**Rationale**: The 2026 WC has exactly 16 host venues across 3 countries. A complete,
finite lookup is more reliable than geolocation APIs (which would require third-party
dependencies) and more accurate than deriving timezone from UTC offset (which is ambiguous
during DST). IANA identifiers work directly with `Intl.DateTimeFormat`.

**2026 host city → IANA timezone mapping**:

| Ground keyword | IANA timezone |
|---|---|
| `"New York"` | `America/New_York` |
| `"Los Angeles"` | `America/Los_Angeles` |
| `"Dallas"` | `America/Chicago` |
| `"San Francisco"` / `"Santa Clara"` | `America/Los_Angeles` |
| `"Miami"` | `America/New_York` |
| `"Seattle"` | `America/Los_Angeles` |
| `"Boston"` | `America/New_York` |
| `"Atlanta"` | `America/New_York` |
| `"Kansas City"` | `America/Chicago` |
| `"Houston"` | `America/Chicago` |
| `"Philadelphia"` | `America/New_York` |
| `"Toronto"` | `America/Toronto` |
| `"Vancouver"` | `America/Vancouver` |
| `"Mexico City"` | `America/Mexico_City` |
| `"Guadalajara"` | `America/Mexico_City` |
| `"Monterrey"` | `America/Monterrey` |

**Implementation approach**: Iterate `Object.keys(VENUE_TIMEZONES)`, check if
`ground.includes(keyword)`. Return first match; fall back to `null` (displayed as UTC).

**Alternatives considered**: UTC offset from the feed itself (ambiguous during DST — a match
in New York in June is UTC-4, but in November would be UTC-5; the offset alone doesn't
identify the IANA zone). Geolocation API (requires third-party dependency, violates IV).

---

## Decision 4: Day Filter UX

**Decision**: A `<select>` dropdown listing all unique match dates in chronological order,
with an "All days" option at the top that resets the filter. The selected value is the raw
`date` string (ISO `"YYYY-MM-DD"`), and the displayed label is the full locale date string.

**Rationale**: WC2026 has matches across ~35 calendar days (June 11 – July 19). Chip buttons
(as used for confederation filter in Teams) would be impractical at this scale — 35 chips
would overflow or require horizontal scrolling. A `<select>` is compact, accessible, and
familiar across all devices including mobile.

**Alternatives considered**: A date-picker `<input type="date">` (less predictable cross-browser
styling; user needs to type/scroll to specific dates rather than select from a list of actual
match dates). Pagination by matchday round (not a calendar date — mixes group matchdays with
knockout rounds; less intuitive for daily planning).

---

## Decision 5: Component Architecture

**Decision**: Add `scheduleSection` Alpine component in a new `js/schedule.js` module.
Add `fetchSchedule()` and schedule-specific helpers to `js/data.js`. Add `VENUE_TIMEZONES`
lookup to `js/config.js`.

**Rationale**: Mirrors the existing `teamsSection` / `groupsSection` pattern exactly.
`fetchSchedule()` uses the same module-level Promise cache (`let _schedulePromise = null`)
so that concurrent `init()` calls share one HTTP request. Locale timezone detection
(`Intl.DateTimeFormat().resolvedOptions().timeZone`) is called once per component init and
stored in component state.

**Alternatives considered**: Fetching schedule data inside the component directly (would
bypass the cache, causing duplicate requests if the component is ever unmounted/remounted).
A separate `data-schedule.js` file (unnecessary split; `data.js` is the established
single fetch layer for this SPA).
