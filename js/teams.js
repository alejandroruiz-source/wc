// T006 — Alpine.js teamsSection component

import { fetchTeams, FetchError } from './data.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('teamsSection', () => ({
    allTeams: [],
    activeConfederation: null, // used in Phase 4 (chip filter)
    searchQuery: '',           // used in Phase 5 (search)
    isLoading: true,
    hasError: false,
    errorMessage: '',

    // Phase 3: returns full sorted list.
    // Phase 4 wires confederation filter; Phase 5 wires search.
    get filteredTeams() {
      return this.allTeams;
    },

    get hasResults() {
      return this.filteredTeams.length > 0;
    },

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

    // Stub — wired in Phase 4
    selectChip(key) {
      this.activeConfederation = this.activeConfederation === key ? null : key;
    },

    // Stub — wired in Phase 4 & 5
    clearFilters() {
      this.activeConfederation = null;
      this.searchQuery = '';
    },
  }));
});
