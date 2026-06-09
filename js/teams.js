// T006 — Alpine.js teamsSection component
// T012, T013, T014, T020 — Phase 4 & 5: confederation chip filter + name search

import { fetchTeams, FetchError } from './data.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('teamsSection', () => ({
    allTeams: [],
    activeConfederation: null,
    searchQuery: '',
    isLoading: true,
    hasError: false,
    errorMessage: '',

    // T012: Distinct confederation chips from allTeams, sorted alphabetically by key
    get availableConfederations() {
      const seen = new Set();
      const chips = [];
      for (const team of this.allTeams) {
        if (!seen.has(team.confederation)) {
          seen.add(team.confederation);
          chips.push({ key: team.confederation, label: team.confederation + ' – ' + team.region });
        }
      }
      return chips.sort((a, b) => a.key.localeCompare(b.key));
    },

    // T013 + T020: AND-combine confederation filter and case-insensitive name search
    get filteredTeams() {
      const confed = this.activeConfederation;
      const query = this.searchQuery.trim().toLowerCase();
      return this.allTeams.filter(team => {
        const matchesConfed = !confed || team.confederation === confed;
        const matchesSearch = !query || team.name.toLowerCase().includes(query);
        return matchesConfed && matchesSearch;
      });
    },

    get hasResults() {
      return this.filteredTeams.length > 0;
    },

    // T014: isFiltered true when either filter is active
    get isFiltered() {
      return this.activeConfederation !== null || this.searchQuery.trim() !== '';
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
        if (import.meta.env?.DEV) console.error('[teamsSection]', err);
      } finally {
        this.isLoading = false;
      }
    },

    async retry() {
      await this._load();
    },

    // T012: Toggle activeConfederation (set if new, clear if already active)
    selectChip(key) {
      this.activeConfederation = this.activeConfederation === key ? null : key;
    },

    // T014: Reset both filters to initial state
    clearFilters() {
      this.activeConfederation = null;
      this.searchQuery = '';
    },
  }));
});
