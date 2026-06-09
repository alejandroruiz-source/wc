# Data Model: Groups Browser

**Feature**: `002-groups-browser` | **Date**: 2026-06-08

## Entities

### Group

A group represents one of the 12 preliminary-round pools in WC2026.
Groups are derived client-side by partitioning the enriched teams array.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `string` | derived — `team.group` | Single uppercase letter, A–L |
| `teams` | `Team[]` | derived — teams where `team.group === id` | Sorted alphabetically by team name |

**Constraints**:
- 12 groups expected (A–L); render however many are present in the data
- Each group expected to have 4 teams; render however many are present
- Groups are ordered alphabetically (A before B before C … before L)

---

### Team (Groups context)

The `Team` entity is fully defined in `specs/001-teams-browser/contracts/state-contract.md`.
The Groups section reads the same enriched `Team` objects; no new fields are added.

Fields used by the Groups section:

| Field | Type | Used for |
|-------|------|---------|
| `name` | `string` | Team row — primary label |
| `flagEmoji` | `string` | Team row — flag icon |
| `confederation` | `string` | Team row — confederation portion of label |
| `region` | `string` | Team row — region portion of label |
| `group` | `string` | Group derivation — partition key |
| `code` | `string` | React key in `x-for` loop |

---

## Derived Structure: `groupedTeams`

The `groupsSection` Alpine component exposes a `groupedTeams` computed getter that
transforms `allTeams` into a sorted array of group objects:

```
groupedTeams: Array<{
  id:    string,   // "A", "B", … "L"
  teams: Team[]    // sorted by name, ascending
}>
```

**Derivation algorithm**:
1. Partition `allTeams` into a map keyed by `team.group`
2. Sort map keys alphabetically → group order A → L
3. Within each group, sort teams by `name` ascending (case-insensitive)
4. Return the sorted array of `{ id, teams }` objects

**Edge cases**:
- A team with `group === '?'` (missing group data) is omitted from `groupedTeams`
  and does NOT appear in any group panel
- An empty `allTeams` array → `groupedTeams` is `[]` → Groups section shows no panels
  (covered by the loading/error states before data arrives)
