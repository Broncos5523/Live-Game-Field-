/* Read-only model for the six central graphics. No network, timers, or leader changes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ManCaveCentralData=api;})(globalThis,function(){
'use strict';
const SPORTS=new Set(['NFL','CFB','NBA','CBB','WNBA','NHL']);
const retained=new Map();
// League brand pairs; team events continue to use their own supplied colors.
const LEAGUE_COLORS={NFL:['#013369','#d50a0a'],CFB:['#005eb8','#ffffff'],NBA:['#17408b','#c9082a'],CBB:['#005eb8','#ffffff'],WNBA:['#ff4713','#000000'],NHL:['#a2aaad','#000000']};
const basketball=s=>['NBA','CBB','WNBA'].includes(s);
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const numeric=v=>v!==null&&v!==undefined&&clean(v)!==''&&/^[-+]?\d+(?:\.\d+)?$/.test(clean(v))?Number(v):null;
const hex=v=>/^#[a-f0-9]{6}$/i.test(v||'')?v:null;
function playerRows(summary){
 const pool=new Map();
 for(const group of summary.boxscore?.players||[])for(const table of group.statistics||[]){
  // Only the selected game's player tables. Never season/leader/participant totals.
  if(/season|average|career/i.test(table.name||''))continue;
  const columns=table.keys||table.names||table.labels||[];
  for(const row of table.athletes||[]){
   if(!row.athlete?.id||row.didNotPlay)continue;
   const id=String(row.athlete.id),teamId=String(group.team?.id||''),key=teamId+':'+id;
   const player=pool.get(key)||{id,teamId,athlete:row.athlete,values:{},goalie:false};
   player.goalie=player.goalie||/goalies/i.test(table.name||'');
   columns.forEach((column,i)=>{if(row.stats?.[i]!==undefined)player.values[norm(column)]=row.stats[i];});
   pool.set(key,player);
  }
 }
 return [...pool.values()];
}
function stat(player,...keys){for(const key of keys){const v=numeric(player.values[norm(key)]);if(v!==null)return String(v);}return null;}
function statistics(sport,player){
 if(!player)return [];
 if(basketball(sport))return [['PTS',stat(player,'points','PTS')],['REB',stat(player,'rebounds','totalRebounds','REB')],['AST',stat(player,'assists','AST')]];
 if(sport==='NHL'&&!player.goalie){
  const goals=stat(player,'goals','G'),assists=stat(player,'assists','A');
  return [['G',goals],['A',assists],['PTS',goals!==null&&assists!==null?String(Number(goals)+Number(assists)):null]];
 }
 return [];
}
function description(sport,play,fallback){
 let text=clean(play?.text||fallback);
 if(sport==='NHL'){
  // ESPN's goal narrative can include season totals. Remove only annotations
  // explicitly identified as YTD by that event's participant fields.
  for(const ref of play?.participants||[]){
   if(ref.type==='scorer'&&numeric(ref.ytdGoals)!==null)text=text.replace(new RegExp('\\bGoal\\s+\\('+Number(ref.ytdGoals)+'\\)','i'),'Goal');
   const name=ref.athlete?.displayName;
   if(name&&numeric(ref.ytdAssists)!==null){const needle=name+' ('+Number(ref.ytdAssists)+')';text=text.replace(needle,name);}
  }
 }
 return text;
}
function result(sport,play){
 const text=clean(play?.text),type=clean(play?.type?.text),all=type+' '+text,k=norm(type);
 if(/endgame|endofgame|gameend/.test(k)||/^(?:end of game|game end(?:ed)?)$/i.test(text))return 'FINAL';
 if(/halftime|endhalf/.test(k)||/halftime|end of (?:the )?(?:1st|first) half/i.test(text))return 'HALFTIME';
 if(/endperiod|periodend/.test(k)||/^end of .*?(?:quarter|period|half)/i.test(text)){
  if(sport==='NHL')return 'END OF PERIOD';
  if(basketball(sport)&&(/half/i.test(text)))return /(?:1st|first)/i.test(text)?'HALFTIME':'END OF HALF';
  return 'END OF QUARTER';
 }
 if(/intermission/i.test(all))return 'INTERMISSION';
 if(/challenge|replay review|official review|under review/i.test(all))return 'CHALLENGE';
 if(/timeout/.test(norm(type))||/time[- ]?out/i.test(text))return 'TIMEOUT';
 if(['NFL','CFB'].includes(sport)){
  if(/intercept/i.test(all))return 'INTERCEPTION';
  if(/fumble/i.test(all))return 'FUMBLE';
  if(/touchdown/i.test(all))return 'TOUCHDOWN';
  if(/sack/i.test(all))return 'SACK';
  if(/incomplete/i.test(all))return 'INCOMPLETE';
  if(/field goal/i.test(all))return /no good|miss|blocked/i.test(all)?'MISSED FIELD GOAL':'FIELD GOAL';
  if(/penalty/i.test(all))return 'PENALTY';
  const gain=text.match(/for\s+(-?\d+)\s+yards?\b/i);
  if(/pass/i.test(all)&&gain)return gain[1]+'-YARD COMPLETION';
  if(/pass.*complete/i.test(all))return 'COMPLETION';
  if(gain)return Number(gain[1])<0?Math.abs(Number(gain[1]))+'-YARD LOSS':gain[1]+'-YARD GAIN';
 }
 if(basketball(sport)){
  if(/steal/i.test(type))return 'STEAL';
  if(/block/i.test(all))return 'BLOCKED SHOT';
  if(/turnover|traveling|travelling/i.test(all))return 'TURNOVER';
  if(/free ?throw/.test(norm(all)))return /miss/i.test(text)?'MISSED FREE THROW':'FREE THROW';
  const attempt=numeric(play?.pointsAttempted),value=numeric(play?.scoreValue);
  if(play?.shootingPlay===true||/shot|jumper|layup|dunk/i.test(all)){
   const three=attempt===3||/three[- ]?point|3[- ]?point/i.test(all);
   if(/miss/i.test(text)||play?.scoringPlay===false)return 'MISSED '+(three?'3':'2')+'-POINTER';
   if(play?.scoringPlay===true&&[2,3].includes(value))return value+' POINTS';
   if(/makes|made/i.test(text)&&[2,3].includes(attempt))return attempt+' POINTS';
  }
 }
 if(sport==='NHL'){
  if(/no goal|disallowed/i.test(all))return 'NO GOAL';
  if(play?.scoringPlay===true||/^goal$/i.test(type))return 'GOAL';
  if(/goalie\s+stopped|goaltender\s+stopped|goalie\s+stoppage|goalie\s+stops\s+play/i.test(all))return 'PUCK FROZEN';
  if(/puck.{0,24}(?:froz|freez|frozen|cover|smother)|(?:froz|freez|frozen|cover|smother).{0,24}puck|(?:goalie|goaltender).{0,35}(?:froz|freez|cover|smother)|(?:froz|freez|cover|smother).{0,35}(?:goalie|goaltender)/i.test(all))return 'PUCK FROZEN';
  if(/off[ -]?side|offsides|offside/i.test(all))return 'OFFSIDE';
  if(/icing/i.test(all))return 'ICING';
  if(/saved by|save\\b/i.test(all))return 'SAVE';
  if(/penalty|hooking|slashing|tripping|holding|high sticking|interference|roughing|cross.?checking/i.test(type)||/penalty|\b\d+ min/i.test(text))return 'PENALTY';
  if(/^power play$/i.test(type))return 'POWER PLAY';
  if(/^blocked$/i.test(type))return 'BLOCKED SHOT';
 }
 return type?type.replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase():'LAST PLAY';
}
function actorFor(sport,play,summary,game){
 const label=result(sport,play),text=clean(play?.text);
 if(['CHALLENGE','FINAL','TIMEOUT','HALFTIME','END OF QUARTER','END OF HALF','END OF PERIOD','INTERMISSION','POWER PLAY'].includes(label))return null;
 const pool=playerRows(summary),refs=(play?.participants||[]).filter(x=>x.athlete?.id);
 const byId=id=>{const matches=pool.filter(p=>p.id===String(id));return matches.length===1?matches[0]:null;};
 const role=sport==='NHL'?(label==='GOAL'?'scorer':['SAVE','PUCK FROZEN'].includes(label)?'goalie':label==='PENALTY'?'penalty':null):null;
 const roleRef=role?refs.find(p=>new RegExp(role,'i').test(p.type||'')):null;
 if(roleRef&&byId(roleRef.athlete.id))return byId(roleRef.athlete.id);
 // A goalie stoppage must never borrow a skater portrait from generic participants.
 if(sport==='NHL'&&label==='PUCK FROZEN'){
  const goalieRefs=refs.map(p=>byId(p.athlete.id)).filter(p=>p?.goalie);
  if(goalieRefs.length===1)return goalieRefs[0];
 }
 let phrase=text;
 if(sport==='NHL'&&['SAVE','PUCK FROZEN'].includes(label))phrase=text.split(/saved by|frozen by|covered by|smothered by/i)[1]||text;
 else if(/intercepted by/i.test(text))phrase=text.split(/intercepted by/i)[1]||'';
 else if(sport==='NHL'&&/blocked by/i.test(text))phrase=text.split(/blocked by/i)[1]||'';
 const normalized=norm(phrase),matches=[];
 for(const player of pool){
  const a=player.athlete,full=a.displayName||a.fullName||'',first=a.firstName||full.split(' ')[0],last=a.lastName||full.split(' ').slice(1).join(' ');
  const aliases=[full,a.fullName,a.shortName,first&&last?first[0]+'.'+last:null].filter(Boolean);
  const indices=aliases.map(norm).filter(n=>n.length>3).map(n=>normalized.indexOf(n)).filter(i=>i>=0);
  if(indices.length)matches.push({player,index:Math.min(...indices)});
 }
 matches.sort((a,b)=>a.index-b.index);
 if(matches.length&&(!matches[1]||matches[0].index<matches[1].index))return matches[0].player;
 if(refs.length===1){const candidate=byId(refs[0].athlete.id);if(!(sport==='NHL'&&label==='PUCK FROZEN')||candidate?.goalie)return candidate;}
 return null;
}
function fromGame(game,summary,options={}){
 if(!SPORTS.has(game?.sport)||String(summary?.header?.id)!==String(game.id))return null;
 const comp=summary.header.competitions?.[0];
 if(!comp)return null;
 // Reject a summary with another matchup, even if the event identifier matches.
 const teamIds=(comp.competitors||[]).map(x=>String(x.team?.id));
 if(![game.away?.id,game.home?.id].every(id=>id!=null&&teamIds.includes(String(id))))return null;
 const key=game.sport+':'+game.id;
 let play=options.recordedPlay||game.staticState?.play||null;
 if(!options.recordedPlay&&game.state!=='post'){
  if(!play)play=retained.get(key)||null;
  if(play){retained.delete(key);retained.set(key,play);if(retained.size>8)retained.delete(retained.keys().next().value);}
 }
 const text=description(game.sport,play,game.lastPlay);
 const label=result(game.sport,play),actor=actorFor(game.sport,play,summary,game);
 const sides=[game.away,game.home],situation=comp.situation||{};
 const football=['NFL','CFB'].includes(game.sport);
 const possession=football?(situation.possession||(!options.recordedPlay&&game.footballField?.possession?game[game.footballField.possession]?.id:null)):null;
 const eventTeamId=actor?.teamId||play?.team?.id||play?.start?.team?.id;
 // For offsides/icing ESPN's event team is the offending team; never infer
 // from possession or assign the opposite team if the event team is missing.
 const nhlTeamEvent=game.sport==='NHL'&&['OFFSIDE','ICING','PUCK FROZEN'].includes(label);
 const infraction=game.sport==='NHL'&&['OFFSIDE','ICING'].includes(label);
 const participantTeamId=(play?.participants||[]).map(p=>p?.team?.id||p?.athlete?.team?.id).find(Boolean);
 const specificTeamId=nhlTeamEvent?(play?.team?.id||play?.start?.team?.id||actor?.teamId||participantTeamId):eventTeamId;
 const neutral=['HALFTIME','FINAL','INTERMISSION','END OF QUARTER','END OF PERIOD','END OF HALF'].includes(label)||(!nhlTeamEvent&&/official|referee|\btv timeout\b|\bmedia timeout\b/i.test((play?.type?.text||'')+' '+(play?.text||'')));
 const team=neutral?null:sides.find(t=>String(t.id)===String(specificTeamId||(nhlTeamEvent?null:possession)));
 // Goalie events must not borrow an unrelated player headshot.
 const verifiedActor=game.sport==='NHL'&&label==='PUCK FROZEN'&&actor&&!actor.goalie?null:actor;
 const values=statistics(game.sport,verifiedActor);
 const portrait=verifiedActor?(typeof verifiedActor.athlete.headshot==='string'?verifiedActor.athlete.headshot:verifiedActor.athlete.headshot?.href)||'':team?.logo||'./assets/league-logos/'+game.sport+'.png';
 let top=label,topLabel='EVENT RESULT',footer=verifiedActor?clean(verifiedActor.athlete.displayName||verifiedActor.athlete.fullName):team?.name||game.sport;
 let situationItems=[];
 if(football){
  const current=game.state!=='post'?summary.drives?.current:null;
  const recorded=options.recordedPlay?(summary.drives?.previous||[]).find(d=>(d.plays||[]).some(p=>String(p.id)===String(play?.id))):null;
  topLabel=recorded?'RECORDED DRIVE':'CURRENT DRIVE';
  top=clean((recorded||current)?.description)||[current?.offensivePlays!=null?current.offensivePlays+' PLAYS':'',current?.yards!=null?current.yards+' YARDS':'',current?.timeElapsed?.displayValue].filter(Boolean).join(' · ')||(game.state==='post'?'GAME COMPLETE':'DRIVE INFORMATION UNAVAILABLE');
  const state=options.recordedPlay?play?.end:game.state==='post'?{}:{...play?.end,...situation};
  const down=numeric(state?.down),distance=numeric(state?.distance),field=clean(state?.possessionText);
  const ordinal=n=>({1:'1ST',2:'2ND',3:'3RD',4:'4TH'}[n]||'—');
  const goal=/goal/i.test(state?.shortDownDistanceText||state?.downDistanceText||'');
  situationItems=[['DOWN',ordinal(down)],['DISTANCE',goal?'GOAL':distance!==null&&distance>=0?distance+' YDS':'—'],['FIELD POSITION',field||'—']];
  footer=options.recordedPlay?'RECORDED PLAY-END SITUATION':game.state==='post'?'GAME COMPLETE':'GAME SITUATION';
 }
 return {headline:label,tone:outcome(game.sport,label,play),sport:game.sport,playId:String(play?.id||text),top,topLabel,text:text||'WAITING FOR THE NEXT VERIFIED PLAY',name:verifiedActor?clean(verifiedActor.athlete.displayName||verifiedActor.athlete.fullName):team?.name||'',athleteId:verifiedActor?.id||null,teamId:team?.id||null,portrait,fallback:team?.logo||'./assets/league-logos/'+game.sport+'.png',isPlayer:!!verifiedActor,stats:values,footer,situation:situationItems,primary:hex(team?.color)||LEAGUE_COLORS[game.sport][0],secondary:hex(team?.secondary)||LEAGUE_COLORS[game.sport][1]};
}
function outcome(sport,label,play){
 if(label==='FINAL')return 'neutral';
 if(label==='CHALLENGE')return ['NFL','CFB'].includes(sport)?'negative':basketball(sport)?'positive':'neutral';
 if(/TIMEOUT|HALFTIME|END OF|INTERMISSION|DELAY|CLOCK|WARNING/.test(label))return 'timing';
 if(/MISSED|INCOMPLETE|INTERCEPTION|FUMBLE|SACK|LOSS|PENALTY|TURNOVER|NO GOAL/.test(label)||/^-\d+-YARD/.test(label))return 'negative';
 if(/POINTS|FREE THROW|COMPLETION|GAIN|TOUCHDOWN|FIELD GOAL|GOAL|SAVE|BLOCKED SHOT|STEAL|POWER PLAY/.test(label))return 'positive';
 return 'neutral';
}
return {outcome,SPORTS,fromGame,playerRows,statistics,result,actorFor,description};
});
