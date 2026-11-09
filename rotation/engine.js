/* Data ownership and spotlight scheduling. No layout mutations. */
(function(root,factory){const api=factory(typeof module==='object'?require('./approved-policy.js'):root.ManCaveRotation);if(typeof module==='object')module.exports=api;root.ManCaveEngine=api;})(globalThis,function(policy){
'use strict';
const MIN=60000, clone=x=>JSON.parse(JSON.stringify(x));
const candidatesRanks=e=>(e.competitions?.[0]?.competitors||[]).filter(t=>Number(t.curatedRank?.current)>=1&&Number(t.curatedRank?.current)<=25).map(t=>[String(t.team.id),Number(t.curatedRank.current)]);
const sides=e=>e?.competitions?.[0]?.competitors||[];
const score=t=>typeof t?.score==='object'?t.score.value:t?.score;
function valid(e){const c=sides(e);return !!e?.id&&c.length===2&&['home','away'].every(s=>c.some(t=>t.homeAway===s&&t.team?.id&&score(t)!==null&&score(t)!==''&&Number.isFinite(Number(score(t)))));}
function status(e){const s=e.status||e.competitions?.[0]?.status||{},t=s.type||{},text=[t.name,t.description,t.detail].join(' ');if(/suspend|delay/i.test(text))return 'suspended';if(t.completed&&t.state==='post')return 'final';if(/halftime/i.test(text))return 'halftime';if(/intermission|end.*period|end.*quarter/i.test(text)&&t.state==='in')return 'intermission';if(t.state==='in')return Number(s.period)>4&&e.sport==='NFL'?'overtime':'live';return 'scheduled';}
function lastPlay(summary,event){const plays=[...(summary?.plays||[]),...(summary?.drives?.previous||[]).flatMap(x=>x.plays||[]),...(summary?.drives?.current?.plays||[])];return plays.at(-1)||summary?.header?.competitions?.[0]?.situation?.lastPlay||event?.competitions?.[0]?.situation?.lastPlay;}
function signature(e){return JSON.stringify([sides(e).map(t=>score(t)),e.status,e.competitions?.[0]?.situation]);}
class Store{
 constructor(saved={}){this.records=saved;this.corrections={};}
 ingest(sport,event,summary,now,meta={}){
  if(!valid(event))return false;
  const key=sport+':'+event.id,old=this.records[key],incoming=clone(event),state=status(incoming);
  if(meta.fallback&&(!meta.verified||!meta.observedAt||meta.observedAt<=(old?.confirmedAt||0)))return false;
  // Never undo a final or a score without a second matching primary observation.
  const lower=old&&sides(incoming).some(t=>Number(score(t))<Number(score(sides(old.event).find(x=>x.team.id===t.team.id))));
  if(old&&((old.status==='final'&&state!=='final')||lower)){
   const sig=signature(incoming),pending=this.corrections[key];
   if(meta.fallback||!pending||pending.sig!==sig||now-pending.at<9000){this.corrections[key]={sig,at:now};return false;}
  }
  delete this.corrections[key];
  const changed=!old||signature(old.event)!==signature(incoming);
  const currentPlay=lastPlay(summary,incoming),previousPlay=old?.play;
  // Keep confirmed play through incomplete refreshes. A new identified play replaces it.
  const play=currentPlay?currentPlay.id&&String(currentPlay.id)===String(previousPlay?.id)?{...previousPlay,...currentPlay}:currentPlay:previousPlay;
  if(play){incoming.competitions[0].situation={...incoming.competitions[0].situation,lastPlay:play};}
  for(const t of sides(incoming)){const detail=(summary?.boxscore?.teams||[]).find(x=>String(x.team?.id)===String(t.team.id))?.team;const prior=sides(old?.event).find(x=>String(x.team?.id)===String(t.team.id))?.team;t.team={...prior,...detail,...t.team};}
  const c=sides(incoming),home=c.find(x=>x.homeAway==='home'),away=c.find(x=>x.homeAway==='away');
  const active=state!=='scheduled';
  const frozen=old?.frozenRanks||(active?(state==='final'?Object.fromEntries(candidatesRanks(incoming)):meta.ranks):null);
  const supplied=Object.fromEntries(candidatesRanks(incoming));
  const ranks=frozen||((state==='final'&&Object.keys(supplied).length)?supplied:meta.ranks)||{};
  const rank=t=>ranks[String(t.team.id)]??null;
  const confirmedAt=meta.observedAt||now;
  this.records[key]={...old,id:String(event.id),sport,event:incoming,summary:summary||old?.summary||{},status:state,home:{id:String(home.team.id),rank:rank(home)},away:{id:String(away.team.id),rank:rank(away)},homeScore:Number(score(home)),awayScore:Number(score(away)),startedAt:event.date,finishedAt:state==='final'?(old?.finishedAt||(old&&old.status!=='final'?new Date(now).toISOString():event.endDate||event.date)):undefined,arizona:c.some(t=>String(t.team.id)==='12'||t.team.abbreviation==='ARIZ'),division:meta.division||old?.division,frozenRanks:frozen,play,confirmedAt,changedAt:changed?now:old.changedAt,missingSince:null,fallbackVerified:!!meta.fallback,suspendedAt:state==='suspended'?(old?.suspendedAt||new Date(now).toISOString()):null,source:meta.fallback?'verified summary':'ESPN'};
  return true;
 }
 missing(sport,ids,now){for(const g of Object.values(this.records))if(g.sport===sport&&!ids.has(g.id)&&g.status!=='final'&&g.status!=='scheduled'){g.missingSince??=new Date(now).toISOString();g.fallbackVerified=false;}}
 games(){return Object.values(this.records);}
}
class Scheduler{
 constructor(){this.current=null;this.deadline=0;this.visited=new Set();this.mode=null;}
 next(games,now){if(this.current&&now<this.deadline)return null;const selection=policy.select(games,now),pool=selection.games;
 if(!pool.length){this.current=null;this.deadline=now+1000;return {empty:true,mode:selection.mode};}
 if(selection.mode!==this.mode){this.visited.clear();this.mode=selection.mode;}
 // Finish each sport before moving on; newly discovered games join at boundaries.
 const currentSport=this.current?.sport;let candidates=pool.filter(g=>!this.visited.has(g.sport+':'+g.id));
 if(!candidates.length){this.visited.clear();candidates=pool;}
 let chosen=candidates.find(g=>g.sport===currentSport)||candidates[0];
 this.visited.add(chosen.sport+':'+chosen.id);this.current=chosen;this.deadline=now+selection.durationMs;
 return {game:chosen,mode:selection.mode,durationMs:selection.durationMs};
 }
}
return {Store,Scheduler,valid,status,lastPlay,signature,MIN};});
