'use strict';
const REVIEW_LEAGUES=[
 {code:'NFL',label:'NFL',sport:'football',league:'nfl'},
 {code:'NBA',label:'NBA',sport:'basketball',league:'nba'},
 {code:'NHL',label:'NHL',sport:'hockey',league:'nhl'},
 {code:'MLB',label:'MLB',sport:'baseball',league:'mlb'},
 {code:'WNBA',label:'WNBA',sport:'basketball',league:'wnba'},
 {code:'CFB',label:'College football',sport:'football',league:'college-football'},
 {code:'CBB',label:'College basketball',sport:'basketball',league:'mens-college-basketball'}
];
const grid=document.getElementById('review-grid'),dialog=document.getElementById('enlarged-board'),enlargedStage=document.getElementById('enlarged-stage');
const cards=new Map();let fallbackGames=[],enlargedCard=null,enlargedFrame=null;
function node(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function easternDate(date){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const p=Object.fromEntries(parts.map(v=>[v.type,v.value]));return p.year+p.month+p.day;}
function dateLabel(value){if(!/^\d{8}$/.test(value))return '';return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T12:00:00Z'));}
async function readJSON(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(url,{signal:controller.signal,cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw new Error('Game feed unavailable');return await r.json();}finally{clearTimeout(timer);}}
function boardURL(game){const params=new URLSearchParams({sport:game.code,date:game.date,event:game.event});return './review-view.html?'+params;}
function setStatus(card,state){card.status.className='status'+(state==='in'?' live':state==='post'?' recorded':state==='error'?' error':'');card.status.textContent=state==='in'?'LIVE':state==='post'?'RECORDED · FINAL':state==='error'?'UNAVAILABLE':'LOADING';if(card.game)card.date.textContent=dateLabel(card.game.date)+(state==='in'?' · Live game':state==='post'?' · Recorded game':'');}
function loadBoard(card){if(!card.game||card.frame)return;const f=document.createElement('iframe');f.title=card.config.label+' review board';f.src=boardURL(card.game);f.setAttribute('allow','fullscreen');card.stage.replaceChildren(f);card.frame=f;}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const card=cards.get(entry.target.id);loadBoard(card);observer.unobserve(entry.target);}}},{rootMargin:'180px'});
function createCard(config){
 const section=node('section','review-card');section.id=config.code;section.setAttribute('aria-labelledby','title-'+config.code);
 const header=node('div','card-header'),heading=node('div','card-heading'),title=node('h2','',config.label);title.id='title-'+config.code;
 const status=node('span','status','LOADING');status.setAttribute('aria-live','polite');heading.append(title,status);
 const controls=node('div','card-controls'),enlarge=node('button','enlarge','Enlarge'),retry=node('button','retry','Retry');enlarge.type=retry.type='button';enlarge.disabled=true;enlarge.setAttribute('aria-label','Enlarge '+config.label+' board');controls.append(enlarge,retry);header.append(heading,controls);
 const stage=node('div','review-stage'),placeholder=node('div','card-placeholder','Finding a game…');stage.append(placeholder);
 const footer=node('div','card-footer'),matchup=node('p','matchup',''),date=node('p','game-date','');footer.append(matchup,date);section.append(header,stage,footer);grid.append(section);
 const card={config,section,status,enlarge,retry,stage,matchup,date,frame:null,game:null,generation:0};cards.set(config.code,card);
 enlarge.addEventListener('click',()=>{if(!card.game)return;const frame=document.createElement('iframe');frame.title=config.label+' enlarged review board';frame.src=boardURL(card.game);document.getElementById('enlarged-title').textContent=config.label+' · '+(card.status.textContent==='LIVE'?'Live':dateLabel(card.game.date));enlargedCard=card;enlargedFrame=frame;enlargedStage.replaceChildren(frame);dialog.showModal();});
 retry.addEventListener('click',()=>resolveCard(card));observer.observe(section);return card;
}
async function findGame(config){
 const today=easternDate(new Date()),previous=new Date(today.slice(0,4)+'-'+today.slice(4,6)+'-'+today.slice(6,8)+'T12:00:00Z');previous.setUTCDate(previous.getUTCDate()-1);const yesterday=previous.toISOString().slice(0,10).replace(/-/g,'');
 const responses=await Promise.allSettled([today,yesterday].map(async date=>{const data=await readJSON('https://site.api.espn.com/apis/site/v2/sports/'+config.sport+'/'+config.league+'/scoreboard?limit=100&dates='+date);return (data.events||[]).filter(e=>['in','post'].includes(e.status?.type?.state)).map(e=>({code:config.code,date,event:String(e.id),name:e.name,state:e.status.type.state,startsAt:e.date}));}));
 const games=responses.flatMap(r=>r.status==='fulfilled'?r.value:[]),live=games.filter(g=>g.state==='in');
 if((live.length?live:games).length)return (live.length?live:games).sort((a,b)=>new Date(b.startsAt)-new Date(a.startsAt))[0];
 const fallback=fallbackGames.find(g=>g.code===config.code);if(fallback)return {...fallback,state:fallback.state==='post'?'post':'loading'};
 throw new Error('No game available');
}
async function resolveCard(card){
 const generation=++card.generation;card.section.classList.remove('failed');card.enlarge.disabled=true;card.frame=null;card.game=null;card.matchup.textContent='';card.date.textContent='';card.stage.replaceChildren(node('div','card-placeholder','Finding a game…'));setStatus(card,'loading');
 try{const game=await findGame(card.config);if(card.generation!==generation)return;card.game=game;card.matchup.textContent=game.name;setStatus(card,game.state);card.enlarge.disabled=false;
  card.stage.replaceChildren(node('div','card-placeholder','Board ready to load'));
  const r=card.section.getBoundingClientRect();if(r.top<innerHeight+180&&r.bottom>-180)loadBoard(card);else observer.observe(card.section);
 }catch(error){if(card.generation!==generation)return;card.game=null;card.section.classList.add('failed');setStatus(card,'error');card.matchup.textContent='This game could not load.';card.stage.replaceChildren(node('div','card-placeholder','Try refreshing this board.'));}
}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='mancave:review-state')return;const card=cards.get(event.data.sport);if(!card||card.game?.event!==event.data.event)return;const trustedCard=card.frame?.contentWindow===event.source,trustedEnlarged=enlargedCard===card&&enlargedFrame?.contentWindow===event.source;if(!trustedCard&&!trustedEnlarged)return;if(event.data.state==='error'){setStatus(card,'error');card.section.classList.add('failed');return;}if(['in','post'].includes(event.data.state)){card.section.classList.remove('failed');setStatus(card,event.data.state);if(enlargedCard===card)document.getElementById('enlarged-title').textContent=card.config.label+' · '+(event.data.state==='in'?'Live':dateLabel(card.game.date));}});
document.getElementById('close-enlarged').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{enlargedStage.replaceChildren();enlargedCard=null;enlargedFrame=null;});
document.getElementById('refresh-games').addEventListener('click',()=>{for(const card of cards.values())resolveCard(card);});
for(const config of REVIEW_LEAGUES)createCard(config);
(async()=>{try{const data=await readJSON('./review-fixtures.json?v=1');fallbackGames=data.games||[];}catch(error){fallbackGames=[];}await Promise.all([...cards.values()].map(resolveCard));})();
