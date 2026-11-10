/* Live broadcaster compatibility. No polling or final-board changes. */
(function(root){'use strict';
 const known=new Map();
 const text=x=>typeof x==='string'?x.trim():'';
 function channel(group){
  if(!group)return '';
  if(typeof group==='string')return text(group);
  const rows=Array.isArray(group)?group:[group];
  const ordered=[...rows].sort((a,b)=>Number(!!(b?.isNational||/national/i.test(text(b?.market)||text(b?.market?.type))))-Number(!!(a?.isNational||/national/i.test(text(a?.market)||text(a?.market?.type)))));
  for(const row of ordered){const name=text(row?.names?.[0])||text(row?.media?.shortName)||text(row?.media?.name)||text(row?.shortName)||text(row?.name)||text(row);if(name)return name;}
  return '';
 }
 function prepare(snapshot){
  const event=snapshot?.event,comp=event?.competitions?.[0];if(!event?.id||!comp)return snapshot;
  const summary=String(snapshot.summary?.header?.id)===String(event.id)?snapshot.summary:null;
  const sc=summary?.header?.competitions?.[0];
  const key=snapshot.sport+':'+event.id;
  const name=[comp.broadcasts,comp.geoBroadcasts,comp.broadcast,sc?.broadcasts,sc?.geoBroadcasts,summary?.broadcasts,event.broadcast].map(channel).find(Boolean)||known.get(key)||'';
  if(!name)return snapshot;
  known.delete(key);known.set(key,name);if(known.size>16)known.delete(known.keys().next().value);
  return {...snapshot,event:{...event,competitions:[{...comp,broadcasts:[{market:'national',names:[name]}],broadcast:name},...event.competitions.slice(1)]}};
 }
 const api={channel,prepare};root.ManCaveLiveNetwork=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
 const receive=root.receiveApproved;
 if(typeof receive==='function')root.receiveApproved=snapshot=>receive(prepare(snapshot));
})(globalThis);
