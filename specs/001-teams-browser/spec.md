# Feature Specification: Teams Browser

**Feature Branch**: `001-teams-browser`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Build the first feature from the MVP list — Teams section showing all participating teams as cards with filtering by continent/confederation and search by name."

## Clarifications

### Session 2026-06-08

- Q: Default sort order for the 48-team grid → A: By group (A–L), then alphabetical by team name within each group
- Q: Filter control UI type → A: Chip/pill buttons (touch-friendly, always visible, no dropdown required)
- Q: Continent vs. confederation as separate filters → A: Single combined confederation filter; each label shows the confederation acronym and its geographic region (e.g., "UEFA – Europe"). Cards display the same combined label. Two separate filters are redundant because each team belongs to exactly one confederation which maps to exactly one region.
- Q: Flag display method → A: Emoji flags (unicode flag emoji derived from the team's country code; zero dependencies, universal browser support)
- Q: Network error retry behavior → A: Manual retry button (single visible button the user taps/clicks to re-fetch; no automatic retry)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse All Teams (Priority: P1)

A visitor opens the Teams section and immediately sees all 48 World Cup 2026 participating
teams displayed as cards, ordered by group (Group A first, then B, etc.) and alphabetically
within each group. Each card shows the team's name, confederation and region (e.g.,
"UEFA – Europe"), group assignment, and an emoji flag. No prior action is needed to
see the full list.

**Why this priority**: This is the core value proposition of the Teams section. Without
seeing all teams in a predictable order, no other filtering or search capability delivers
value. It is the entry point for every user interacting with this section.

**Independent Test**: Open the Teams section — all teams load and are visible as cards
ordered by group, without any user action beyond navigation. Delivers a complete, usable
view of all World Cup 2026 participants.

**Acceptance Scenarios**:

1. **Given** the user opens the Teams section, **When** team data loads successfully,
   **Then** all participating teams are displayed as cards ordered by group (A–L) then
   alphabetically within each group, each card showing name, confederation–region label,
   group assignment, and emoji flag.
2. **Given** the Teams section is open, **When** team data is being fetched,
   **Then** a loading indicator is visible so the user knows content is on its way.
3. **Given** the Teams section is open, **When** the data source is unreachable,
   **Then** a clear error message is shown with a manual retry button, and no broken or
   empty cards are displayed.

---

### User Story 2 - Filter Teams by Confederation (Priority: P2)

A visitor wants to see only the teams from a specific football confederation (and its
associated geographic region). They tap a confederation chip — one of up to six pill
buttons displayed above the team grid — to instantly narrow the cards to that grouping.
Tapping the active chip again, or tapping "Clear", removes the filter.

**Why this priority**: Filtering by confederation is the primary navigation aid in a list
of 48 teams. It reduces cognitive load and helps fans of a specific region find relevant
teams quickly. It builds directly on the P1 browse experience.

**Independent Test**: With all teams visible, tap any confederation chip — only teams
from that confederation are shown. Tap the same chip again (or the clear control) — all
48 teams return. Fully testable without any search interaction.

**Acceptance Scenarios**:

1. **Given** all teams are displayed, **When** the user taps a confederation chip,
   **Then** only teams belonging to that confederation are shown, the chip appears
   selected/active, and the visible card count updates.
2. **Given** a confederation chip is active, **When** the user taps the same chip again
   or taps the "Clear" control, **Then** all 48 teams are displayed again and no chip
   appears selected.
3. **Given** a confederation chip is active, **When** no teams in that confederation
   are present in the data, **Then** a "no teams match your filter" message is shown
   instead of an empty grid.

---

### User Story 3 - Search Teams by Name (Priority: P3)

A visitor knows which team they are looking for and types part of its name into a search
box. The displayed cards update in real time to show only teams whose names match the
typed text. Search works alongside any active confederation chip filter.

**Why this priority**: Direct name search is the fastest path to finding a specific team.
It complements confederation filtering (region-based) and rounds out the navigation
options for the Teams section.

**Independent Test**: Type a partial team name — cards update within 200ms to show only
matching teams. Clear the search — all teams (or filtered subset) return. Works on a
mobile touch keyboard without any filter active.

**Acceptance Scenarios**:

1. **Given** all teams are displayed, **When** the user types a team name (or partial
   name) into the search box, **Then** only teams whose names contain that text
   (case-insensitive) are shown, updating with each keystroke.
2. **Given** a confederation chip is active and the user types in the search box,
   **When** results are evaluated, **Then** only teams matching both the active
   confederation and the search text are shown.
3. **Given** the search box contains text, **When** the user clears the search box,
   **Then** the full list (or confederation-filtered subset if a chip is active) is
   restored.
4. **Given** the search text matches no team names, **When** the result set is empty,
   **Then** a "no teams found" message is displayed.

---

### Edge Cases

- What happens when the teams data endpoint returns malformed or incomplete JSON?
- How does the app display a team card when the emoji flag cannot be derived from the
  team's country code (e.g., code is missing or unrecognized)?
- How does filtering behave when confederation values in the data are inconsistent or null?
- What is displayed when all 48 teams are filtered out by both confederation chip and
  search simultaneously?
- How does the layout adapt when the team name is unusually long?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Teams section MUST display all participating teams fetched from the
  openfootball teams data source as individual cards.
- **FR-002**: Each team card MUST show: team name, confederation–region label
  (e.g., "UEFA – Europe"), group assignment, and an emoji flag derived from the team's
  country code.
- **FR-003**: The Teams section MUST provide a set of confederation chip/pill buttons
  above the team grid; each chip label MUST include the confederation acronym and its
  associated geographic region (e.g., "UEFA – Europe", "CAF – Africa"). Chips MUST be
  touch-friendly (minimum 44 px tap target) and always visible without requiring a
  dropdown interaction.
- **FR-004**: Tapping a confederation chip MUST filter the grid to show only teams
  belonging to that confederation; the selected chip MUST appear visually active.
  Tapping the same chip again MUST deactivate the filter and restore all teams.
- **FR-005**: Users MUST be able to search teams by name using a text input; matches
  MUST be case-insensitive and the grid MUST update with each keystroke.
- **FR-006**: Search MUST work in combination with an active confederation chip; only
  teams satisfying both the active chip and the search text are shown simultaneously.
- **FR-007**: Teams MUST be displayed in default sort order: by group (A–L), then
  alphabetically by team name within each group. This order MUST be preserved when
  filters or search are active (matching teams keep their relative group/alpha ordering).
- **FR-008**: The Teams section MUST display a loading indicator while team data is being
  fetched.
- **FR-009**: The Teams section MUST display a user-friendly error message and a visible
  manual retry button when the data source is unreachable or returns an error; tapping
  the retry button MUST re-initiate the data fetch.
- **FR-010**: When active filters and/or search produce no results, the section MUST
  display an explicit "no results" message rather than an empty grid.
- **FR-011**: Users MUST be able to clear all active filters and search text with a
  single "Clear" control, restoring the full sorted team list.

### Key Entities

- **Team**: Represents a national football team. Key attributes: name, country code
  (used to derive emoji flag), confederation acronym, geographic region (derived from
  confederation), group assignment. Sourced from the openfootball teams feed at runtime;
  not persisted.
- **Filter State**: Represents the current active UI selections. Attributes: selected
  confederation (nullable — one chip active at most), search query (string). Lives in
  browser memory only; reset when the user leaves the Teams section.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All participating teams are visible within 3 seconds of opening the Teams
  section on a 4G mobile connection.
- **SC-002**: Users can narrow the displayed team list to a specific confederation within
  a single tap on a chip button.
- **SC-003**: Typing in the search box updates visible results within 200 milliseconds
  of the last keystroke.
- **SC-004**: The Teams section is fully functional and visually complete on screens
  375 px wide or wider (no horizontal scrolling, no truncated cards, all chip buttons
  accessible without horizontal scroll).
- **SC-005**: A user can locate any specific team by name in under 15 seconds from
  opening the Teams section without prior knowledge of the team's group or confederation.
- **SC-006**: When the data source is unavailable, users see a clear error message and a
  manual retry button within 5 seconds of opening the section.

## Assumptions

- Team data is fetched at runtime from the openfootball public JSON endpoint; no data is
  bundled with the app.
- The openfootball dataset covers all 48 teams confirmed for the 2026 World Cup and
  includes a country code field from which emoji flags can be derived.
- Emoji flags are rendered using Unicode regional indicator symbols; no third-party flag
  library is required. If a country code is absent or unrecognized, a neutral placeholder
  (e.g., a globe emoji) is shown instead of a broken icon.
- Each confederation maps to exactly one geographic region; the mapping is hardcoded in
  the app (UEFA → Europe, CONMEBOL → South America, CONCACAF → North/Central America &
  Caribbean, CAF → Africa, AFC → Asia, OFC → Oceania).
- Confederation filter chips are rendered from the distinct confederation values present
  in the fetched data; the display always includes the geographic region label derived
  from the hardcoded mapping above.
- Users have an active internet connection; offline support is out of scope per the
  project constitution.
- The Teams section is one navigable view within the single-page app; navigation between
  sections (Teams, Groups, Schedule) is handled by the broader SPA shell, which is a
  separate feature.
- Filter and search state is reset when the user navigates away from the Teams section
  and returns.
