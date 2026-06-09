# Quickstart: Teams Browser Validation

**Feature**: `001-teams-browser` | **Date**: 2026-06-08

## Prerequisites

- A modern browser (Chrome, Firefox, Safari, or Edge — current or prior major version)
- A local HTTP server (required for `fetch()` to work with `file://` protocol; see below)
- Internet access (the app fetches data from `raw.githubusercontent.com`)

## Local Server Setup

The app fetches from an external URL, so opening `index.html` directly via `file://`
will trigger a CORS block. Use any simple local server:

```bash
# Python 3 (available on most systems)
python -m http.server 8080

# Node.js (if installed)
npx serve .

# VS Code Live Server extension: right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8080` in your browser.

## Validation Scenarios

### US1 — Browse All Teams (P1)

**Setup**: Open `http://localhost:8080` and navigate to the Teams section.

**Steps**:
1. Note a loading indicator is displayed immediately.
2. Wait for cards to appear (should be within 3 s on a 4G connection or faster LAN).
3. Count the visible team cards — expect **48 cards**.
4. Verify cards are ordered: Group A teams first (alphabetically), then Group B, …, Group L last.
5. Inspect one card — confirm it shows: team name, flag emoji, confederation–region label (e.g. "UEFA – Europe"), and group badge.

**Expected outcome**: 48 team cards visible, ordered by group then name, all fields
populated, no broken or empty cards.

**Error path**: Disconnect from the internet, refresh the page. A clear error message
and a "Retry" button must appear within 5 s. Reconnect, tap Retry — cards load normally.

---

### US2 — Filter by Confederation (P2)

**Setup**: Teams section loaded with all 48 teams visible.

**Steps**:
1. Locate the confederation chip bar above the team grid.
2. Count the chips — expect **6 chips** (UEFA – Europe, CONMEBOL – South America,
   CONCACAF – North/Central America & Caribbean, CAF – Africa, AFC – Asia, OFC – Oceania).
3. Tap the **"UEFA – Europe"** chip.
   - Verify the chip appears visually active/selected.
   - Verify only UEFA teams are shown. UEFA has 16 spots in WC2026; card count should
     update accordingly.
4. Tap the **"UEFA – Europe"** chip again.
   - Verify all 48 teams are restored.
   - Verify no chip appears active.
5. Tap any chip, then tap **"Clear"** — verify all 48 teams return and no chip is active.
6. Tap a chip that maps to a confederation with very few teams (e.g., OFC – Oceania,
   expected ≤2 teams) — verify the card count drops and no "empty grid" is shown; just
   fewer cards.

**Expected outcome**: Chip selection filters cards to the chosen confederation; re-tap
or Clear restores all teams. Card order (group then name) is preserved within the
filtered set.

---

### US3 — Search by Name (P3)

**Setup**: Teams section loaded with all 48 teams visible, no chip active.

**Steps**:
1. Click/tap the search box and type **"bra"** (partial, lowercase).
   - Verify cards update with each keystroke.
   - Verify "Brazil" appears in results (case-insensitive match).
   - Verify teams without "bra" in their name are hidden.
2. Clear the search box.
   - Verify all 48 teams are restored immediately.
3. Activate the **"CONMEBOL – South America"** chip, then type **"arg"** in the search box.
   - Verify only CONMEBOL teams whose names contain "arg" are shown (should be "Argentina").
4. Clear the search box — verify CONMEBOL teams return (chip still active).
5. Tap Clear button — verify all 48 teams return.
6. Type a string that matches no team name, e.g. **"zzz"**.
   - Verify a "no teams found" message is displayed instead of an empty grid.

**Expected outcome**: Search filters in real time (≤200 ms per keystroke); combines with
active confederation chip; clear restores prior state; no-results message shows when
applicable.

---

### Mobile Responsiveness Check

**Setup**: Open DevTools → Toggle Device Toolbar → select **iPhone SE (375 × 667)**.

**Steps**:
1. Verify the Teams section renders with no horizontal scroll bar.
2. Verify team cards are legible (name and flag visible without truncation).
3. Verify confederation chips are accessible — they may wrap to multiple rows but MUST
   NOT require horizontal scrolling of the chip bar itself.
4. Tap a chip and a search box — verify tap targets are large enough to activate
   reliably (≥44 px height).

**Expected outcome**: Fully functional on 375 px viewport; no horizontal overflow.

---

## Quick Smoke Test (all scenarios in ~2 minutes)

1. Load page → 48 cards visible ✓
2. Tap UEFA chip → fewer cards, chip active ✓
3. Tap chip again → 48 cards, chip inactive ✓
4. Type "bra" in search → Brazil visible ✓
5. Clear search → 48 cards ✓
6. Tap Clear → 48 cards, no chip active ✓
7. Type "zzz" → "no teams found" message ✓
8. Open DevTools → 375 px → no horizontal scroll ✓

All steps pass → feature is ready for review.
