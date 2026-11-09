# SportScore NBA court integration — verified status, November 8, 2026

The court replacement is blocked. The separate startup repair preview retains the existing NBA court and animations; it is not a completed SportScore integration.

## Confirmed startup root cause

The unchanged `/landscape-preview-v12/` crashes when real data replaces the initial loading state. Browser stack:

```
NotFoundError: Failed to execute 'insertBefore' on 'Node':
The node before which the new node is to be inserted is not a child of this node.
Hu — app-football-review.js?v=football17:8:94793
Rl — app-football-review.js?v=football17:8:105477
```

A local instrumented copy recorded the missing reference as `<b class="field-position">BALL SPOT</b>`. It was removed by `football-branding.js:81:62`. React then attempted to insert `.drive-path` and `.football-ball` before that detached reference. Removing React-owned nodes was the confirmed cause.

`football-branding-react-safe.js` leaves that node mounted and sets its display to none. It also cleans up football-only decorator nodes on rotation to another sport and avoids rebuilding unchanged timeout dots on every observer callback. Only the new startup preview loads this script; the original branding script, production, Build 32, styles, artwork, data and animation bundles are unchanged.

Preview: `startup-fixed-review.html`. It uses a 1280 × 720 inner dashboard and scales as a complete frame on phones. The underlying application uses live multi-sport ESPN data and is not forced into football demo mode.

## SportScore capability verification

| Requirement | Verified finding |
| --- | --- |
| Standard animated NBA embed | Renders the real tracker, with a separate upstream cross-origin iframe and its own scoreboard. |
| Select a specific matchup | Supported by the public embed loader's `data-slug`; verified the actual Miami–Sacramento fixture, not a manually chosen team logo. |
| Home-team identity | The public CORS-open matches API returns home, away, home_logo, away_logo, fixture time and match URL. The fixture URL supplies the slug; slug word order must not be interpreted as home/away. |
| Court-only display | No supported control was found in the official gallery, its builder or the public embed loader. The provider frame includes its scoreboard, quarter totals, controls and attribution. |
| Host access to the internal court | The court is inside nested cross-origin iframes. The host cannot inspect or modify that court through normal page DOM access. The public loader supports resize messages, not a court geometry or game identity event contract. |
| Automatic center-court branding | Team identity is available separately, but no supported logo injection or court-coordinate contract was found. An external logo overlay would rely on guessed geometry. It has not been implemented. |
| Cropping/customization permission | The official embedding guidance requires visible built-in attribution. A court-only crop or arbitrary rebranding is not documented. Permission has not been established. |

Official sources inspected:

- https://sportscore.com/embed/
- https://sportscore.com/embed.js
- https://sportscore.com/developers/
- https://sportscore.com/developers/api/
- https://sportscore.com/developers/openapi.yaml
- https://sportscore.com/developers/terms/
- https://sportscore.com/terms/
- Specific supported tracker route: https://sportscore.com/embed/tracker/basketball/miami-heat-vs-sacramento-kings/
- Live identity API: https://sportscore.com/api/widget/matches/?sport=basketball&limit=50

The provider's actual API response identified Sacramento Kings as home and Miami Heat as away; the route slug is `miami-heat-vs-sacramento-kings`. A separate observed fixture identified Los Angeles Clippers as home and New Orleans Pelicans as away. Provider and ESPN scores can have different update times; matching teams and scheduled fixture time is necessary before an integration could be enabled.

## Browser verification

- Reproduced the original crash and captured the exception stack and removal stack.
- Original Build 32 and the isolated no-branding/no-motion diagnostic load independently.
- The repaired preview ran live NFL and NBA rotation, including two NBA matchups, with no application errors observed.
- Checked 1280 × 720 and 390 × 844 browser iframe viewports; no failed team or player images observed.
- Confirmed football decorator nodes are absent on NBA pages after rotation.
- Browser extension metadata errors were unrelated to the dashboard and were excluded from application error counts.
- No claim is made of physical-iPhone testing or full regression testing of every sport. Unchanged source bundles remain authoritative.

## Next viable path

Keep the existing approved native court and animations while obtaining a provider-supported, attributed court-only embed with a fixture identifier and documented logo/geometry support. If SportScore supplies that contract, the fixture slug and home identity checks already verified here can support game synchronization. Do not ship the old league-wide widget overlay or guessed logo/crop as a finished replacement.
