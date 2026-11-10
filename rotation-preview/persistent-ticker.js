/* Persistent ticker lives in the rotation player, not the replaced game iframe. */
(function(){
'use strict';
const root=document.getElementById('persistent-ticker');
const strip=document.getElementById('persistent-ticker-strip');
const label=document.getElementById('persistent-ticker-label');
let signature='', cycle=0, startedAt=performance.now(), mode='';
const SPEED=42, FRAME_MS=1000/30;
let lastPaint=0;
const sports=['NFL','NBA','NHL','MLB','WNBA','CFB','CBB'];
const team=(event,side)=>{
 const c=event?.competitions?.[0]?.competitors||[];
 return c.find(x=>x.homeAway===side)||c[side==='home'?0:1]||{};
};
function update(games,selectedMode){
 const entries=games.filter(g=>g&&g.event&&(selectedMode==='final'?g.status==='final':['live','halftime','intermission','overtime'].includes(g.status)));
 if(!entries.length)return;
 // Keep the ticker content stable through spotlight changes. Only update on score changes.
 const nextSignature=selectedMode+'|'+entries.map(g=>g.sport+':'+g.id+':'+(team(g.event,'away').score||'')+':'+(team(g.event,'home').score||'')).join('|');
 if(nextSignature===signature)return;
 signature=nextSignature;mode=selectedMode;
 label.textContent='';root.dataset.mode=mode;
 const fragment=document.createDocumentFragment();
 for(let pass=0;pass<2;pass++)for(const g of entries){
  const item=document.createElement('span');item.className='persistent-match';
  for(const side of ['away','home']){
   const c=team(g.event,side),t=c.team||{};
   const cell=document.createElement('span');cell.className='persistent-team';
   const src=t.logo||t.logos?.[0]?.href||(g.sport==='CBB'&&/CHEY/.test(t.abbreviation||'')?'../A06F4D27-EC5C-4F25-AF50-6F59A24D9435.png':'');
   if(src){const img=document.createElement('img');img.src=src;img.alt='';cell.append(img);}
   const text=document.createElement('b');text.textContent=(t.abbreviation||t.shortDisplayName||'—')+' '+(c.score??'—');cell.append(text);item.append(cell);
  }
  const status=document.createElement('small');status.textContent=g.event.status?.type?.shortDetail||g.event.status?.type?.detail||'';item.append(status);fragment.append(item);
 }
 // Rebuild only on actual score/mode changes; never restart the animation clock.
 const oldDistance=cycle>40?((performance.now()-startedAt)*SPEED/1000)%cycle:0;
 strip.replaceChildren(fragment);
 requestAnimationFrame(()=>{
  cycle=strip.children[entries.length]?.offsetLeft-strip.firstElementChild?.offsetLeft||strip.scrollWidth/2;
  if(cycle>40)startedAt=performance.now()-oldDistance*1000/SPEED;
 });
 root.hidden=false;
}
// Absolute elapsed time prevents cumulative slowdown after dropped frames.
// Limit DOM writes to 30 fps; never read layout or computed style in this loop.
strip.style.animation='none';
function animate(now){
 if(cycle>40&&!root.hidden&&now-lastPaint>=FRAME_MS){
  const distance=((now-startedAt)*SPEED/1000)%cycle;
  strip.style.transform='translate3d('+(-distance)+'px,0,0)';
  lastPaint=now;
 }
 requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
window.ManCavePersistentTicker={update};
})();