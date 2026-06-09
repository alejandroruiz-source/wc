# Quickstart: Match Schedule Validation

**Feature**: `004-match-schedule` | **Date**: 2026-06-08

## Prerequisites

- A local HTTP server serving the repo root (e.g., `python -m http.server 8080` or Live Server)
- A modern browser with DevTools
- The `003-match-schedule` or `004-match-schedule` branch checked out

## Validation Scenarios

### Scenario 1 — Schedule loads and renders (US1 core)

1. Open `http://localhost:8080` in a fresh browser tab
2. Scroll to the **Schedule** section
3. **Expect**: spinner appears briefly, then day groups render
4. **Expect**: at least 35 date group headers visible (one per match day from ~June 11 to July 19)
5. **Expect**: total match count = 102 (count `<article class="match-card">` elements)
6. **Expect**: each match row shows two team names, a matchday badge, and the venue city

### Scenario 2 — Dual timezone display (Constitution Principle V)

1. With the schedule loaded, find any group-stage match
2. **Expect**: two time values displayed side-by-side — one labelled with your local timezone
   abbreviation (e.g., "14:00 BST"), one labelled with the venue city (e.g., "Mexico City · 13:00 CST")
3. Change your browser timezone: DevTools → Sensors → Override timezone (e.g., set to "Asia/Tokyo")
4. Hard-refresh (Ctrl+Shift+R)
5. **Expect**: local time column updates to JST times; venue city times remain unchanged
6. **Expect**: a match listed as "13:00 UTC-6" in the feed shows local time = 02:00 JST next day ±1h

### Scenario 3 — Day filter (US2)

1. With the schedule loaded, find the day `<select>` control
2. Select a specific date (e.g., "Thursday, 11 June 2026")
3. **Expect**: only matches on June 11 are shown; all other day groups disappear
4. **Expect**: the match count shown is ≤ 8 (max matches per day in group stage)
5. Select "All days" from the dropdown
6. **Expect**: all day groups reappear

### Scenario 4 — Empty day filter result

1. With the schedule loaded, open the day `<select>`
2. Note that only dates with actual matches appear as options
3. **Verify**: no date option appears that yields zero matches when selected
   (available days are derived from the data, not a calendar range)

### Scenario 5 — Error state and retry

1. Open DevTools → Network → set to "Offline"
2. Hard-refresh (`Ctrl+Shift+R`)
3. **Expect**: loading spinner appears, then error state shows with a user-friendly message
   and a "Try Again" button
4. Set Network back to "Online"
5. Click "Try Again"
6. **Expect**: schedule loads successfully (proves Promise cache clears on error)

### Scenario 6 — Single HTTP request (cache verification)

1. Open DevTools → Network tab, filter by `worldcup.json`
2. Hard-refresh (`Ctrl+Shift+R`)
3. Wait for full load
4. **Expect**: exactly **1** network request to `worldcup.json` — not 2 or more
   (both `scheduleSection` and any future concurrent callers share one in-flight Promise)

### Scenario 7 — Mobile layout

1. Open DevTools → Toggle device toolbar, select "iPhone SE" (375 × 667)
2. Scroll through the Schedule section
3. **Expect**: no horizontal scrollbar; match rows reflow cleanly
4. **Expect**: both time columns remain readable (may stack vertically on narrow screens)
5. **Expect**: the day `<select>` is tappable and shows the native OS picker

### Scenario 8 — UTC fallback for unknown venue

If any match in the feed has a `ground` value not covered by `VENUE_TIMEZONES`:

1. Find the match in the rendered schedule
2. **Expect**: venue time column shows time + "UTC" label, not blank or incorrect timezone

## Reference

- Data model: [data-model.md](data-model.md)
- Component API: [contracts/schedule-state-contract.md](contracts/schedule-state-contract.md)
- Architecture decisions: [research.md](research.md)
