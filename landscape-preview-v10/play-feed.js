window.MancavePlayFeed = (() => {
  function latestBasketballPlay(competition, summary, status) {
    const scoreboardPlay = competition.situation?.lastPlay;
    const plays = Array.isArray(summary.plays) ? summary.plays : [];
    if (scoreboardPlay?.text) {
      const match = scoreboardPlay.id == null ? null
        : plays.find(play => play.id != null && String(play.id) === String(scoreboardPlay.id));
      return match ? {
        ...match,
        ...scoreboardPlay,
        team: scoreboardPlay.team?.id ? scoreboardPlay.team : match.team
      } : scoreboardPlay;
    }

    const period = Number(status.period);
    const clock = clockSeconds(status.displayClock);
    if (!period || clock == null) return null;
    for (let index = plays.length - 1; index >= 0; index--) {
      const play = plays[index];
      const playPeriod = Number(play.period?.number);
      const playClock = clockSeconds(play.clock?.displayValue);
      if (play.text && playClock != null && playPeriod > 0
        && (playPeriod < period || (playPeriod === period && playClock >= clock))) return play;
    }
    return null;
  }

  function clockSeconds(value) {
    const parts = String(value || '').match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
    return parts ? Number(parts[1] || 0) * 60 + Number(parts[2]) : null;
  }

  function basketballCue(play, away, home) {
    if (!play?.text) return null;
    const teamId = play.team?.id;
    const side = teamId == null ? null : [away, home].find(team => String(team.id) === String(teamId));
    if (!side) return null;
    const text = play.text;
    const description = [play.type?.text, text].filter(Boolean).join(' ');
    const freeThrow = /free throw/i.test(description);
    const block = /\b(?:blocks?|blocked|block shot)\b/i.test(description);
    const miss = /\bmiss(?:es|ed)?\b/i.test(description);
    const turnover = /\b(?:turnover|steal|steals|lost ball|bad pass|offensive foul)\b/i.test(description);
    const made = !miss && !block && (play.scoringPlay === true || /\b(?:make[sd]?|made|hits?)\b/i.test(description));
    const shotValue = Number(play.scoreValue);
    const three = /\b(?:three[ -]point|3[ -]point|3pt)/i.test(description);
    const points = made ? (freeThrow ? 1 : [2, 3].includes(shotValue) ? shotValue : three ? 3 : 2) : 0;
    const kind = /time[ -]?out/i.test(description) ? 'timeout'
      : block ? 'block' : turnover ? 'turnover' : miss ? 'miss' : points ? 'make' : null;
    if (!kind) return null;
    const shootingTeam = block && /\bblocks?\b/i.test(text) && !miss
      ? (side === away ? home : away) : side;
    const distance = text.match(/\b(\d{1,2})\s*(?:-\s*)?(?:foot|feet|ft)\b/i);
    return {
      id: String(play.id ?? JSON.stringify([play.period?.number, play.clock?.displayValue, teamId, text])),
      kind, points, side: shootingTeam === away ? 'away' : 'home', color: shootingTeam.color,
      feet: freeThrow ? 15 : distance ? Number(distance[1]) : three ? 24
        : /layup|dunk|tip[ -]?in/i.test(description) ? 3 : 14
    };
  }

  function footballPosition(label, away, home) {
    const spot = String(label || '').trim().toUpperCase();
    if (/^(?:\S+\s+)?50$|^MIDFIELD$/.test(spot)) return 50;
    const parts = spot.match(/^([A-Z0-9]+)\s+(\d{1,2})$/);
    if (!parts || Number(parts[2]) > 50) return null;
    const yards = Number(parts[2]);
    if (parts[1] === away.short.toUpperCase()) return 6 + yards * .88;
    if (parts[1] === home.short.toUpperCase()) return 94 - yards * .88;
    return null;
  }

  function footballField(situation, away, home) {
    const ball = footballPosition(situation.possessionText, away, home);
    const drive = situation.lastPlay?.drive || situation.drive;
    const start = footballPosition(drive?.start?.text, away, home);
    return {ball, start};
  }

  return {latestBasketballPlay, basketballCue, footballField};
})();
