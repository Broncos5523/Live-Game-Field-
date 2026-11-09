/* Man Cave Sports Book — approved rotation policy, 2026-11-09.
   Pure selection logic; does not modify approved layouts or artwork.
   Consumers supply normalized games and frozen NCAA ranks.
   Game: {id,sport,status,home:{id,rank},away:{id,rank},
          homeScore,awayScore,startedAt,finishedAt,arizona}
   status: live | halftime | intermission | overtime | suspended | final
*/
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.ManCaveRotation=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SPORTS=['NFL','NBA','NHL','MLB','WNBA','CFB','CBB'];
  const COLLEGE=new Set(['CFB','CBB']);
  const LIVE=new Set(['live','halftime','intermission','overtime','suspended']);
  const MIN=60000, HOUR=60*MIN;
  const number=x=>x!==null&&x!==''&&x!==undefined&&Number.isFinite(Number(x))?Number(x):null;
  const rank=x=>{const n=number(x);return n!==null&&n>=1&&n<=25?n:Infinity;};
  const margin=g=>{const a=number(g.homeScore),b=number(g.awayScore);return a===null||b===null?Infinity:Math.abs(a-b);};
  const started=g=>Number(new Date(g.startedAt||0))||0;
  const finished=g=>Number(new Date(g.finishedAt||0))||0;
  const collegeRank=g=>Math.min(rank(g.home&&g.home.rank),rank(g.away&&g.away.rank));
  const opponentRank=g=>Math.max(rank(g.home&&g.home.rank),rank(g.away&&g.away.rank));
  const arizona=g=>Boolean(g.arizona)||[g.home,g.away].some(t=>t&&(/^(ARIZ|ARIZONA)$/i.test(String(t.id||''))));
  const byMargin=(a,b)=>margin(a)-margin(b)||started(a)-started(b)||String(a.id).localeCompare(String(b.id));
  const byRank=(a,b)=>collegeRank(a)-collegeRank(b)||opponentRank(a)-opponentRank(b)||byMargin(a,b);
  const unique=games=>Array.from(new Map(games.filter(g=>g&&g.id).map(g=>[String(g.sport)+':'+String(g.id),g])).values());
  function collegeSelect(games){
    const ranked=games.filter(g=>collegeRank(g)!==Infinity).sort(byRank);
    const cats=games.filter(g=>collegeRank(g)===Infinity&&arizona(g)).sort(byMargin);
    // Unranked non-Arizona games enter only when neither ranked nor Arizona is live.
    return ranked.length||cats.length?ranked.concat(cats):games.filter(g=>collegeRank(g)===Infinity&&!arizona(g)).sort(byMargin).slice(0,10);
  }
  function divisionEligible(g){return g.sport==='CFB'?g.division==='FBS':g.sport==='CBB'?g.division==='D1':true;}
  function liveEligible(g,now){
    if(!LIVE.has(g.status)||g.actualPlayConfirmed===false)return false;
    if(g.status==='suspended'&&g.suspendedAt&&now-new Date(g.suspendedAt).getTime()>=15*MIN)return false;
    if(g.missingSince&&now-new Date(g.missingSince).getTime()>=5*MIN&&!g.fallbackVerified)return false;
    return true;
  }
  function liveRotation(games,now=Date.now()){
    const pool=unique(games).filter(g=>divisionEligible(g)&&liveEligible(g,now));
    return SPORTS.flatMap(s=>{const subset=pool.filter(g=>g.sport===s);return COLLEGE.has(s)?collegeSelect(subset):subset.sort((a,b)=>started(a)-started(b)||String(a.id).localeCompare(String(b.id)));});
  }
  function finalRotation(games,now=Date.now()){
    const all=unique(games).filter(g=>divisionEligible(g)&&g.status==='final');
    const recent=all.filter(g=>finished(g)&&now-finished(g)<=24*HOUR&&now>=finished(g));
    const pool=recent.length?recent:all;
    const sports=SPORTS.filter(s=>pool.some(g=>g.sport===s)).sort((a,b)=>Math.max(...pool.filter(g=>g.sport===b).map(finished))-Math.max(...pool.filter(g=>g.sport===a).map(finished)));
    return sports.flatMap(s=>{const subset=pool.filter(g=>g.sport===s);return COLLEGE.has(s)?collegeSelect(subset):subset.sort((a,b)=>finished(b)-finished(a));});
  }
  function select(games,now=Date.now()){
    const live=liveRotation(games,now);
    return live.length?{mode:'live',durationMs:60000,games:live}:{mode:'final',durationMs:30000,games:finalRotation(games,now)};
  }
  return Object.freeze({SPORTS,divisionEligible,liveRotation,finalRotation,select,margin,collegeRank});
});
