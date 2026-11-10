'use strict';
// Read-only, opt-in feed diagnostics. Enable with ?feedDebug=1 on the live iframe.
// Never log entire player/game payloads or interfere with display updates.
window.ManCaveFeedDiagnostics={
 inspect(snapshot){
  const sport=String(snapshot?.sport||'');
  const gameId=String(snapshot?.event?.id||'');
  const sources={scoreboard:snapshot?.event?.competitions?.[0]?.competitors||[],summary:snapshot?.summary?.header?.competitions?.[0]?.competitors||[]};
  const wanted=/timeout|bonus|foul|possession|lastplay|playid/i;
  const fields=object=>Object.fromEntries(Object.entries(object||{}).filter(([k,v])=>wanted.test(k)&&['string','number','boolean'].includes(typeof v)));
  const result={sport,gameId,checkedAt:new Date().toISOString(),teams:{}};
  for(const [source,competitors] of Object.entries(sources)){
   result.teams[source]=competitors.map(team=>({id:String(team?.id||team?.team?.id||''),homeAway:team?.homeAway,fields:fields(team),teamFields:fields(team?.team),timeoutFields:fields(team?.timeouts)}));
  }
  return result;
 }
};
window.receiveApproved=async snapshot=>{
 await window.renderApprovedLive(snapshot);
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 window.ManCaveTeamRecords?.live?.(snapshot);
 if(new URLSearchParams(location.search).get('feedDebug')==='1'){
  const diagnostic=window.ManCaveFeedDiagnostics.inspect(snapshot);
  window.ManCaveLastFeedDiagnostic=diagnostic;
  console.info('[ManCave feed diagnostics]',diagnostic);
 }
 return true;
};
