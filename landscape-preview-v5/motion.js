(() => {
  let previous;
  let animation;
  function update() {
    const story = document.querySelector('.game-story.is-live');
    const surface = story?.querySelector('.basketball-court, .hockey-rink');
    if (!surface) { previous = undefined; return; }
    const play = story.querySelector('.story-event strong')?.textContent.trim();
    const game = document.querySelector('.hero')?.getAttribute('aria-label');
    const clock = story.querySelector('.story-event > b')?.textContent;
    if (!play || /waiting|no play/i.test(play)) return;
    const key = JSON.stringify([game, clock, play]);
    if (key === previous) return;
    previous = key;
    const hockey = surface.matches('.hockey-rink');
    const events = hockey ? [
      [/\bsav(?:e|es|ed)\b/i, 'SAVE', '#72cfff'],
      [/\b(?:goal|scores)\b/i, 'GOAL', '#ffcf70'],
      [/\bshot on goal\b/i, 'SHOT ON GOAL', '#f4f9ff']
    ] : [
      [/\bturnover\b|\bsteal\b/i, 'TURNOVER', '#72cfff'],
      [/\bmiss(?:es|ed)?\b/i, 'SHOT MISSED', '#ff9f8a'],
      [/\b(?:hit|hits|makes?|made)\b.*(?:3-pointer|three.point|3.point)/i, '3 MADE', '#ffcf70'],
      [/\b(?:hit|hits|makes?|made)\b/i, 'SHOT MADE', '#ffcf70']
    ];
    const filtered = hockey && /shot on goal|no goal|disallowed goal|goalie|missed|blocked|wide/i.test(play)
      ? events.filter((event) => event[1] !== 'GOAL') : events;
    const event = filtered.find(([pattern, cue]) =>
      pattern.test(play) && (cue !== 'SHOT ON GOAL' || !/missed|blocked|wide/i.test(play)));
    story.dataset.playCue = event?.[1] || '';
    const color = event?.[2];
    if (color) story.style.setProperty('--cue-color', color);
    animation?.cancel();
    if (!color || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scoring = color === '#ffcf70';
    animation = surface.animate([
      { filter: 'none' },
      { filter: 'brightness(1.24) drop-shadow(0 0 8px ' + color + ')', offset: .32 },
      { filter: 'none' }
    ], { duration: scoring ? 1050 : 650, easing: 'ease-out' });
  }
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; update(); });
  }).observe(document.getElementById('app'), { childList: true, subtree: true, characterData: true });
  update();
})();
