# All-sports static preview

The separate `/static-all-sports/` preview uses the established broadcast layout for NFL, NBA, NHL, MLB, WNBA, college football and college basketball. Production, Build 32, older previews and artwork remain unchanged.

All leagues share top branding/scoreboard, left last-play portrait, central playing surface, right play/status panels, four game-leader cards and bottom ticker. The existing enlarged header is preserved. Playing surfaces use immediate state replacements with no motion scripts, CSS animations, shot arcs, pulses, flashes or added hit graphics. Game and ticker rotation continue.

- Football: existing field/goalposts, home logo, ball spot, blue scrimmage line, yellow first-down line when possession and distance are supplied. No invented goal-to-go first-down line.
- Basketball: existing court, home logo and team-colored edges. Latest made/missed/blocked shot marker only with valid coordinates. Provider basket-relative coordinates map to each team's designated scoring end; this does not claim actual arena attack direction. Possession remains in the status panel.
- Hockey: existing rink, home center logo, green goal/red saved or missed shot/X blocked shot with valid rink coordinates. No guessed possession.
- Baseball: stationary branded diamond, known occupied bases/count/outs, red X for identifiable outs. Explicit out-at-base text and unambiguous groundout/strikeout results are supported. Double-play bases require explicit data or description. Unknown catch locations do not get guessed markers.

Play markers persist until the next event. Fouls/timeouts clear the preceding shot marker. No marker-cleanup timer exists. Repeated partial responses for the same play retain its known marker; missing new-play data retains the last known event. Unknown numbers display dashes. Finals retain the shared surface layout and suppress obsolete drive/down-distance decorations.

`app-static.js` is an additive copy of the established licensed React bundle. `components.js` is its readable inserted source. Surfaces use React element composition; each game has its own keyed dashboard subtree. No React-owned children are removed. The existing repaired football decorator is reused unchanged. `shared-surfaces.css` extends existing layout selectors and `static.css` disables motion. Original venue/style assets remain authoritative.

The default page uses current ESPN feeds and existing automatic live-game selection. Optional `sport` and eight-digit `date` query parameters select real recorded games for review. Recorded finals are not labeled live. No simulated games or manually selected logos are included.

Verification: all seven leagues were checked in browser at 1280x720. Scoreboard, central panel, leaders and ticker dimensions matched exactly across all seven. Current NFL/NBA/CBB feeds, recent NHL finals and real recorded MLB/WNBA/CFB games were used. No failed team/player images or application errors were observed. Browser-extension metadata errors were excluded. A 390x844 viewport preserved the inner 16:9 board at 390x219.375. Nine recorded-data behavior checks passed: valid basketball shots, clearing on subsequent non-shot events, NHL shot coordinates, football line direction and an MLB strikeout X. Syntax checks passed. No physical-device testing is claimed.
