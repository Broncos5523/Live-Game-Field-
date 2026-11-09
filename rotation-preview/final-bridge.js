'use strict';
// Sport-specific data replaces the original basketball-only comparison definitions.
const sportStats={NFL:[['TOTAL YARDS',['totalYards']],['PASSING YARDS',['netPassingYards']],['RUSHING YARDS',['rushingYards']],['TURNOVERS',['turnovers']]],CFB:[['TOTAL YARDS',['totalYards']],['PASSING YARDS',['netPassingYards']],['RUSHING YARDS',['rushingYards']],['TURNOVERS',['turnovers']]],NHL:[['SHOTS',['shotsTotal','shots','shotsOnGoal']],['HITS',['hits']],['POWER PLAY %',['powerPlayPct']],['FACEOFF %',['faceoffPercent']]],MLB:[['HITS',['hits']],['RUNS',['runs']],['ERRORS',['errors']],['LEFT ON BASE',['runnersLeftOnBase','LOB','leftOnBase']]]};
const oldRenderStats=renderStats;
renderStats=function(a,h){if(!sportStats[sport])return oldRenderStats(a,h);const root=el('stats');root.replaceChildren();for(const [label,keys]of sportStats[sport]){const find=t=>(t?.statistics||[]).flatMap(x=>x.stats||[x]).find(x=>keys.some(k=>k.toLowerCase()===String(x.name).toLowerCase()));const av=find(a),hv=find(h);const row=document.createElement('div');row.className='statrow';const l=document.createElement('strong'),r=document.createElement('strong'),pill=document.createElement('span');l.textContent=av?.displayValue??av?.value??'—';r.textContent=hv?.displayValue??hv?.value??'—';pill.className='stat-pill-label';const an=Number.parseFloat(l.textContent),hn=Number.parseFloat(r.textContent),share=Number.isFinite(an+hn)&&an+hn>0?Math.max(12,Math.min(88,100*an/(an+hn))):50;for(const[side,width]of [['away',share],['home',100-share]]){const half=document.createElement('i');half.className='pill-half pill-'+side;half.style.backgroundColor=el('stage').style.getPropertyValue('--'+side+'-color');half.style.setProperty('width',width+'%','important');pill.append(half)}const text=document.createElement('em');text.className='pill-text';text.textContent=label;pill.append(text);row.append(l,pill,r);root.append(row)}};
showPerformer=function(side,summary){const competitor=summary.header?.competitions?.[0]?.competitors?.find(x=>x.homeAway===side);const groups=(summary.leaders||[]).find(x=>String(x.team?.id)===String(competitor?.team?.id));const leader=groups?.leaders?.flatMap(x=>x.leaders||[])[0];if(leader?.athlete){el(side+'Player').textContent=leader.athlete.displayName;if(['NBA','WNBA','CBB'].includes(sport)){
 const playerId=String(leader.athlete.id);
 const box=(summary.boxscore?.players||[]).find(t=>String(t.team?.id)===String(competitor?.team?.id));
 const values={};
 for(const table of box?.statistics||[]){
  const row=(table.athletes||[]).find(p=>String(p.athlete?.id)===playerId);
  if(!row)continue;
  for(const [index,key]of (table.keys||table.names||table.labels||[]).entries())values[String(key).toLowerCase()]=row.stats?.[index];
 }
 const container=el(side+'PlayerStats');container.replaceChildren();container.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:12px 0;text-align:center';
 for(const [label,keys,category]of [['PTS',['points','pts'],'points'],['REB',['rebounds','totalrebounds','reb'],'rebounds'],['AST',['assists','ast'],'assists']]){
  let value=keys.map(k=>values[k]).find(v=>v!==undefined&&v!==null&&v!=='');
  if(value===undefined){const group=groups?.leaders?.find(g=>g.name===category);const entry=group?.leaders?.find(p=>String(p.athlete?.id)===playerId);value=entry?.displayValue;}
  const stat=document.createElement('span');stat.style.cssText='display:flex;flex-direction:column;gap:4px';
  const number=document.createElement('strong');number.textContent=value??'—';number.style.cssText='font-size:25px;color:#fff;font-weight:900;line-height:1.1';
  const caption=document.createElement('small');caption.textContent=label;caption.style.cssText='font-size:11px;font-weight:800;letter-spacing:1px;color:#cbdceb';
  stat.append(number,caption);container.append(stat);
 }
}else el(side+'PlayerStats').textContent=leader.displayValue||'—';setImg(side+'PlayerImg',leader.athlete.headshot?.href);return;}el(side+'Player').textContent='Verified leader unavailable';el(side+'PlayerStats').textContent='—';setImg(side+'PlayerImg',null)};
window.receiveApproved=async snapshot=>{window.renderApprovedFinal(snapshot);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return true;};
