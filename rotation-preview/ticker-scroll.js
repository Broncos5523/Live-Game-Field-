/* Ticker transport: move the strip itself, not the scroll container.
   Handles Final CSS transform overrides, short score lists, and rerenders. */
(function(){
'use strict';
let stripRef=null, origin=performance.now(), last=0;
function tick(now){
 const final=document.getElementById('ticker-track');
 const live=document.querySelector('.ticker .ticker-fade-content');
 const viewport=final||live;
 const strip=final?document.getElementById('ticker-content'):live?.firstElementChild;
 if(viewport&&strip&&strip.children.length){
  if(strip!==stripRef){stripRef=strip;origin=now;last=0;}
  // Final renderer supplies two identical passes. Extend short lists to
  // ensure the strip can actually travel beyond the viewport.
  if(final){
   const count=strip.children.length;
   if(count>=2&&count%2===0&&strip.scrollWidth<viewport.clientWidth*2.2){
    const originals=Array.from(strip.children).slice(0,count/2);
    if(originals.length){
     const frag=document.createDocumentFragment();
     for(let i=0;i<Math.min(20,Math.ceil(viewport.clientWidth*2.5/Math.max(1,strip.scrollWidth))*2);i++)
      for(const item of originals)frag.appendChild(item.cloneNode(true));
     strip.appendChild(frag);
    }
   }
  }
  const first=strip.firstElementChild;
  const midpoint=final?Math.floor(strip.children.length/2):Math.floor(strip.children.length/2);
  const marker=strip.children[midpoint];
  let cycle=marker&&first?marker.offsetLeft-first.offsetLeft:strip.scrollWidth/2;
  if(!Number.isFinite(cycle)||cycle<40)cycle=strip.scrollWidth/2;
  if(cycle>40){
   const speed=42; // pixels per second, independent of number of games
   const x=((now-origin)/1000*speed)%cycle;
   // Inline !important overrides legacy 'transform:none!important'.
   strip.style.setProperty('transform','translate3d('+(-x).toFixed(2)+'px,0,0)','important');
   strip.style.setProperty('animation','none','important');
   if(final&&window.tickerAnimation){window.tickerAnimation.cancel();window.tickerAnimation=null;}
   last=x;
  }
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
})();