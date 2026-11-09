/* Game-only player stat extraction. Missing values are never season stats or invented zeros. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ManCaveSpotlight=api;})(globalThis,function(){
'use strict';
const key=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const available=x=>x!==undefined&&x!==null&&x!==''&&x!=='--'&&x!=='—';
const num=x=>available(x)&&Number.isFinite(Number(x))?Number(x):null;
function players(summary,sport,side){
 const team=summary.header?.competitions?.[0]?.competitors?.find(x=>x.homeAway===side)?.team?.id;
 const box=(summary.boxscore?.players||[]).find(x=>String(x.team?.id)===String(team));const found=new Map();
 for(const table of box?.statistics||[]){
  const type=key(table.name||table.type);
  if(sport==='MLB'&&type!=='batting')continue;
  if(sport==='NHL'&&type==='goalies')continue;
  for(const row of table.athletes||[]){const athlete=row.athlete;if(!athlete?.id||row.didNotPlay)continue;
   const id=String(athlete.id),p=found.get(id)||{athlete,values:{},types:new Set()};p.types.add(type);
   const keys=table.keys||table.names||table.labels||[];keys.forEach((name,i)=>{if(available(row.stats?.[i]))p.values[key(name)]=row.stats[i];});
   found.set(id,p);
  }
 }
 const roster=(summary.rosters||[]).find(x=>String(x.team?.id)===String(team));
 for(const p of found.values()){const r=roster?.roster?.find(x=>String(x.athlete?.id||x.id)===String(p.athlete.id));const leader=(summary.leaders||[]).flatMap(g=>g.leaders||[]).flatMap(g=>g.leaders||[]).find(x=>String(x.athlete?.id)===String(p.athlete.id));p.position=String(p.athlete.position?.abbreviation||leader?.athlete?.position?.abbreviation||r?.position?.abbreviation||r?.athlete?.position?.abbreviation||'').toUpperCase();}
 return [...found.values()];
}
function get(p,...names){for(const name of names){const value=p.values[key(name)];if(available(value))return String(value);}return '—';}
function role(p){if(p.position==='QB')return 'QB';if(['RB','HB','FB'].includes(p.position))return 'RB';if(['WR','TE'].includes(p.position))return 'WR';if(p.position)return null;if(p.types.has('passing'))return 'QB';if(p.types.has('rushing'))return 'RB';if(p.types.has('receiving'))return 'WR';return null;}
function plateAppearances(summary,p){
 const explicit=num(get(p,'plateAppearances','PA'));if(explicit!==null)return String(explicit);
 const ab=num(get(p,'atBats')),bb=num(get(p,'walks'));if(ab===null||!summary.atBats||!Array.isArray(summary.plays))return '—';
 let count=0,creditedAB=0,walks=0,hits=0;
 for(const refs of Object.values(summary.atBats)){
  if(!Array.isArray(refs))continue;
  const plays=refs.map(ref=>{const m=String(ref.$ref||'').match(/^#\/plays\/(\d+)$/);return m?summary.plays[Number(m[1])]:null;}).filter(Boolean);
  const result=plays.filter(play=>['N','S'].includes(play.summaryType)&&(play.participants||[]).some(x=>x.type==='batter'&&String(x.athlete?.id)===String(p.athlete.id))&&/\b(struck out|walked|singled|doubled|tripled|homered|grounded|flied|lined|popped|fouled out|reached|hit by pitch|sacrificed|sacrifice|bunted)\b/i.test(play.text||'')).at(-1);
  if(!result)continue;const text=String(result.text||'').toLowerCase();
  count++;if(/\bwalked\b/.test(text))walks++;
  if(/\b(singled|doubled|tripled|homered)\b|reached on (?:an? )?(?:infield )?single/.test(text))hits++;
  if(!/\b(walked|hit by pitch|sacrificed|sacrifice|catcher.?s? interference)\b/.test(text))creditedAB++;
 }
 // Reject incomplete play logs; an at-bat denominator is never used as PA.
 if(!count||creditedAB!==ab||(bb!==null&&walks!==bb)||num(get(p,'hits'))!==hits)return '—';
 return String(count);
}
function stats(summary,sport,p){
 if(['NBA','WNBA','CBB'].includes(sport))return [['PTS',get(p,'points','PTS')],['REB',get(p,'rebounds','totalRebounds','REB')],['AST',get(p,'assists','AST')]];
 if(['NFL','CFB'].includes(sport)){
  const position=role(p);
  if(position==='QB'){let ca=get(p,'completions/passingAttempts','C/ATT');if(ca==='—'){const c=get(p,'completions'),a=get(p,'passingAttempts');if(c!=='—'&&a!=='—')ca=c+'/'+a;}return [['YDS',get(p,'passingYards')],['C/ATT',ca],['TD',get(p,'passingTouchdowns')]];}
  if(position==='RB')return [['ATT',get(p,'rushingAttempts')],['YDS',get(p,'rushingYards')],['TD',get(p,'rushingTouchdowns')]];
  if(position==='WR')return [['REC',get(p,'receptions')],['YDS',get(p,'receivingYards')],['TD',get(p,'receivingTouchdowns')]];
  return [];
 }
 if(sport==='MLB')return [['H/PA',get(p,'hits')+'/'+plateAppearances(summary,p)],['HR',get(p,'homeRuns')],['RBI',get(p,'RBIs')]];
 if(sport==='NHL'){const pm=get(p,'plusMinus','+/-');return [['G',get(p,'goals')],['A',get(p,'assists')],['+/−',num(pm)>0?'+'+String(num(pm)):pm]];}
 return [];
}
function select(summary,sport,side,expectedEventId){
 if(expectedEventId!=null&&String(summary.header?.id)!==String(expectedEventId))return null;
 const pool=players(summary,sport,side).filter(p=>!['NFL','CFB'].includes(sport)||role(p));
 const team=summary.header?.competitions?.[0]?.competitors?.find(x=>x.homeAway===side)?.team?.id;
 const groups=(summary.leaders||[]).find(x=>String(x.team?.id)===String(team));
 let chosen;
 for(const category of groups?.leaders||[]){for(const leader of category.leaders||[]){chosen=pool.find(p=>String(p.athlete.id)===String(leader.athlete?.id));if(chosen)break;}if(chosen)break;}
 if(!chosen){const metrics=sport==='MLB'?['hits','RBIs','homeRuns']:sport==='NHL'?['goals','assists']:['NFL','CFB'].includes(sport)?['passingYards','rushingYards','receivingYards']:['points','rebounds','assists'];chosen=pool.sort((a,b)=>{for(const m of metrics){const d=(num(get(b,m))??-1)-(num(get(a,m))??-1);if(d)return d;}return String(a.athlete.id).localeCompare(String(b.athlete.id));})[0];}
 return chosen?{athlete:chosen.athlete,position:role(chosen)||chosen.position,stats:stats(summary,sport,chosen)}:null;
}
return {players,role,stats,select,plateAppearances};
});
