// T005 — fetch layer for openfootball WC2026 data
// T002 (groups) — module-level Promise cache so both sections share one HTTP request
// T003 (schedule) — fetchSchedule() with parseMatchTime() and enrichScheduleMatch()

import {
  FIFA_CODE_TO_CONFEDERATION,
  CONFEDERATION_REGION,
  FIFA_TO_ISO,
  flagEmoji,
  lookupVenueTimezone,
} from './config.js';

// worldcup.teams.json — flat array with all team metadata
const TEAMS_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.teams.json';

export class FetchError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'FetchError';
    if (cause) this.cause = cause;
  }
}

function enrichTeam(raw) {
  const code = (raw.fifa_code || '').toUpperCase();
  const confederation = raw.confed || FIFA_CODE_TO_CONFEDERATION[code] || 'UNKNOWN';
  const region = CONFEDERATION_REGION[confederation] || 'Unknown Region';
  const iso = FIFA_TO_ISO[code] || null;

  return {
    name: String(raw.name || '').trim(),
    code,
    group: (raw.group || '?').toUpperCase(),
    confederation,
    region,
    isoCode: iso,
    // Use the flag_icon from the feed directly; fall back to computed emoji
    flagEmoji: raw.flag_icon || flagEmoji(iso),
  };
}

function sortTeams(teams) {
  return [...teams].sort((a, b) => {
    if (a.group < b.group) return -1;
    if (a.group > b.group) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

async function _doFetchTeams() {
  let response;
  try {
    const r = await fetch(TEAMS_URL);
    if (!r.ok) throw new FetchError(`HTTP ${r.status} fetching team data`);
    response = await r.json();
  } catch (err) {
    throw err instanceof FetchError
      ? err
      : new FetchError('Unable to load team data. Please check your connection.', err);
  }

  // The feed is a top-level array
  const raw = Array.isArray(response) ? response : (response.teams ?? []);

  if (raw.length === 0) {
    throw new FetchError('No team data found in the response.');
  }

  const teams = raw
    .filter(t => t && t.name)
    .map(enrichTeam);

  return sortTeams(teams);
}

// Cache the in-flight/resolved Promise so concurrent callers (teamsSection + groupsSection)
// share one HTTP request per page load. Cleared on rejection so retry() works correctly.
let _teamsPromise = null;

// ─── Schedule fetch layer ────────────────────────────────────────────────────

const SCHEDULE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.json';

/**
 * Parses the feed's custom time format "HH:MM UTC±N" into a UTC timestamp (ms).
 * @param {string} dateStr  ISO date "YYYY-MM-DD" (venue-local calendar date)
 * @param {string} timeStr  Custom time "HH:MM UTC-6"
 * @returns {number} UTC milliseconds
 */
function parseMatchTime(dateStr, timeStr) {
  const [time, offsetStr] = timeStr.split(' ');
  const [h, m] = time.split(':').map(Number);
  const offset = parseInt(offsetStr.replace('UTC', ''), 10);
  const [year, month, day] = dateStr.split('-').map(Number);
  // UTC = local time − offset (e.g., local 13:00 at UTC-6 → UTC 19:00)
  return Date.UTC(year, month - 1, day, h - offset, m);
}

function enrichScheduleMatch(raw, nameToFlag = {}) {
  const utcMs = parseMatchTime(raw.date, raw.time);
  return {
    round:         raw.round,
    date:          raw.date,
    utcDate:       new Date(utcMs),
    team1:         raw.team1,
    team2:         raw.team2,
    team1Flag:     nameToFlag[raw.team1] || '',
    team2Flag:     nameToFlag[raw.team2] || '',
    group:         raw.group || null,
    matchNum:      raw.num || null,
    ground:        raw.ground,
    venueTimezone: lookupVenueTimezone(raw.ground),
  };
}

async function _doFetchSchedule() {
  // Co-fetch teams to build a name→flagEmoji map. fetchTeams() uses the same
  // Promise cache so this never fires a duplicate HTTP request.
  let nameToFlag = {};
  try {
    const teams = await fetchTeams();
    for (const t of teams) nameToFlag[t.name] = t.flagEmoji;
  } catch { /* flag lookup is best-effort; schedule still renders without flags */ }

  let response;
  try {
    const r = await fetch(SCHEDULE_URL);
    if (!r.ok) throw new FetchError(`HTTP ${r.status} fetching schedule data`);
    response = await r.json();
  } catch (err) {
    throw err instanceof FetchError
      ? err
      : new FetchError('Unable to load schedule data. Please check your connection.', err);
  }

  const raw = Array.isArray(response.matches) ? response.matches : [];
  if (raw.length === 0) throw new FetchError('No match data found in the response.');

  return raw
    .filter(m => m && m.date && m.time && m.team1 && m.team2)
    .map(m => enrichScheduleMatch(m, nameToFlag))
    .sort((a, b) => a.utcDate - b.utcDate);
}

// Cleared on rejection so retry() in scheduleSection issues a fresh request.
let _schedulePromise = null;

/**
 * Fetch and enrich all WC2026 schedule matches from worldcup.json.
 * @returns {Promise<EnrichedMatch[]>} Sorted enriched match array.
 */
export function fetchSchedule() {
  if (!_schedulePromise) {
    _schedulePromise = _doFetchSchedule().catch(err => {
      _schedulePromise = null;
      throw err;
    });
  }
  return _schedulePromise;
}

/**
 * Fetch and enrich all WC2026 teams from worldcup.teams.json.
 * @returns {Promise<Team[]>} Sorted, enriched team array.
 */
export function fetchTeams() {
  if (!_teamsPromise) {
    _teamsPromise = _doFetchTeams().catch(err => {
      _teamsPromise = null;
      throw err;
    });
  }
  return _teamsPromise;
}
