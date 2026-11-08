(() => {
  let previous;
  let currentCourtKey;
  let clearCourt = () => {};
  const seenPlays = new Map();
  let animation;
  function update() {
    const story = document.querySelector('.game-story.is-live');
    const court = story?.querySelector('.basketball-court');
    if (court) {
      const cue = JSON.parse(court.dataset.playCue);
      const game = court.dataset.gameId;
      const key = JSON.stringify([game, cue]);
      if (currentCourtKey === key) return;
      currentCourtKey = key;
      clearCourt();
      const call = story.querySelector('.play-call');
      const labels = {make: cue?.points + ' MADE', miss:'SHOT MISSED', block:'BLOCK',
        turnover:'TURNOVER', timeout:'TIMEOUT'};
      if (call) call.textContent = labels[cue?.kind] || '';
      if (!cue || (!game.startsWith('demo-') && seenPlays.get(game) === cue.id)) return;
      if (seenPlays.size >= 128) seenPlays.delete(seenPlays.keys().next().value);
      seenPlays.set(game, cue.id);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) clearCourt = animateCourt(court, cue);
      return;
    }
    currentCourtKey = undefined;
    clearCourt();
    const surface = story?.querySelector('.hockey-rink');
    if (!surface) { previous = undefined; return; }
    const play = story.querySelector('.story-event strong')?.textContent.trim();
    const game = document.querySelector('.hero')?.getAttribute('aria-label');
    const clock = story.querySelector('.story-event > b')?.textContent;
    if (!play || /waiting|no play/i.test(play)) return;
    const key = JSON.stringify([game, clock, play]);
    if (key === previous) return;
    previous = key;
    const events = [
      [/\bsav(?:e|es|ed)\b/i, 'SAVE', '#72cfff'],
      [/\b(?:goal|scores)\b/i, 'GOAL', '#ffcf70'],
      [/\bshot on goal\b/i, 'SHOT ON GOAL', '#f4f9ff']
    ];
    const filtered = /shot on goal|no goal|disallowed goal|goalie|missed|blocked|wide/i.test(play)
      ? events.filter((event) => event[1] !== 'GOAL') : events;
    const event = filtered.find(([pattern, cue]) =>
      pattern.test(play) && (cue !== 'SHOT ON GOAL' || !/missed|blocked|wide/i.test(play)));
    const call = story.querySelector('.play-call');
    if (call && call.textContent !== (event?.[1] || '')) call.textContent = event?.[1] || '';
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
  function animateCourt(court, cue) {
    const ns = 'http://www.w3.org/2000/svg';
    const overlay = document.createElementNS(ns, 'svg');
    overlay.classList.add('court-motion');
    const surface = court.parentElement;
    const courtBounds = court.getBoundingClientRect();
    const surfaceBounds = surface.getBoundingClientRect();
    const width = surface.clientWidth;
    const height = surface.clientHeight;
    if (!width || !height || !surfaceBounds.width || !surfaceBounds.height) return () => {};
    const courtLeft = (courtBounds.left - surfaceBounds.left) * width / surfaceBounds.width;
    const courtWidth = courtBounds.width * width / surfaceBounds.width;
    const courtY = (courtBounds.top + courtBounds.height / 2 - surfaceBounds.top)
      * height / surfaceBounds.height;
    const courtX = fraction => courtLeft + courtWidth * fraction;
    const center = courtX(.5);
    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
    overlay.setAttribute('aria-hidden', 'true');
    surface.append(overlay);
    const timers = [];
    function add(tag, attributes, text) {
      const element = document.createElementNS(ns, tag);
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      if (text) element.textContent = text;
      overlay.append(element);
      return element;
    }
    function pulse(element, delay, duration, iterations = 1) {
      element.animate([{opacity:0}, {opacity:1, offset:.18}, {opacity:1, offset:.7}, {opacity:0}],
        {delay, duration, iterations, fill:'both'});
    }
    const left = cue.side === 'away';
    const rim = courtX(left ? .032 : .968);
    const inward = left ? 1 : -1;
    let duration = 1450;
    if (cue.kind === 'timeout') {
      surface.classList.add('court-timeout');
      pulse(add('text', {x:center, y:courtY - 20, fill:cue.color, stroke:'#fff'}, 'TIMEOUT'), 0, 650, 2);
    } else if (cue.kind === 'turnover') {
      const ball = add('circle', {cx:center, cy:courtY, r:10, fill:'#f02c40', stroke:'#38121c', 'stroke-width':2});
      const seams = add('path', {d:`M${center-10} ${courtY}h20 M${center} ${courtY-10}q-8 10 0 20 m0-20q8 10 0 20`,
        stroke:'#38121c', fill:'none'});
      pulse(ball, 0, 1000);
      pulse(seams, 0, 1000);
    } else {
      const from = rim + inward * courtWidth * Math.min(.43, Math.max(.034, cue.feet / 97));
      const lift = Math.min(50, Math.max(26, Math.abs(from - rim) * .32), courtY * .6);
      const arcTop = courtY - lift * 2;
      const blocked = cue.kind === 'block';
      const endX = blocked ? (from + rim) / 2 : rim;
      const endY = blocked ? courtY - lift : courtY;
      const controlX = blocked ? from + (rim - from) / 4 : (from + rim) / 2;
      add('circle', {cx:from, cy:courtY, r:6, fill:cue.color, stroke:'#fff', 'stroke-width':2});
      const arc = add('path', {
        d:`M ${from} ${courtY} Q ${controlX} ${blocked ? endY : arcTop} ${endX} ${endY}`,
        fill:'none', stroke:'#fff7d2', 'stroke-width':3, 'stroke-linecap':'round',
        pathLength:1, 'stroke-dasharray':1
      });
      arc.animate([{strokeDashoffset:1}, {strokeDashoffset:0}],
        {duration:380, fill:'both', easing:'ease-out'});
      if (cue.kind === 'make') {
        const wave = add('ellipse', {cx:rim, cy:courtY, rx:10, ry:Math.min(34, height * .24), stroke:'#20ea78',
          'stroke-width':4, fill:'none'});
        wave.animate([{opacity:0}, {opacity:1, offset:.12}, {opacity:0, transform:`translateX(${center - rim}px)`}],
          {delay:380, duration:1150, fill:'both', easing:'ease-out'});
        pulse(add('text', {x:courtX(left ? .25 : .75), y:courtY - 16, fill:'#73ff9e'}, '+' + cue.points), 930, 1000);
        duration = 2000;
      } else {
        const cross = add('path', {
          d:`M${endX-6} ${endY-6}l12 12m0-12l-12 12`,
          stroke:'#f02c40', 'stroke-width':5, 'stroke-linecap':'round'
        });
        pulse(cross, 380, 1000);
      }
    }
    function cleanup() {
      timers.forEach(clearTimeout);
      overlay.remove();
      surface.classList.remove('court-timeout');
    }
    timers.push(setTimeout(cleanup, duration));
    return cleanup;
  }

  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; update(); });
  }).observe(document.getElementById('app'), { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-play-cue', 'data-game-id'] });
  update();
})();
