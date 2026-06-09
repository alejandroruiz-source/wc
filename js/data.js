// T005 — fetch layer for openfootball WC2026 data

import {
  FIFA_CODE_TO_CONFEDERATION,
  CONFEDERATION_REGION,
  FIFA_TO_ISO,
  flagEmoji,
} from './config.js';

const GROUPS_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.groups.json';
const TEAMS_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.teams.json';

export class FetchError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'FetchError';
    if (cause) this.cause = cause;
  }
}

function extractGroupLetter(groupName) {
  const match = String(groupName || '').match(/([A-La-l])/);
  return match ? match[1].toUpperCase() : '?';
}

function enrichTeam(raw, groupLetter) {
  const code = (raw.code || raw.key || '').toUpperCase();
  const group = groupLetter || (raw.group ? String(raw.group).toUpperCase() : '?');

  const confederation =
    raw.confederation ||
    FIFA_CODE_TO_CONFEDERATION[code] ||
    'UNKNOWN';

  const region = CONFEDERATION_REGION[confederation] || 'Unknown Region';
  const iso = FIFA_TO_ISO[code] || null;

  return {
    name: String(raw.name || '').trim(),
    code,
    group,
    confederation,
    region,
    isoCode: iso,
    flagEmoji: flagEmoji(iso),
  };
}

function sortTeams(teams) {
  return [...teams].sort((a, b) => {
    if (a.group < b.group) return -1;
    if (a.group > b.group) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

async function safeFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new FetchError(`HTTP ${r.status} from ${url}`);
  return r.json();
}

/**
 * Fetch and enrich all WC2026 teams.
 * Primary source: worldcup.groups.json (gives group assignments).
 * Fallback source: worldcup.teams.json.
 * @returns {Promise<Team[]>} Sorted, enriched team array.
 */
export async function fetchTeams() {
  const [groupsResult, teamsResult] = await Promise.allSettled([
    safeFetch(GROUPS_URL),
    safeFetch(TEAMS_URL),
  ]);

  const raw = [];

  if (groupsResult.status === 'fulfilled') {
    const groups = groupsResult.value.groups || groupsResult.value.rounds;
    if (Array.isArray(groups) && groups.length > 0) {
      for (const group of groups) {
        const letter = extractGroupLetter(group.name);
        const members = group.teams || group.entries || [];
        for (const team of members) {
          if (team.name) raw.push(enrichTeam(team, letter));
        }
      }
    }
  }

  if (raw.length === 0 && teamsResult.status === 'fulfilled') {
    const teams = teamsResult.value.teams || teamsResult.value;
    if (Array.isArray(teams)) {
      for (const team of teams) {
        if (team.name) raw.push(enrichTeam(team, null));
      }
    }
  }

  if (raw.length === 0) {
    const err = groupsResult.reason || teamsResult.reason;
    throw new FetchError(
      'Unable to load team data. Please check your internet connection.',
      err,
    );
  }

  // Deduplicate by code (groups.json may list teams multiple times)
  const seen = new Set();
  const unique = raw.filter(t => {
    if (seen.has(t.code)) return false;
    seen.add(t.code);
    return true;
  });

  return sortTeams(unique);
}
