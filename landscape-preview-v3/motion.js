(() => {
  const lines = {
    '.basketball-court': `<svg viewBox="0 0 94 50" aria-hidden="true" class="surface-lines">
      <g fill="none" stroke="#fff4d5" stroke-width=".65">
        <path d="M.5 .5H93.5V49.5H.5ZM47 0V50M0 17H19V33H0M94 17H75V33H94
          M0 3H14Q39 25 14 47H0M94 3H80Q55 25 80 47H94M4 22V28M90 22V28"/>
        <circle cx="47" cy="25" r="6"/><circle cx="19" cy="25" r="6"/><circle cx="75" cy="25" r="6"/>
        <circle cx="5.25" cy="25" r=".75"/><circle cx="88.75" cy="25" r=".75"/>
      </g></svg>`,
    '.hockey-rink': `<svg viewBox="0 0 200 85" aria-hidden="true" class="surface-lines">
      <rect x="1" y="1" width="198" height="83" rx="27" fill="none" stroke="#338ab5" stroke-width="2"/>
      <path d="M75 0V85M125 0V85" stroke="#1976d2" stroke-width="3"/>
      <path d="M100 0V85M11 9V76M189 9V76" stroke="#e4243b" stroke-width="1.5"/>
      <g fill="none" stroke="#df3348" stroke-width="1">
        <circle cx="31" cy="20.5" r="15"/><circle cx="31" cy="64.5" r="15"/>
        <circle cx="169" cy="20.5" r="15"/><circle cx="169" cy="64.5" r="15"/>
      </g><circle cx="100" cy="42.5" r="15" fill="none" stroke="#1976d2"/>
      </svg>`
  };
  let previous;
  let animation;
  function update() {
    const story = document.querySelector('.game-story.is-live');
    const surface = story?.querySelector('.basketball-court, .hockey-rink');
    if (!surface) { previous = undefined; return; }
    let layer = surface.querySelector('.play-motion');
    if (!layer) {
      surface.insertAdjacentHTML('afterbegin', lines[surface.matches('.hockey-rink') ? '.hockey-rink' : '.basketball-court']);
      layer = document.createElement('span');
      layer.className = 'play-motion';
      layer.setAttribute('aria-hidden', 'true');
      surface.append(layer);
    }
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
    const scoring = /makes?\b|scores?\b|\bgoal\b/i.test(play) && !/miss|saved|blocked|no goal/i.test(play);
    const color = scoring ? '#ffcf70' : surface.matches('.hockey-rink') ? '#53bfff' : '#fff2cf';
    animation = layer.animate([
      { opacity: 0, boxShadow: 'inset 0 0 0 2px ' + color, transform: 'scale(.88)' },
      { opacity: 1, boxShadow: 'inset 0 0 20px ' + color, transform: 'scale(1)', offset: .32 },
      { opacity: 0, boxShadow: 'inset 0 0 0 2px ' + color, transform: 'scale(1)' }
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
