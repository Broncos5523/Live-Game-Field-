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
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animation?.cancel();
    // Highlight the reported event without drawing a tracking path.
    const scoring = /hits?\b|makes?\b|scores?\b|\bgoal\b/i.test(play) && !/miss|saved|blocked|no goal/i.test(play);
    const color = scoring ? '#ffcf70' : surface.matches('.hockey-rink') ? '#53bfff' : '#fff2cf';
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
