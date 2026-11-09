'use strict';
// Sport-specific data replaces the original basketball-only comparison definitions.
const sportStats={
 NFL:[['TOTAL YARDS',['totalYards']],['FIRST DOWNS',['firstDowns','firstDownsTotal']],['SACKS',['sacks','defensiveSacks','totalSacks']],['TURNOVERS',['turnovers','totalTurnovers']]],
 CFB:[['TOTAL YARDS',['totalYards']],['FIRST DOWNS',['firstDowns','firstDownsTotal']],['SACKS',['sacks','defensiveSacks','totalSacks']],['TURNOVERS',['turnovers','totalTurnovers']]],
 NHL:[['SHOTS ON GOAL',['shotsTotal','shotsOnGoal','shots']],['FACEOFF %',['faceoffPercent','faceoffPct','faceoffsWonPct']],['POWER PLAY',['powerPlayGoals','powerPlay','powerPlayPct','powerPlayPercentage']],['HITS',['hits']]],
 MLB:[['HITS',['hits']],['HOME RUNS',['homeRuns','homeruns']],['PITCHING STRIKEOUTS',['strikeouts','pitchingStrikeouts','strikeoutsPitching']],['RUNNERS LEFT ON BASE',['runnersLeftOnBase','leftOnBase','LOB']]]
};
const oldRenderStats=renderStats;
renderStats=function(a,h){
 if(!sportStats[sport])return oldRenderStats(a,h);
 const root=el('stats');root.replaceChildren();
 const normalize=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const find=(team,keys)=>{
  const stats=(team?.statistics||[]).flatMap(x=>x.stats||[x]);
  return stats.find(x=>keys.some(k=>normalize(k)===normalize(x.name)||normalize(k)===normalize(x.label)||normalize(k)===normalize(x.abbreviation)));
 };
 for(const [label,keys] of sportStats[sport]){
  const av=find(a,keys),hv=find(h,keys);
  const row=document.createElement('div');row.className='statrow';
  const l=document.createElement('strong'),r=document.createElement('strong'),pill=document.createElement('span');
  l.textContent=av?.displayValue??av?.value??'—';r.textContent=hv?.displayValue??hv?.value??'—';
  pill.className='stat-pill-label';
  const an=Number.parseFloat(l.textContent),hn=Number.parseFloat(r.textContent);
  const lowerBetter=label==='TURNOVERS'||label==='RUNNERS LEFT ON BASE';
  const valid=Number.isFinite(an)&&Number.isFinite(hn);
  const share=valid&&an+hn>0?Math.max(12,Math.min(88,100*(lowerBetter?hn:an)/(an+hn))):50;
  for(const[side,width]of[['away',share],['home',100-share]]){
   const half=document.createElement('i');half.className='pill-half pill-'+side;
   half.style.backgroundColor=el('stage').style.getPropertyValue('--'+side+'-color');
   half.style.setProperty('width',width+'%','important');pill.append(half);
  }
  const text=document.createElement('em');text.className='pill-text';text.textContent=label;pill.append(text);
  row.append(l,pill,r);root.append(row);
 }
};
showPerformer=function(side,summary){
 const player=window.ManCaveSpotlight.select(summary,sport,side,window.manCaveRankSnapshot?.event?.id),container=el(side+'PlayerStats');
 el(side+'Player').textContent=player?.athlete?.displayName||'Verified player unavailable';
 setImg(side+'PlayerImg',player?.athlete?.headshot?.href);
 container.replaceChildren();container.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:12px 0;text-align:center';
 if(!player){container.textContent='—';return;}
 for(const [label,value]of player.stats){const stat=document.createElement('span');stat.style.cssText='display:flex;flex-direction:column;gap:4px';
 const number=document.createElement('strong');number.textContent=value;number.style.cssText='font-size:25px;color:#fff;font-weight:900;line-height:1.1';
 if(String(value).length>5)number.style.fontSize='19px';else if(String(value).length>3)number.style.fontSize='22px';
 const caption=document.createElement('small');caption.textContent=label;caption.style.cssText='font-size:11px;font-weight:800;letter-spacing:1px;color:#cbdceb';
 stat.append(number,caption);container.append(stat);}
};
// Use the verified event snapshot supplied by the rotation runtime, not a second
// independent summary fetch that may race with the next spotlight.
loadSummary=async function(id){
 const snapshot=window.manCaveRankSnapshot;
 const summary=snapshot?.summary;
 if(String(snapshot?.event?.id)!==String(id)||String(summary?.header?.id)!==String(id)){
  el('stats').textContent='Verified statistics unavailable';
  for(const side of ['away','home']){el(side+'Player').textContent='Player data unavailable';el(side+'PlayerStats').textContent='—';setImg(side+'PlayerImg',null);}
  return;
 }
 const competitors=summary.header?.competitions?.[0]?.competitors||[];
 const teams=summary.boxscore?.teams||[];
 const bySide=side=>teams.find(x=>String(x.team?.id)===String(competitors.find(c=>c.homeAway===side)?.team?.id));
 renderStats(bySide('away'),bySide('home'));
 showPerformer('away',summary);
 showPerformer('home',summary);
};
const originalShowGame=showGame;
showGame=function(event){
 const copy={...event,competitions:(event.competitions||[]).map(c=>({...c,competitors:(c.competitors||[]).map(t=>{
  const detail=(window.manCaveSummary?.boxscore?.teams||[]).find(x=>String(x.team?.id)===String(t.team?.id))?.team;
  return {...t,team:{...t.team,...detail}};
 })}))};
 const result=originalShowGame(copy);
 const ranks=window.ManCaveRanks.forSnapshot(window.manCaveRankSnapshot||{sport,event:copy});
 for(const side of ['home','away'])if(ranks[side]){const badge=document.createElement('span');badge.className='mancave-rank';badge.textContent='#'+ranks[side];badge.setAttribute('aria-label','Rank '+ranks[side]);el(side+'Name').prepend(badge);}
 return result;
};
window.receiveApproved=async snapshot=>{window.manCaveRankSnapshot=snapshot;window.renderApprovedFinal(snapshot);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return true;};
