// T003 (groups feature) — Alpine.js groupsSection component

import { fetchTeams, FetchError } from './data.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('groupsSection', () => ({
    allTeams: [],
    isLoading: true,
    hasError: false,
    errorMessage: '',

    // Partition allTeams by group letter, sort groups A→L, sort teams within each group
    // by name ascending (case-insensitive). Teams with group '?' are omitted.
    get groupedTeams() {
      const map = {};
      for (const team of this.allTeams) {
        if (team.group === '?') continue;
        if (!map[team.group]) map[team.group] = [];
        map[team.group].push(team);
      }
      return Object.keys(map)
        .sort()
        .map(id => ({
          id,
          teams: map[id].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          ),
        }));
    },

    get hasGroups() {
      return this.groupedTeams.length > 0;
    },

    async init() {
      await this._load();
    },

    async _load() {
      this.isLoading = true;
      this.hasError = false;
      this.errorMessage = '';
      try {
        this.allTeams = await fetchTeams();
      } catch (err) {
        this.hasError = true;
        this.errorMessage =
          err instanceof FetchError
            ? err.message
            : 'An unexpected error occurred. Please try again.';
        if (import.meta.env?.DEV) console.error('[groupsSection]', err);
      } finally {
        this.isLoading = false;
      }
    },

    async retry() {
      await this._load();
    },
  }));
});
