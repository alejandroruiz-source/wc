# Quickstart: Groups Browser Validation

**Feature**: `002-groups-browser` | **Date**: 2026-06-08

## Prerequisites

- Modern browser (Chrome, Firefox, Safari, or Edge — current or prior major version)
- Local HTTP server (required for `fetch()` — see Teams feature quickstart for setup)
- Internet access (fetches from `raw.githubusercontent.com`)
- The Teams section (feature 001) must be implemented and working — Groups reuses its data layer

## Local Server Setup

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# VS Code: right-click index.html → "Open with Live Server"
```

Open `http://localhost:8080` and scroll to the Groups section.

## Validation Scenarios

### US1 — Browse All Groups

**Setup**: Open `http://localhost:8080`. Scroll to the Groups section below the Teams section.

**Steps**:

1. Observe a loading indicator while groups are loading.
2. Once loaded, count the group panels — expect **12 panels** labelled "Group A" through "Group L".
3. Verify panels are in alphabetical order: A, B, C, … L (left-to-right, top-to-bottom).
4. Open Group A — confirm it shows **4 teams** with flag emoji, name, and confederation–region label.
5. Verify all 12 panels × 4 teams = **48 team entries** total (same 48 teams as the Teams section, none repeated).
6. Inspect a team entry — confirm it shows:
   - Flag emoji (not 🌐)
   - Team name (not empty)
   - Confederation–region label (e.g. "UEFA – Europe")

**Expected outcome**: 12 group panels, 4 teams each, all fields populated, in alphabetical order.

---

### Loading State

**Steps**:

1. Open DevTools → Network → set throttling to "Slow 3G".
2. Hard-refresh the page.
3. While loading, verify a spinner or loading message appears in the Groups section.
4. After data loads, confirm the loading indicator disappears and group panels appear.

**Expected outcome**: Loading indicator visible during fetch; panels render after fetch completes.

---

### Error & Retry

**Steps**:

1. Open DevTools → Network → set "Offline".
2. Hard-refresh the page.
3. Wait up to 5 seconds — confirm an error message and a "Retry" button appear in the
   Groups section (and independently in the Teams section).
4. Re-enable network in DevTools.
5. Tap "Retry" in the Groups section — group panels render normally.

**Expected outcome**: Error state shown when offline; Retry restores full view.

---

### Single HTTP Request (Data Sharing)

**Steps**:

1. Open DevTools → Network → filter by "worldcup.teams.json".
2. Hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R to bypass browser cache).
3. Watch the Network tab while both sections load.
4. Count how many times `worldcup.teams.json` is requested.

**Expected outcome**: Exactly **1 request** for `worldcup.teams.json` — both the Teams
section and the Groups section share the same fetch result.

---

### Mobile Responsiveness Check

**Setup**: Open DevTools → Toggle Device Toolbar → select **iPhone SE (375 × 667)**.

**Steps**:

1. Verify no horizontal scroll bar on the Groups section.
2. Verify group panel labels ("Group A", etc.) are readable.
3. Verify each team row (flag + name + confederation) fits in a single panel width without
   overflow or truncation that hides required information.
4. Tap "Retry" button — verify tap target is large enough to activate reliably (≥ 44 px height).

**Expected outcome**: Fully functional at 375 px; no horizontal overflow; readable team rows.

---

## Quick Smoke Test (all scenarios in ~2 minutes)

1. Load page → 12 group panels visible ✓
2. Count teams in Group A → 4 teams ✓
3. Count total entries → 48 ✓
4. Each team row shows flag, name, confederation ✓
5. Go offline → error + Retry appears ✓
6. Re-enable network, tap Retry → panels reload ✓
7. DevTools Network → 1 request for teams.json ✓
8. DevTools 375 px → no horizontal scroll ✓

All steps pass → feature is ready for review.
