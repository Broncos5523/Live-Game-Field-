/* Display-only ranks: prefer the rotation engine's frozen game ranks. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ManCaveRanks=api;})(globalThis,function(){
 const valid=value=>{const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=25?n:null;};
 function forSnapshot(snapshot){
  if(!['CFB','CBB'].includes(snapshot.sport))return {home:null,away:null};
  const competitors=snapshot.event?.competitions?.[0]?.competitors||[];
  return Object.fromEntries(['home','away'].map(side=>{const team=competitors.find(t=>t.homeAway===side);return [side,valid(snapshot.ranks&&Object.prototype.hasOwnProperty.call(snapshot.ranks,side)?snapshot.ranks[side]:team?.curatedRank?.current??team?.rank)];}));
 }
 return {valid,forSnapshot};
});
