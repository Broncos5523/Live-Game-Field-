# Central last-play graphics — inspection and protection

Date: November 10, 2026  
Branch: `feature/central-last-play-20261110`  
Source checkpoint: `12a7b78ca3b2a657246b7bb6122321104a45b38b`  
Status: Phase 1 complete; visual implementation blocked by missing approved graphic references.

## Authorized scope

Replace only the central last-play graphics for NFL, CFB, NBA, CBB, WNBA, and NHL. Preserve every scoreboard, ticker, featured-player panel, logo, venue background, MLB presentation, rotation policy, polling interval, recovery path, and final-game board. No production merge or deployment is authorized.

No existing project file was changed during this inspection. No new scripts are loaded by any existing page.

## Current source and baseline

The requested visual baseline exists at `landscape-preview-v12/football-build32-review.html`; its iframe loads `football-build32.html`. Preserve both files and their dependencies.

The maintained seven-sport playback integration is under `rotation-preview/`. Its live page uses `rotation-preview/live-app.js`; final playback uses the separate `rotation-preview/final.html` and `final-bridge.js`. `rotation-preview/runtime.js` controls the 60-second live / 30-second final spotlights and 800ms crossfade. `rotation/approved-policy.js` and `rotation/engine.js` provide selection and recovery behavior. The root `index.html` is the earlier standalone demonstration, not this seven-sport integration.

The previous branch, `feature/approved-rotation-20261109` at `f958df6e71b95f82dd0075f8415eee5568c14d0a`, diverges from current `main`. Current `main` contains newer ticker, record, finals, venue, and recovery work. The new development branch starts from current `main`; it does not merge or reset the older branch.

## Central rendering and shared-code risks

| Code | Responsibility | Treatment |
| --- | --- | --- |
| `rotation-preview/live-app.js`: `Qm` | Current central last-play, portrait, and playing-surface section | Isolate a derived review copy; permit replacement only for the six approved sports |
| Same bundle: `Cm`, `staticLatest`, `staticActor`, `staticData` | Normalize the selected summary, retain the latest play, resolve its actor | Reuse supplied snapshots; do not alter existing data paths |
| Same bundle: `Zm`, `Ym`, `qm` | Dashboard, scoreboard, leaders, and inner ticker | Preserve exactly |
| `static-all-sports/components.js` | Readable predecessor of central component code | Reference only; changing it alone does not update the maintained bundle |
| `rotation-preview/spotlight.js` | Existing current-game featured-player statistics | Preserve; central event statistics need a separate actor-by-ID mapping |
| `rotation-preview/live.html` | Existing live page, CSS order, assets, and bridge | Preserve during review development |

Shared CSS uses ancestor selectors such as `.dashboard:has(.basketball-court,.hockey-rink,.football-field,.static-baseball-field)` and `.rotation-stage:has(.play-portrait)` to style scoreboard and featured-player elements. Merely removing old central markup could therefore alter locked components even without editing their CSS. A review implementation must preserve these selector conditions or demonstrate an equivalent isolated solution with no locked-component changes. Do not edit these shared CSS rules without explicit approval.

MLB must continue through its original `Qm` / `Vm` rendering, including its pitcher, bases, counts, and last-play presentation. No central graphic stylesheet may match MLB.

## Exact planned review files

These are planned paths, not claims of completed implementation:

| New file | Purpose |
| --- | --- |
| `central-play-preview/data.js` | Read-only, event- and athlete-ID-checked model for the six central graphics |
| `central-play-preview/graphic.js` | Isolated connected three-tier renderer |
| `central-play-preview/graphic.css` | Styles scoped exclusively to the six central graphics |
| `central-play-preview/build.cjs` | Deterministically derive a review bundle from the protected current bundle, changing only its central hook |
| `central-play-preview/live-app.js` | Derived review bundle; locked component code remains identical |
| `central-play-preview/live.html` | Isolated live review page referencing original approved dependencies |
| `central-play-preview/index.html` | One six-sport consolidated review with clearly labeled recorded provider snapshots |
| `tests/central-play.test.cjs` | Event identity, actor identity, missing data, persistence, and MLB-exclusion checks |

No existing file needs modification to create this review. Any later production integration is a separate approval step. Do not publish a Pages preview by merging these files to `main`: the existing Pages workflow deploys pushes to `main`.

## Existing approved assets

Reuse `landscape-preview-v1/assets/branding/`, `assets/league-logos/`, `assets/network_logos/`, and `assets/venues/`, plus the existing team-logo and player-headshot resolution. Venue selection remains unchanged.

The checkout contains 32 NFL, 35 CFB, 30 NBA, 115 CBB, 15 WNBA, 32 NHL, and 30 MLB venue files. These counts describe the checked-out repository; they do not assert that every venue from prior conversations is present.

## References received and missing

All six received JPEGs were inspected. They are venue-only artwork:

| Attachment | Content |
| --- | --- |
| `3F577664-BAD2-4180-9277-61933C4570D0.jpeg` | WNBA sideline arena |
| `ADEC6367-3A4C-4E71-B8A1-07FC1FBE9C06.jpeg` | NHL full-rink center-ice sideline arena |
| `6D35F8F8-A640-444C-BAAA-95F81DAB6249.jpeg` | NCAA basketball sideline arena |
| `4727AE9F-FC4C-4D40-879D-C2AAAB312C2D.jpeg` | NBA sideline arena |
| `8559430E-9F9E-4715-8B5D-372382E13146.jpeg` | NCAA football stadium |
| `60A3B2FD-6F18-4919-97F5-1E2DDEED857D.jpeg` | NFL stadium |

None shows a connected three-tier graphic, player headshot placement, or the approved graphic typography. The repository and older branch contain no matching final football, basketball, or hockey three-tier reference. Root graphics were inspected: two goalpost cutouts, the earlier field-layout template, and a team logo; these are not substitutes for the missing references.

Required before finalizing any affected graphic: the approved football, basketball, and hockey images showing the three-tier graphic. Do not reinterpret the prose brief into a new visual design. Do not install the received venue JPEGs as replacements for existing backgrounds under this scope.

## Data verification

Read-only ESPN summaries for the six recorded games listed in `static-all-sports/review-fixtures.json` were retrieved during inspection. These are historical game snapshots, not a claim of current live play. Retrieval added no polling or runtime changes.

| Sport family | Verified current-game source | Mapping constraint |
| --- | --- | --- |
| NBA / WNBA / CBB | Selected summary's player boxscore keys `points`, `rebounds`, `assists` | Match the event actor's athlete ID and team ID; do not select a game leader in their place |
| NHL skaters | Boxscore keys `goals`, `assists`, `plusMinus`, `shotsTotal`; tables `forwards`, `defenses`, `skaters` | Points may be calculated only when both game goals and assists are present; ignore `ytdGoals` and participant `ytdAssists` |
| NHL goalies | Separate `goalies` table with `saves`, `shotsAgainst`, `goalsAgainst`, `savePct` | Never apply skater statistics to a save-event goalie; use verified event information when the approved skater fields do not apply |
| NFL / CFB | Summary `drives.current` when supplied; competition situation; current/previous drive plays | Finals inspected had previous drives but no current drive: do not relabel a completed drive as current or invent the next down |

Basketball records include explicit `pointsAttempted`, `scoreValue`, `scoringPlay`, event types, and participants. Block descriptions can begin with the blocker even when the first participant is the shooter. Hockey shots identify shooter and goalie separately. Actor resolution must honor event role, verified athlete identity, and team membership rather than assuming the first participant owns every event.

Missing statistics remain unavailable. Non-player events use verified team/league branding and event information. No scoring-run banners or duplicate timeout indicators are authorized.

## Baseline verification and remaining work

Before any changes to existing code, the five existing test files were run:

`node --test tests/rotation.test.cjs tests/ranks.test.cjs tests/spotlight.test.cjs tests/reliability.test.cjs tests/runtime-recovery.test.cjs`

Result: **55 passed, 1 failed**. The existing `recent finals globally preferred, NCAA priorities also apply` test expects `['r']`; the unchanged current implementation returns `['r', 'o']`. This is a pre-existing failure. The rotation policy and its test were not changed because they are outside the authorized central-graphic scope.

Visual implementation, six-sport browser review, locked-region screenshot comparisons, rotation soak checks, and physical Onn performance acceptance are pending. No claim of completed graphics or passing device validation is made.

`node central-play-preview/check-protection.cjs` checks that every existing tracked file still matches the source checkpoint. It permits only added files. The check must pass before presenting this development work.
