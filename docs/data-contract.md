# Proposed live-data contract — V20

This is a **design contract**, not evidence that a provider is connected or that all fields are available.

## Game object

```json
{
  "gameId": "provider:league:game-id",
  "sport": "football",
  "league": "NFL",
  "status": "live",
  "updatedAt": "2026-11-03T21:00:00Z",
  "scheduledAt": "2026-11-03T20:00:00Z",
  "away": {"id": "away-id", "abbreviation": "AWY", "score": 0, "primaryColor": "#123456", "logoUrl": null},
  "home": {"id": "home-id", "abbreviation": "HME", "score": 0, "primaryColor": "#654321", "logoUrl": null},
  "period": "Q2",
  "clock": "07:32",
  "situation": {"description": "2ND & 7"},
  "leaders": [{"id": "player-id", "name": "Example Player", "teamId": "home-id", "position": "QB", "portraitUrl": null, "stats": ["210 YDS", "2 TD"]}],
  "events": [{"id": "unique-provider-event-id", "occurredAt": "2026-11-03T20:55:00Z", "receivedAt": "2026-11-03T21:00:00Z", "type": "pass", "description": "18-yard completion", "teamId": "home-id", "importance": "normal"}]
}
```

## Safety and correctness rules

- **Demo and live modes must be visibly distinct.** Never show fabricated scores or plays as live.
- Preserve source event ID, occurred time, and received time. Late-arriving events must not be labeled instantaneous.
- Deduplicate alerts by league + game ID + event ID. Never repeat an alert after a refresh.
- Interrupt only for verified major events; allow a cooldown, fair game rotation, and a maximum alert queue age.
- Show event recreation as illustrative. Do not infer player paths or positions from incomplete play-by-play.
- If player portrait is unavailable, use a team logo or styled initials; do not substitute an unrelated player.
- Score and status are authoritative from the game snapshot, not derived by summing incoming events.
- Hide unavailable shot clocks, possession markers, or other sport-specific fields instead of inventing values.
- Mark stale feeds, and fall back to a truthful Showcase Mode when live data is unavailable.
- Only use permitted logo/portrait assets and provider endpoints; keep credentials server-side.
- Source refresh interval and alert latency are unknown until provider validation.

## Runtime requirements

- Reuse one active sport renderer; release textures and models on game switches.
- Prefer a 30 FPS target, dynamically reducing crowd geometry and shadows first.
- Suspend expensive animation while idle; retain score strip and seven-second leader rotation.
- Detect loss of WebGL context, network failures, and long-running browser memory growth.
- Google TV full-screen browser behavior and unattended wake/recovery require testing on the actual device.
