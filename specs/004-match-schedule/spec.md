# Feature Specification: Match Schedule

**Feature Branch**: `004-match-schedule`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Shows the matches per day (include the matchday), it should be possible to see all entries or by a specific day. Show match time in my local time and in the match location time."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Full Match Schedule (Priority: P1)

A visitor opens the WC2026 app and wants to see all scheduled World Cup matches. The matches are displayed organised by calendar date, with each day showing a date header and a list of that day's matches. Each match row shows the matchday number (e.g., "Matchday 1"), the two competing teams with their flag icons, the kick-off time in both the visitor's local time zone and the match venue's local time zone, and the venue city name. A loading indicator appears while data is being fetched; a clear error message with a retry control appears if the fetch fails.

**Why this priority**: The full schedule is the primary reason users visit a tournament tracker. Without it the feature has no value and US2 (day filter) has nothing to filter.

**Independent Test**: Open the app, scroll to the Schedule section → matches load grouped by calendar date → each match shows both teams with flags, kick-off time in local timezone with abbreviation, and kick-off time in venue timezone with city name → renders correctly on a 375 px mobile viewport without horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** the app loads with no day filter active, **When** the Schedule section finishes loading, **Then** all matches are shown grouped by calendar date in chronological order, each date group labelled with the full date (e.g., "Thursday, 11 June 2026").
2. **Given** the schedule has loaded, **When** a user reads a match entry, **Then** they see: both teams' flag icons and names, the kick-off time in the user's local time zone with a timezone identifier, and the kick-off time in the match venue's local time zone with the city/venue name.
3. **Given** the schedule is loading, **When** the data has not yet arrived, **Then** a loading indicator is displayed in place of the match list.
4. **Given** schedule data fails to load, **When** the error is detected, **Then** a user-friendly error message and a "Try Again" button are shown; clicking it retries the data fetch.
5. **Given** a match has no venue data, **When** that match is displayed, **Then** the venue time is shown as UTC with a visible "UTC" label rather than a missing or incorrect time.

---

### User Story 2 - Filter Schedule by Day (Priority: P2)

A visitor wants to focus on a specific day's matches. They use a day-filter control to select a date; the match list updates immediately to show only that day's fixtures. A clear/reset control returns them to the full schedule.

**Why this priority**: Day filtering makes the schedule practical for day-of planning. The full 100+ match schedule spanning several weeks is overwhelming without it. However, the full schedule (US1) must be working before day filtering adds value.

**Independent Test**: With schedule loaded, activate a day filter → only that day's matches shown → clear the filter → full schedule restored. Selecting a day with no matches shows a friendly empty-state message.

**Acceptance Scenarios**:

1. **Given** the schedule has loaded, **When** the user selects a specific day from the filter control, **Then** only matches on that date are shown and all other days' matches are hidden.
2. **Given** a day filter is active, **When** the user clears or resets the filter, **Then** all matches across all days are displayed again.
3. **Given** a day filter is active, **When** the selected day has no scheduled matches, **Then** a "No matches on this day" message is shown.
4. **Given** the schedule has loaded with no filter active, **When** the user has not interacted with the day filter, **Then** all matches for all days are visible by default.

---

### Edge Cases

- What happens when a match has no venue data? → UTC displayed with a visible "UTC" label; no silent wrong time.
- What happens when the schedule feed returns no matches? → "No matches available" empty-state message shown.
- What happens when the user's browser cannot detect a local time zone? → Display falls back to UTC with a label rather than showing a wrong time.
- What happens when two matches on the same day kick off at the same time? → Both are shown; within a day matches are ordered by kick-off time ascending.
- What happens when a day filter selects a date with zero matches? → Friendly empty-state message with option to clear the filter.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Schedule section MUST display all WC2026 matches retrieved from the public schedule data source.
- **FR-002**: Matches MUST be grouped by calendar date and displayed in chronological order, earliest date first.
- **FR-003**: Each date group MUST be preceded by a clearly labelled date header showing the full date.
- **FR-004**: Each match entry MUST display: the matchday label, both teams' flag icons and names, and the kick-off time.
- **FR-005**: Each match entry MUST show the kick-off time in the user's detected local time zone, with the time zone abbreviation or identifier visible alongside the time.
- **FR-006**: Each match entry MUST show the kick-off time in the match venue's local time zone, identified by the venue city name.
- **FR-007**: When venue time zone data is unavailable for a match, the venue time MUST fall back to UTC with a visible "UTC" label.
- **FR-008**: A day-filter control MUST allow the user to select one specific date and immediately see only that day's matches.
- **FR-009**: A clear/reset control MUST allow the user to remove the active day filter and return to the full schedule.
- **FR-010**: The Schedule section MUST display a loading indicator while match data is being retrieved.
- **FR-011**: If data retrieval fails, the Schedule section MUST display a user-friendly error message and a retry control.
- **FR-012**: The schedule layout MUST be fully usable on mobile screens (320 px and above) without horizontal scrolling.

### Key Entities

- **Match**: A single fixture with two competing teams, a scheduled date and time, a matchday label, and a venue/city.
- **Day Group**: A logical container for all matches on the same calendar date, identified by that date.
- **Matchday**: A round label (e.g., "Matchday 1", "Round of 16", "Quarter-final") identifying where the match sits in the tournament.
- **Venue**: The city and/or stadium where a match is played; used to identify the time zone for venue-local time display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All WC2026 matches appear in the schedule within 3 seconds of the section becoming visible on a standard broadband connection.
- **SC-002**: Every match entry shows two distinct times simultaneously (local and venue) — zero entries display a single time only.
- **SC-003**: Selecting a day filter updates the visible matches without a full page reload or visible flash.
- **SC-004**: The schedule is fully readable and interactive on a 375 px-wide mobile viewport without any horizontal scrolling.
- **SC-005**: A user in any time zone sees a correct local-time conversion for every match; correct output is verifiable across at least UTC−12, UTC, UTC+5:30, and UTC+12 offsets.

## Assumptions

- Match schedule data is available from the public openfootball schedule feed at runtime with no authentication required.
- The tournament schedule (or pre-tournament fixture list) is present in the data feed; partially-scheduled fixtures (teams labelled "TBD") are displayed as-is.
- All 2026 host venues are located in three countries (USA, Canada, Mexico); a finite mapping from venue cities to time zones is sufficient to cover all matches.
- The app fetches fresh schedule data on each page load; persisting schedule data across browser sessions is not required.
- Match results or scores, if present in the data feed, may be displayed alongside team names if available but score display is out of scope for this feature's core requirements.
- The day-filter dimension is calendar date (not tournament round/stage); filtering by round is out of scope.
