# Approved rotation preview — November 9, 2026

Isolated integration on `feature/approved-rotation-20261109`. Original production entry points, approved live/static boards, final-game preview and artwork are unchanged. The preview reuses the approved live React renderer and the approved final HTML/CSS. Only orchestration and sport-specific data bindings change. No simulated games enter playback.

## Implemented

- Sport-grouped selection, live first, 60-second live/30-second final spotlights. Current spotlight completes before changing games/modes. A ready successor crossfades for 800ms; failed rendering retains the previous board and retries.
- 10s game summaries/score/clock/play refresh; 30s discovery/player boxscores; 60s finals. Network request time can extend these intervals; no overlapping requests for the same game. Continuous ticker retains elapsed time across boards within a sport. Static playing surfaces remain static.
- FBS group 80 / Division I group 50 scoreboard queries; CFP preference over AP for CFB; AP for CBB; persisted ranks frozen at the first observed in-progress snapshot. Ranked games by best rank, opponent rank, margin; then unranked Arizona. Other unranked games appear only absent those tiers, capped at 10 by smallest margin. Same policy for finals.
- Last confirmed play survives absent play fields; unknown coordinates remain unplotted. Invalid snapshots are rejected. Score decreases and final reversals require two matching primary observations at least 9 seconds apart. Fallback snapshots must be verified and newer than the last accepted primary observation.
- Five-minute missing-game verification with temporary removal, never inferred final. Official delay/suspension expires at 15 minutes; halftime/intermissions/period breaks do not start this timer. Reappearance restores eligibility.
- Same-provider summary recovery when a missing game's summary includes a verifiable newer observation timestamp. No conflicting cross-provider field merging.
- Bounded persistent last-valid snapshots (3.5 MB budget, selected game retained first; older alternate snapshots may be evicted); isolated service worker caches the preview shell and successfully visited assets. Cached games retain original verification timestamps; expired live records are not represented as fresh. Online events trigger refresh.
- Feed warning after 30s without a successful game confirmation or 120s without progression during active play; normal breaks excluded from progression warning. The 120s threshold is an implementation default, not a newly claimed user approval.
- Existing approved logo/headshot/venue handling retained, with CDN logo recovery then authentic league-logo fallback. Missing player identity is never substituted with another player. Missing venue retains the existing neutral backdrop.

## Verification

`node --test tests/rotation.test.cjs`: 15 tests, including a live/final boundary test for each of seven sports, NCAA ordering/cap/divisions, sport grouping, exact suspension/missing boundaries, correction verification, frozen ranking persistence, invalid data and recovery.

Browser QA uses actual recorded ESPN snapshots, separately labeled as recorded renderer tests. Both live-surface and final renderers are checked at 1280×720 for all seven sports. Synthetic policy inputs are unit-test data only and never shown as live gameplay.

## Limits — do not treat this as full production acceptance

- No independent fallback provider, provider credentials, or validated cross-provider event mapping exists in the repository. Independent-source failover cannot be claimed; ESPN summary recovery and cached data are the available paths.
- Historical events often lack actual completion timestamps. For a live-to-final transition observed by this runtime, completion is recorded at confirmation. For first-seen historical finals without `endDate`, the listed event start time is a conservative recency fallback, so an exact 24-hour completion cutoff cannot be guaranteed.
- A game first encountered after kickoff cannot reconstruct an unavailable historical ranking. Persisted observed ranks and event-provided historical ranks are used; exact kickoff ranking needs an archived provider snapshot.
- Browser checks and unit tests are not a real multi-hour outage, device power-cycle, or seven-sport simultaneous live test. Physical iPhone/TV behavior and prolonged offline recovery are not yet verified.
- ESPN public endpoints have no guaranteed uptime/SLA. Old scheduled games are never promoted to live solely by wall-clock time.

The main page is `/rotation-preview/`. Development and preview publishing must not change `/index.html`, approved builds, or other projects.

## College rank indicators

Live and final scoreboards display a compact #1–#25 label before ranked CFB/CBB team names. The display receives the same frozen home/away ranks used by selection. Explicit unranked values suppress the badge; recorded renderer QA can use event-provided ranks when no engine rank snapshot exists. Professional leagues never display these labels. Four additional rank tests cover identity, frozen ranks, unranked/invalid values and professional-sport exclusion.

## Approved per-game spotlight statistics

The large Final Game Board spotlights use the selected event's boxscore player rows, matched by athlete ID and team ID. A summary from another event ID is rejected. Season average / year-to-date columns are ignored; missing values remain dashes. Existing layout and player image assets are preserved.

- NBA/WNBA/CBB: points, rebounds, assists.
- NFL/CFB QB: passing yards, completions/attempts, passing touchdowns.
- NFL/CFB RB: rushing attempts, rushing yards, rushing touchdowns.
- NFL/CFB WR (and receiving tight ends): receptions, receiving yards, receiving touchdowns. Confirmed player position takes precedence over a trick-play passing entry.
- MLB batters: hits/plate appearances, home runs, RBIs. PA uses an explicit game field when available. Otherwise completed mapped plate-appearance results are counted only when their at-bats, walks, and hits reconcile with the player's game boxscore. Partial or irreconcilable logs show an unknown PA denominator, never an AB substitute.
- NHL skaters: goals, assists, plus/minus with its actual sign. Goalies are excluded from this skater stat template.

The existing provider-selected performer is retained when its athlete has a usable game row. If no leader block exists, a verified boxscore batter is chosen by hits, then RBIs, then home runs; hockey fallback uses goals then assists. No season leaderboard is used for selection or values.
