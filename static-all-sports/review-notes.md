# Consolidated all-league review

Open `/static-all-sports/review.html` for the single review page. Seven cards share the approved 1280x720 broadcast layout. Jump links and an Enlarge/Close dialog work without downloading anything or leaving the page.

Each card first checks current and previous Eastern-calendar-day scoreboards for a real live or completed game. If neither has a suitable game, it uses a previously verified recorded fixture from `review-fixtures.json`. Live and recorded states are taken from real feed data, and the frame reports its actual state to the parent as it updates. Recorded cards show their dates and FINAL. Unavailable data never becomes a simulated game.

Only visible or nearby cards load their boards. Every board fetches one selected event, reducing repeated summary requests. Refresh games finds current matchups again. The dialog's state label updates when its live game finishes, and its iframe is released on Close. Messages are accepted only from the expected same-origin card/dialog frame and selected event.

`review-app.js` is a copy of the static preview bundle from commit 81522af9a5a2eb3e4751017d97e492c37e6e0009. Two bounded changes select the requested event and expose its ID on the dashboard for readiness checks. Existing app code, production, Build 32, artwork and earlier previews are not modified. `review-dashboard.html` uses the existing style/assets and only hides current-drive/down decorations on recorded finals, where those concepts no longer apply.

Verification: all seven exact event IDs loaded in the browser, each at 1280x720, with identical hero/surface-panel/leaders/ticker geometry. No application console errors or failed rendered images were observed. Enlarge/Close was checked on desktop and in a 390x844 phone viewport; the phone page had no horizontal overflow. Current CBB and real recorded NFL/NBA/NHL/MLB/WNBA/CFB games were used. This is browser verification, not physical iPhone or TV testing. Source JavaScript syntax checks passed.

The default live board remains `/static-all-sports/`. This review page does not promote it to production or imply user design approval.
