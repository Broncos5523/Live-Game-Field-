'use strict';
const requested=new URLSearchParams(location.search),allowed=new Set(['NFL','NBA','NHL','MLB','WNBA','CFB','CBB']);
const sport=requested.get('sport'),date=requested.get('date'),eventId=requested.get('event'),frame=document.getElementById('frame'),waiting=document.getElementById('waiting');
let reported='';
function fit(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1280,innerHeight/720));}
addEventListener('resize',fit);fit();
function report(){try{
 const d=frame.contentDocument,board=d?.querySelector('.dashboard');
 if(!board||board.getAttribute('data-review-event')!==eventId||!board.classList.contains('sport-'+sport.toLowerCase()))return;
 waiting.hidden=true;
 const state=board.getAttribute('data-state');const message={type:'mancave:review-state',sport,event:eventId,state};
 if(JSON.stringify(message)!==reported){reported=JSON.stringify(message);parent.postMessage(message,location.origin);}
}catch(error){/* Wait until the same-origin board is available. */}}
if(allowed.has(sport)&&/^\d{8}$/.test(date||'')&&/^\d+$/.test(eventId||'')){
 const params=new URLSearchParams({sport,date,event:eventId});frame.src='./review-dashboard.html?'+params;
 frame.addEventListener('load',report);setInterval(report,700);
 setTimeout(()=>{if(!waiting.hidden){waiting.textContent='This board could not load. Please retry it from the review page.';parent.postMessage({type:'mancave:review-state',sport,event:eventId,state:'error'},location.origin);}},25000);
}else{waiting.textContent='Select a league from the all-league review page.';}
