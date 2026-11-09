'use strict';
const CONFIG={NFL:['football','nfl'],NBA:['basketball','nba'],NHL:['hockey','nhl'],MLB:['baseball','mlb'],WNBA:['basketball','wnba'],CFB:['football','college-football'],CBB:['basketball','mens-college-basketball']};
const cacheKey='mancave-approved-rotation-v1',stage=document.getElementById('stage'),notice=document.getElementById('notice'),startup=document.getElementById('startup');
let saved={};try{saved=JSON.parse(localStorage.getItem(cacheKey)||'{}');}catch{}
const store=new ManCaveEngine.Store(saved.records||{}),scheduler=new ManCaveEngine.Scheduler();
const ranks={},seen={},latest={},tickerStarts={},historyChecked={},busy=new Set();let active=null,pending=false,polling=false,historyBusy=false,lastDiscovery=0,lastFinals=0,lastStats=0;
const confirmationTimeout=g=>g.status==='final'?180000:30000;
const api=s=>'https://site.api.espn.com/apis/site/v2/sports/'+CONFIG[s].join('/');
function day(t){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(t);return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('');}
async function json(url){const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('HTTP '+response.status);return response.json();}
function save(){try{localStorage.setItem(cacheKey,JSON.stringify({records:ManCaveEngine.cacheRecords(store.records,scheduler.current?scheduler.current.sport+':'+scheduler.current.id:null),at:Date.now()}));}catch{}}
async function rankings(sport){if(!['CFB','CBB'].includes(sport))return;try{const data=await json(api(sport)+'/rankings');const poll=ManCaveEngine.selectRankPoll(data,sport);if(poll?.ranks?.length)ranks[sport]=Object.fromEntries(poll.ranks.filter(r=>r.team?.id&&Number.isInteger(Number(r.current))&&Number(r.current)>=1&&Number(r.current)<=25).map(r=>[String(r.team.id),Number(r.current)]));}catch{}}
async function board(sport,date){const group=sport==='CFB'?'&groups=80':sport==='CBB'?'&groups=50':'';const data=await json(api(sport)+'/scoreboard?limit=1000'+group+'&dates='+date);if(!Array.isArray(data.events))throw Error('Missing events');return data.events;}
function meta(sport){return {ranks:ranks[sport]||{},division:sport==='CFB'?'FBS':sport==='CBB'?'D1':undefined};}
function summaryEvent(summary,g){const c=summary.header?.competitions?.[0];if(!c||String(summary.header.id)!==g.id)return null;const event={...g.event,competitions:[c],status:c.status||summary.header.status||g.event.status};return ManCaveEngine.valid(event)?event:null;}
async function refreshGame(g,stats=true){const key=g.sport+':'+g.id;if(busy.has(key))return;busy.add(key);try{const summary=await json(api(g.sport)+'/summary?event='+g.id),event=summaryEvent(summary,g);if(event){
 // Summary is a same-provider recovery path, never an independent-provider claim.
 const observation=summary.meta?.lastUpdated||summary.header?.lastUpdated;
 const newer=Date.parse(observation)||0;
 if(g.missingSince){store.ingest(g.sport,event,summary,Date.now(),{...meta(g.sport),fallback:true,verified:!!newer,observedAt:newer});}
 else{const previous=store.records[key];store.ingest(g.sport,event,stats?summary:{...summary,boxscore:previous?.summary?.boxscore,leaders:previous?.summary?.leaders},Date.now(),meta(g.sport));}
 save();}
}catch{}finally{busy.delete(key);}}
async function discover(){await Promise.all(ManCaveRotation.SPORTS.map(async sport=>{try{const dates=[day(Date.now()),day(Date.now()-86400000)];const results=await Promise.all(dates.map(d=>board(sport,d)));const events=Array.from(new Map(results.flat().map(e=>[String(e.id),e])).values());latest[sport]=events;const ids=new Set(events.map(e=>String(e.id)));seen[sport]=Date.now();for(const event of events){const old=store.records[sport+':'+event.id];if(!old||old.status==='scheduled')store.ingest(sport,event,null,Date.now(),meta(sport));else old.missingSince=null;}store.missing(sport,ids,Date.now());}catch{/* Failed discovery is missing verification, never an empty final result. */store.missing(sport,new Set(),Date.now());}}));save();}
async function findFinals(){
 if(historyBusy)return;historyBusy=true;
 try{await Promise.all(ManCaveRotation.SPORTS.map(async sport=>{
  if(Date.now()-(historyChecked[sport]||0)<3600000)return;
  if(store.games().some(g=>g.sport===sport&&g.status==='final'&&day(Date.parse(g.startedAt))>=day(Date.now()-86400000))){historyChecked[sport]=Date.now();return;}
  const now=Date.now();for(let offset=0;offset<365;offset+=30){try{
   const events=await board(sport,day(now-(offset+30)*86400000)+'-'+day(now-offset*86400000));
   const finals=events.filter(e=>ManCaveEngine.status(e)==='final').sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
   if(finals.length){const latestDay=day(Date.parse(finals[0].date));for(const e of finals.filter(x=>day(Date.parse(x.date))===latestDay))store.ingest(sport,e,null,now,meta(sport));historyChecked[sport]=now;return;}
  }catch{return;}}
  historyChecked[sport]=now;
 }));save();}finally{historyBusy=false;}
}
function snapshot(g){const same=ManCaveRotation.select(store.games(),Date.now()).games.filter(x=>x.sport===g.sport);tickerStarts[g.sport]??=Date.now();return {tickerStartedAt:tickerStarts[g.sport],sport:g.sport,ranks:{home:g.home.rank,away:g.away.rank},event:g.event,summary:g.summary||{},events:same.map(x=>x.event),recent:same.some(x=>Date.now()-Date.parse(x.finishedAt)<86400000),totalFinals:ManCaveRotation.finalRotation(store.games(),Date.now()).length,liveCount:ManCaveRotation.liveRotation(store.games()).length};}
async function present(choice){if(pending)return;if(choice.empty){if(active){active.classList.add('active');startup.hidden=true;notice.textContent='Waiting for verified games · showing last verified board';stage.dataset.mode='cached';}else{startup.hidden=false;document.getElementById('startup-text').textContent='No verified games available · retrying automatically';notice.textContent='Waiting for verified games · retrying automatically';stage.dataset.mode='waiting';}return;}pending=true;let next=null;try{let g=store.records[choice.game.sport+':'+choice.game.id];if(g.summary?.header){if(Date.now()-g.confirmedAt>=(choice.mode==='final'?60000:10000))refreshGame(g).catch(()=>{});}else{await refreshGame(g);g=store.records[g.sport+':'+g.id];}if(!g.summary?.header||String(g.summary.header.id)!==String(g.id))throw Error('No verified game summary');next=document.createElement('iframe');next.title='Man Cave '+g.sport+' '+choice.mode+' board';next.dataset.event=g.id;next.dataset.mode=choice.mode;const ready=new Promise((resolve,reject)=>{next.onload=resolve;next.onerror=reject;setTimeout(()=>reject(Error('Board load timeout')),20000);});next.src='./'+(choice.mode==='final'?'final':'live')+'.html?sport='+g.sport;stage.append(next);await ready;if(typeof next.contentWindow.receiveApproved!=='function')throw Error('Board unavailable');const snap=snapshot(g);await next.contentWindow.receiveApproved(snap);next.dataset.snapshot=JSON.stringify(snap);next.classList.add('active');const previous=active;active=next;startup.hidden=true;setTimeout(()=>previous?.remove(),800);scheduler.deadline=Date.now()+choice.durationMs;stage.dataset.mode=choice.mode;stage.dataset.event=g.id;stage.dataset.startedAt=String(Date.now());stage.dataset.endsAt=String(scheduler.deadline);notice.textContent=!navigator.onLine?'Offline · last verified data':Date.now()-g.confirmedAt>=confirmationTimeout(g)?'Feed delayed · last verified data':'';}catch(error){next?.remove();notice.textContent='Keeping last verified board · retrying automatically';scheduler.deadline=Date.now()+1000;}finally{pending=false;}}
function fit(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1280,innerHeight/720));}addEventListener('resize',fit);fit();
async function tick(){if(pending)return;const now=Date.now();const choice=scheduler.next(store.games(),now);if(choice)await present(choice);else if(active&&scheduler.current){const g=store.records[scheduler.current.sport+':'+scheduler.current.id];if(g){const snap=snapshot(g),stamp=JSON.stringify(snap);if(active.dataset.snapshot!==stamp){await active.contentWindow.receiveApproved(snap);active.dataset.snapshot=stamp;}const stale=now-g.confirmedAt>=confirmationTimeout(g)||(['live','overtime'].includes(g.status)&&now-g.changedAt>=120000);notice.textContent=!navigator.onLine?'Offline · last verified data':stale?'Feed delayed · last verified data':'';}}
}
async function poll(){
 if(polling)return;polling=true;
 try{const now=Date.now(),jobs=[];
  if(now-lastDiscovery>=30000){lastDiscovery=now;jobs.push(discover());}
  const stats=now-lastStats>=30000;if(stats)lastStats=now;
  const live=store.games().filter(g=>ManCaveRotation.liveRotation([g],now).length||(g.missingSince&&now-Date.parse(g.missingSince)<300000));
  jobs.push(...live.map(g=>refreshGame(g,stats)));
  if(now-lastFinals>=60000){lastFinals=now;jobs.push(...store.games().filter(g=>g.status==='final').map(g=>refreshGame(g)));findFinals().catch(()=>{});}
  await Promise.allSettled(jobs);await tick();
 }finally{polling=false;}
}
window.manCaveDiagnostics={store,scheduler,config:CONFIG,refresh:poll};
(async()=>{await tick();await Promise.all(['CFB','CBB'].map(rankings));lastDiscovery=Date.now();lastStats=Date.now();lastFinals=Date.now();await discover();await tick();findFinals().then(()=>tick()).catch(()=>{});setInterval(()=>poll().catch(()=>{}),10000);setInterval(()=>tick().catch(()=>{}),1000);setInterval(()=>Promise.all(['CFB','CBB'].map(rankings)),3600000);})();
addEventListener('online',()=>{lastDiscovery=0;lastFinals=0;poll().catch(()=>{});});
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
