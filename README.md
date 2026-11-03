# Man Cave Sports Book — Multi-Sport Virtual Arena

**Project:** Live-Game-Field-  
**Status:** V18-approved visual target; first interactive browser prototype committed. **Not live-data connected yet.**

## Approved design (do not redesign without permission)

- Landscape 16:9 display on Google TV / Android TV.
- Fixed direct overhead gameplay with **realistic miniature athletes** and recognizable team-branded playing surfaces.
- **Stadium surroundings** during live play (sidelines, benches, adjacent crowd), with **full miniature stadium** reserved for Showcase Mode.
- **Hybrid lighting:** realistic game conditions for play; dramatic gold broadcast lighting for alerts and Showcase Mode.
- Reactive, lightweight crowd animations; silent playback.
- Event-driven *illustrative* movement, followed by brief five-second play recaps. No claim of exact athlete tracking.
- Automatic rotation across supported live games; broadcast wipe transitions.
- Silent premium breaking-play alerts for major moments, with duplicate suppression and return to normal rotation.
- A dedicated score strip **below** the playing surface; one trading-card Game Leader spotlight rotates every **7 seconds**, using leaders only from the displayed game.

## What currently works

`index.html` contains an early standalone visual demonstration with four sports, illustrative overhead stadium surroundings, simplified player markers, sample score strip, seven-second rotating demonstration leaders, a manual NEXT GAME control, 60-second automatic rotation, and a TEST ALERT control.

**All scores, games, player statistics, and events are hardcoded demonstration fixtures.** This is not a live game tracker. The athletes are currently stylized 2D shapes, **not** the approved realistic 3D models. The screenshot-style V18 reference is a visual design target, not a claim of pixel-perfect reproduction. Google TV compatibility and continuous runtime are untested.

## Architecture and milestones

1. **Design fidelity:** preserve approved V18 proportions and overlays; obtain approved reference artwork in repo before replacing placeholders.
2. **Renderer:** lightweight WebGL/Three.js sport templates, reusable rigged mini-athlete models, fallback renderer for weaker TV hardware.
3. **Data ingestion:** validate terms, coverage, refresh limits, and reliability for each league. Normalize schedule, scoreboard, event, player stats and portraits to a single schema.
4. **Broadcast director:** timestamp-aware event processing, delayed-feed handling, deduplication, prioritization, fairness, and alert cooldowns.
5. **Operational reliability:** stale-data indication, caching, auto-recovery, browser memory checks, and Google TV testing.

See [docs/data-contract.md](docs/data-contract.md) for the proposed source-neutral data contract and alert safeguards.

## Hosting

For GitHub Pages, select **Settings → Pages → Deploy from a branch → main → /(root)**. GitHub Pages hosts static assets, not a permanent backend. GitHub Actions scheduled jobs may be delayed; they do not guarantee real-time alerts. Browser polling requires a suitable permitted source with compatible CORS and rate limits. Never expose private API keys in browser code or a public repo.

**Separate repository:** do not modify the wrestling project or the existing 28 sports boards.
