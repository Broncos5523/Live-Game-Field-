/* Season records: small non-interactive labels anchored to the existing team logos. */
(function(){
'use strict';
function verifiedRecord(competitor){
 const records=competitor?.records||competitor?.record||[];
 const list=Array.isArray(records)?records:[records];
 const r=list.find(x=>/^(overall|total)$/i.test(x?.name||x?.type||''))||list.find(x=>x?.summary&&/^\d+-\d+/.test(x.summary));
 const summary=String(r?.summary||'').trim();
 return /^\d+-\d+(?:-\d+)?$/.test(summary)?summary:'';
}

// Only render verified remaining counts from the active game's scoreboard data.
// MLB intentionally has no timeout indicators. The NHL uses one per team.
function timeoutInfo(snapshot,competitor){
 const sport=String(snapshot?.sport||'').toUpperCase();
 if(sport==='MLB'||snapshot?.event?.status?.type?.completed===true)return null;
 // The maximum is a display capacity, not an inferred remaining count.
 const limits={NFL:3,CFB:3,NBA:7,WNBA:5,CBB:5,NHL:1};
 const max=limits[sport];if(!max||!competitor?.id)return null;
 const summaryCompetitor=snapshot?.summary?.header?.competitions?.[0]?.competitors?.find(x=>String(x.id)===String(competitor.id));
 const numeric=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&/^\d+$/.test(String(v))?Number(v):null;
 const remaining=[summaryCompetitor?.timeoutsRemaining,summaryCompetitor?.timeoutRemaining,summaryCompetitor?.timeouts?.remaining,
  competitor?.timeoutsRemaining,competitor?.timeoutRemaining,competitor?.timeouts?.remaining,
  competitor?.team?.timeoutsRemaining].map(numeric).find(v=>v!==null);
 if(remaining===undefined||remaining<0||remaining>max)return null;
 return {remaining,max};
}
function timeoutDots(snapshot,host,competitor,recordBadge){
 host?.querySelector('.mancave-timeout-dots')?.remove();
 const info=timeoutInfo(snapshot,competitor);
 if(!host||!recordBadge||!info)return;
 const dots=document.createElement('span');
 dots.className='mancave-timeout-dots';
 dots.setAttribute('aria-label',info.remaining+' team timeouts remaining');
 dots.style.cssText='position:absolute;z-index:3;pointer-events:none;display:flex;justify-content:center;gap:4px;white-space:nowrap';
 for(let i=0;i<info.max;i++){
  const dot=document.createElement('i');
  dot.style.cssText='display:block;width:7px;height:7px;border-radius:50%;background:'+(i<info.remaining?'#facc15':'#d1d5db');
  dots.append(dot);
 }
 host.append(dots);
 const h=host.getBoundingClientRect(),b=recordBadge.getBoundingClientRect();
 dots.style.left=(b.left-h.left+b.width/2)+'px';
 dots.style.top=(b.bottom-h.top+3)+'px';
 dots.style.transform='translateX(-50%)';
}

// Bonus belongs to the team awarded free throws, not the team committing fouls.
// Only consume explicit, team-specific feed flags; never infer from generic foul totals.
function bonusLevel(snapshot,competitor){
 const sport=String(snapshot?.sport||'').toUpperCase();
 if(!['NBA','WNBA','CBB'].includes(sport)||snapshot?.event?.status?.type?.completed===true)return '';
 const entries=[snapshot?.summary?.header?.competitions?.[0]?.competitors?.find(x=>String(x.id)===String(competitor?.id)),competitor];
 for(const item of entries){
  if(!item)continue;
  const raw=item.bonus??item.bonusStatus??item.team?.bonus??item.team?.bonusStatus;
  if(typeof raw==='string'){
   const v=raw.trim().toLowerCase();
   if(sport==='CBB'&&/^(double.?bonus|bonus\\+|double)$/.test(v))return 'BONUS+';
   if(/^(bonus|in bonus|single.?bonus)$/.test(v))return 'BONUS';
   if(/^(none|no bonus|false)$/.test(v))return '';
  }
  if(sport==='CBB'&&(item.doubleBonus===true||item.inDoubleBonus===true))return 'BONUS+';
  if(item.inBonus===true||item.isInBonus===true||raw===true)return 'BONUS';
 }
 return '';
}
function bonusBadge(snapshot,host,competitor){
 host?.querySelector('.mancave-bonus-indicator')?.remove();
 if(!host)return;
 const label=bonusLevel(snapshot,competitor);
 if(!label)return;
 const score=host.querySelector('strong');
 if(!score)return;
 const badge=document.createElement('span');
 badge.className='mancave-bonus-indicator';
 badge.textContent=label;
 badge.setAttribute('aria-label',label==='BONUS+'?'Double bonus':'Bonus');
 badge.style.cssText='position:absolute;z-index:4;pointer-events:none;white-space:nowrap;font:800 11px Arial,sans-serif;letter-spacing:.08em;color:#facc15;text-shadow:0 1px 4px #000,0 2px 7px #000;line-height:14px';
 host.append(badge);
 const h=host.getBoundingClientRect(),s=score.getBoundingClientRect();
 badge.style.left=(s.left-h.left+s.width/2)+'px';
 badge.style.top=(s.bottom-h.top+2)+'px';
 badge.style.transform='translateX(-50%)';
}
function add(snapshot,selector,side){
 const host=document.querySelector(selector);
 const img=host?.querySelector('img');
 const competitor=snapshot?.event?.competitions?.[0]?.competitors?.find(x=>x.homeAway===side);
 const record=verifiedRecord(competitor);
 host?.querySelector('.mancave-season-record')?.remove();
 if(!host||!img)return;
 if(selector.startsWith('.hero'))host.querySelector('.mancave-bonus-indicator')?.remove();
 if(!record){host.querySelector('.mancave-timeout-dots')?.remove();return;}
 const badge=document.createElement('span');
 badge.className='mancave-season-record';
 badge.textContent=record;
 badge.setAttribute('aria-label','Season record '+record);
 host.style.position='relative';
 badge.style.cssText='position:absolute;z-index:3;pointer-events:none;white-space:nowrap;font:700 13px Arial,sans-serif;color:#fff;text-shadow:0 1px 4px #000,0 2px 7px #000;text-align:center;line-height:16px';
 host.append(badge);
 // Anchor to the actual logo, regardless of away/home ordering.
 const h=host.getBoundingClientRect(),r=img.getBoundingClientRect();
 badge.style.left=(r.left-h.left+r.width/2)+'px';
 badge.style.top=(r.bottom-h.top+1)+'px';
 badge.style.transform='translateX(-50%)';
 if(selector.startsWith('.hero')){timeoutDots(snapshot,host,competitor,badge);bonusBadge(snapshot,host,competitor);}
}
window.ManCaveTeamRecords={
 live:s=>{requestAnimationFrame(()=>{add(s,'.hero .team-away','away');add(s,'.hero .team-home','home');});},
 final:s=>{requestAnimationFrame(()=>{add(s,'#score .team.away','away');add(s,'#score .team.home','home');});}
};
})();