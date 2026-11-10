(function(){'use strict';
const model=window.ManCaveThreeTier;
const root=document.getElementById('three-tier-review');
if(!model||!root)return;
window.renderManCaveThreeTier=function(payload){
 const p=payload||{},e=p.event||{};
 root.style.setProperty('--event-gradient',model.gradient(e,p.teams));
 const description=root.querySelector('[data-event-description]');
 const label=root.querySelector('[data-event-label]');
 const stats=root.querySelector('[data-event-stats]');
 const portrait=root.querySelector('[data-event-headshot]');
 if(description)description.textContent=e.description||'Event information unavailable';
 if(label)label.textContent=e.label||'LAST EVENT';
 if(stats)stats.textContent=e.stats||'';
 if(portrait){
   portrait.replaceChildren();
   if(e.headshotUrl&&/^https:\/\//.test(e.headshotUrl)){
     const img=document.createElement('img');img.src=e.headshotUrl;img.alt='Event player portrait';portrait.append(img);
   }
 }
 const timeouts=root.querySelector('[data-timeouts]');
 if(timeouts){
   timeouts.replaceChildren();
   model.timeouts(p.timeoutsRemaining,p.timeoutsTotal).forEach(t=>{
     const dot=document.createElement('span');dot.className='timeout-dot '+(t.available?'available':'used');
     dot.setAttribute('aria-label',t.available?'Timeout available':'Timeout used');timeouts.append(dot);
   });
 }
 const network=root.querySelector('[data-network-logo]');
 if(network){
   // Keep logo mounted regardless of event updates. Only change on verified logo URL.
   if(p.networkLogoUrl&&/^https?:\/\//.test(p.networkLogoUrl))network.src=p.networkLogoUrl;
   network.hidden=false;
 }
 const live=root.querySelector('[data-live-indicator]');
 if(live)live.hidden=p.isLive===false;
};
})();