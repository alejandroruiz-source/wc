// T005 — fetch layer for openfootball WC2026 data

import {
  FIFA_CODE_TO_CONFEDERATION,
  CONFEDERATION_REGION,
  FIFA_TO_ISO,
  flagEmoji,
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

/**
 * Fetch and enrich all WC2026 teams from worldcup.teams.json.
 * The feed is a flat array; each entry has fifa_code, confed, flag_icon, group.
 * @returns {Promise<Team[]>} Sorted, enriched team array.
 */
export async function fetchTeams() {
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
