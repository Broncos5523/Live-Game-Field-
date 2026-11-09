/* Continuous ticker transport independent of CSS animation and React re-renders.
   Moves only ticker overflow; never animates playing surfaces. */
(function(){
'use strict';
const params=new URLSearchParams(location.search);
const sport=params.get('sport')||'';
let start=Date.now(),lastSport=sport;
function frame(){
 const final=document.getElementById('ticker-track');
 const live=document.querySelector('.ticker .ticker-fade-content');
 const viewport=final||live;
 const strip=final?document.getElementById('ticker-content'):live?.firstElementChild;
 if(viewport&&strip){
  const contentWidth=strip.scrollWidth;
  const cycle=contentWidth/2;
  if(cycle>0&&contentWidth>viewport.clientWidth){
   const duration=Math.max(25000,(strip.children.length/2)*6000);
   const elapsed=Date.now()-start;
   viewport.scrollLeft=(elapsed%duration)/duration*cycle;
  }
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
