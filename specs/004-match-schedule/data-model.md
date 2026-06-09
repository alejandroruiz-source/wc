# Data Model: Match Schedule

**Date**: 2026-06-08 | **Feature**: `004-match-schedule`

## Source

Feed: `https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json`

Top-level shape: `{ "name": "World Cup 2026", "matches": Match[] }`

---

## Raw Match (from feed)

| Field | Type | Present | Notes |
|---|---|---|---|
| `round` | string | Always | e.g., `"Matchday 1"`, `"Round of 16"`, `"Final"` |
| `date` | string | Always | ISO date, venue-local: `"2026-06-11"` |
| `time` | string | Always | Custom format: `"HH:MM UTC±N"`, e.g., `"13:00 UTC-6"` |
| `team1` | string | Always | Country name, or knockout placeholder like `"2A"`, `"W74"` |
| `team2` | string | Always | Same as `team1` |
| `group` | string | Group stage only | `"Group A"` … `"Group L"` |
| `num` | integer | Knockout only | Match number 73–102 |
| `ground` | string | Always | Venue city, e.g., `"New York/New Jersey (East Rutherford)"` |

---

## Enriched Match (after client-side processing)

The raw feed match is enriched into this shape before use in the Alpine component:

| Field | Type | Derived from | Notes |
|---|---|---|---|
| `round` | string | `raw.round` | Pass-through |
| `date` | string | `raw.date` | ISO date string; used as day-group key |
| `utcDate` | Date | `parseMatchTime(raw.date, raw.time)` | UTC timestamp; used for all timezone display |
| `team1` | string | `raw.team1` | May be a placeholder code in knockout stage |
| `team2` | string | `raw.team2` | Same |
| `team1Flag` | string | `flagEmoji(fifaToIso(raw.team1))` | Empty string if team is a placeholder code |
| `team2Flag` | string | same | |
| `group` | string \| null | `raw.group \|\| null` | null for knockout matches |
| `matchNum` | number \| null | `raw.num \|\| null` | null for group-stage matches |
| `ground` | string | `raw.ground` | Pass-through |
| `venueTimezone` | string \| null | `lookupVenueTimezone(raw.ground)` | IANA tz id or null → display as UTC |

---

## DayGroup (component view model)

Groups all matches on the same calendar date. The date key is the raw ISO date string from
the feed (venue-local), not a UTC-derived date.

| Field | Type | Notes |
|---|---|---|
| `date` | string | ISO date string: `"2026-06-11"` |
| `label` | string | Human-readable: `"Thursday, 11 June 2026"` |
| `matches` | EnrichedMatch[] | All matches on this date, sorted by `utcDate` ascending |

---

## `parseMatchTime(dateStr, timeStr)` — Algorithm

Input: `dateStr = "2026-06-11"`, `timeStr = "13:00 UTC-6"`

```
1. Split timeStr on ' ': ["13:00", "UTC-6"]
2. Parse hours/minutes: h=13, m=0
3. Parse offset: parseInt("-6") = -6
4. UTC = local − offset → h_utc = 13 − (−6) = 19
5. Return Date.UTC(2026, 5, 11, 19, 0)   // month is 0-indexed
```

Edge case: UTC hours ≥ 24 → wrap to next day (handled by `Date.UTC` automatically).

---

## `lookupVenueTimezone(ground)` — Algorithm

Input: `ground = "New York/New Jersey (East Rutherford)"`

```
1. Iterate Object.keys(VENUE_TIMEZONES)
2. For each keyword k: if ground.includes(k) → return VENUE_TIMEZONES[k]
3. If no keyword matches → return null (displayed as UTC with label)
```

`VENUE_TIMEZONES` is defined in `js/config.js` (see research.md Decision 3 for full table).

---

## Team Flag Derivation for Schedule Matches

In the group stage, `team1`/`team2` are country names matching `teams.json` entries (e.g.,
`"Mexico"`, `"South Korea"`). In the knockout stage they are placeholder codes (`"2A"`,
`"W74"`).

**Strategy**: attempt to look up the team name against the FIFA code-to-ISO mapping in
`config.js`; if not found (placeholder), use an empty string and omit the flag span.
A separate helper `teamFlagFromName(name)` handles this lookup by name rather than code.

Alternatively, the flag lookup can be deferred: show team names only for knockout
placeholders and accept that flag emojis won't appear until teams are determined.
This is acceptable behaviour as the tournament progresses.
