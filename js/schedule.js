// T004 (schedule feature) — Alpine.js scheduleSection component

import { fetchSchedule, FetchError } from './data.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('scheduleSection', () => ({
    allMatches: [],
    isLoading: true,
    hasError: false,
    errorMessage: '',
    selectedDay: '',
    userTimezone: '',

    // Sorted list of unique match dates for the day-filter <select>.
    get availableDays() {
      const seen = new Set();
      const days = [];
      for (const m of this.allMatches) {
        if (!seen.has(m.date)) {
          seen.add(m.date);
          days.push({ value: m.date, label: this._formatDayLabel(m.date) });
        }
      }
      return days;
    },

    // Matches grouped by calendar date, optionally filtered to selectedDay.
    // Returns Array<{ date, label, matches }> sorted chronologically.
    get filteredDayGroups() {
      const map = new Map();
      for (const m of this.allMatches) {
        if (this.selectedDay && m.date !== this.selectedDay) continue;
        if (!map.has(m.date)) map.set(m.date, []);
        map.get(m.date).push(m);
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, matches]) => ({
          date,
          label: this._formatDayLabel(date),
          matches: matches.sort((a, b) => a.utcDate - b.utcDate),
        }));
    },

    get hasResults() {
      return this.filteredDayGroups.length > 0;
    },

    async init() {
      this.userTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      await this._load();
    },

    async _load() {
      this.isLoading = true;
      this.hasError = false;
      this.errorMessage = '';
      try {
        this.allMatches = await fetchSchedule();
      } catch (err) {
        this.hasError = true;
        this.errorMessage =
          err instanceof FetchError
            ? err.message
            : 'An unexpected error occurred. Please try again.';
        if (import.meta.env?.DEV) console.error('[scheduleSection]', err);
      } finally {
        this.isLoading = false;
      }
    },

    async retry() {
      await this._load();
    },

    formatLocalTime(utcDate) {
      return utcDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: this.userTimezone || 'UTC',
        timeZoneName: 'short',
      });
    },

    formatVenueTime(utcDate, venueTimezone) {
      if (!venueTimezone) {
        // UTC fallback — extract HH:MM from UTC string and append label
        const h = String(utcDate.getUTCHours()).padStart(2, '0');
        const m = String(utcDate.getUTCMinutes()).padStart(2, '0');
        return `${h}:${m} UTC`;
      }
      return utcDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: venueTimezone,
        timeZoneName: 'short',
      });
    },

    _formatDayLabel(dateStr) {
      // Use noon UTC to avoid any date-boundary issues with local tz offsets
      return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
    },
  }));
});
