/* User-uploaded Coppin State arena, for Coppin State home games only. */
(function(){
'use strict';
const source='../IMG_3760.webp';
function apply(){
 const dashboard=document.querySelector('.dashboard.sport-cbb');
 if(!dashboard)return;
 const home=dashboard.querySelector('.topbar .home,.scoreboard .home,.team.home');
 const text=(home?.textContent||'')+' '+(dashboard.querySelector('.topbar')?.textContent||'');
 if(!/COPPIN|\\bCOPP\\b/i.test(text))return;
 const backdrop=dashboard.querySelector('.matchup-backdrop');
 if(!backdrop)return;
 let img=backdrop.querySelector('img.venue-backdrop');
 if(!img){img=document.createElement('img');img.className='venue-backdrop';img.alt='Coppin State arena';img.setAttribute('aria-hidden','true');backdrop.append(img);}
 if(img.getAttribute('src')!==source)img.setAttribute('src',source);
 backdrop.style.setProperty('background-image',`linear-gradient(#02071135,#02071165),url("${source}")`,'important');
 backdrop.style.setProperty('background-position','center center','important');
 backdrop.style.setProperty('background-size','cover','important');
}
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}).observe(document.documentElement,{subtree:true,childList:true});
apply();
})();