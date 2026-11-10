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
function add(snapshot,selector,side){
 const host=document.querySelector(selector);
 const img=host?.querySelector('img');
 const competitor=snapshot?.event?.competitions?.[0]?.competitors?.find(x=>x.homeAway===side);
 const record=verifiedRecord(competitor);
 host?.querySelector('.mancave-season-record')?.remove();
 if(!host||!img||!record)return;
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
}
window.ManCaveTeamRecords={
 live:s=>{requestAnimationFrame(()=>{add(s,'.hero .team-away','away');add(s,'.hero .team-home','home');});},
 final:s=>{requestAnimationFrame(()=>{add(s,'#score .team.away','away');add(s,'#score .team.home','home');});}
};
})();