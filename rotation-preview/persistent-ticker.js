/* Persistent ticker lives in the rotation player, not the replaced game iframe. */
(function(){
'use strict';
const root=document.getElementById('persistent-ticker');
const strip=document.getElementById('persistent-ticker-strip');
const label=document.getElementById('persistent-ticker-label');
let signature='', cycle=0, travelled=0, previous=performance.now(), mode='';
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
 // Retain absolute travel distance; never restart the crawl when content changes.
 strip.replaceChildren(fragment);
 requestAnimationFrame(()=>{cycle=strip.children[entries.length]?.offsetLeft-strip.firstElementChild?.offsetLeft||strip.scrollWidth/2;});
 root.hidden=false;
}
function frame(now){
 const elapsed=Math.min(0.1,Math.max(0,(now-previous)/1000));previous=now;
 travelled+=elapsed*42;
 if(cycle>40)strip.style.transform='translate3d('+(-(travelled%cycle)).toFixed(2)+'px,0,0)';
 requestAnimationFrame(frame);
}
window.ManCavePersistentTicker={update};
requestAnimationFrame(frame);
})();