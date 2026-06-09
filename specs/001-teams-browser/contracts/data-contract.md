# Data Contract: openfootball Teams API

**Feature**: `001-teams-browser` | **Date**: 2026-06-08

## Source

**URL**: `https://raw.githubusercontent.com/openfootball/worldcup.json/refs/heads/master/2026/worldcup.teams.json`

**Method**: HTTP GET (read-only, no authentication)

**Format**: JSON (Content-Type: `application/json`)

**CORS**: Permitted — `raw.githubusercontent.com` allows browser-side cross-origin reads.

## Expected Response Shape

```jsonc
{
  "name": "World Cup 2026",        // string — dataset label (not used by app)
  "teams": [                       // array — one entry per participating team
    {
      "name": "United States",     // string — full official team name (REQUIRED)
      "code": "USA",               // string — FIFA 3-letter code (REQUIRED for flag)
      "group": "A",                // string — single uppercase letter A–L (REQUIRED)
      "confederation": "CONCACAF"  // string — FIFA confederation acronym (REQUIRED for filter)
    }
    // ... 47 more team objects
  ]
}
```

## Required Fields

| Field | Type | Required | Used for |
|-------|------|----------|----------|
| `teams` | array | YES — abort if missing | Top-level array of team objects |
| `teams[].name` | string | YES — skip card if empty | Card title; search match target |
| `teams[].code` | string | YES (soft) | FIFA→ISO lookup for emoji flag |
| `teams[].group` | string | YES (soft) | Primary sort key; displayed on card |
| `teams[].confederation` | string | YES (soft) | Chip filter; confederation–region label |

"Soft required" means the app gracefully degrades if the field is missing or malformed
(see Fallbacks below) rather than aborting the entire render.

## Fallbacks for Missing / Malformed Data

| Scenario | Behaviour |
|----------|-----------|
| `teams` array absent or empty | Show error state: "Team data is unavailable." |
| Team `name` empty or null | Skip that team entry; log a console warning |
| Team `code` missing or unrecognised | Display 🌐 (globe emoji) instead of a flag |
| Team `group` missing or outside A–L | Sort team to end of list; display "–" for group |
| Team `confederation` missing or unknown | Display "–" for confederation label; exclude from chip filter options |
| HTTP non-2xx response | Trigger error state with manual retry button |
| Network failure / timeout | Trigger error state with manual retry button |
| Response body not valid JSON | Trigger error state with manual retry button |

## Fetch Behaviour

- **Timeout**: No explicit timeout; rely on browser default (~2 min). A 5 s visual
  timeout should trigger a "this is taking longer than expected" inline note (not an
  error state; the retry button appears only on actual failure).
- **Retry**: Manual — triggered by user tapping the retry button. Each retry is a fresh
  `fetch()` call; no exponential backoff required.
- **Caching**: Browser's default HTTP cache applies (GitHub raw CDN sets cache headers).
  No additional in-app caching layer.
- **Session**: Data is fetched once per page load. Navigation away from and back to the
  Teams section within the same session does NOT re-fetch (Alpine component state
  persists while the section is visible; if the component is destroyed on navigation,
  a re-fetch occurs on return — acceptable per the spec assumption).

## Validation Rules (applied client-side after parse)

1. Response must be an object with a `teams` property that is a non-empty array.
2. Each team object must have a non-empty `name` string; invalid entries are silently
   dropped.
3. All other fields are optional from a render-blocking standpoint; missing values
   trigger per-field fallbacks.
