/* Isolated three-tier event presentation rules. No production imports. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.ManCaveThreeTier=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const HEX=/^#[0-9a-f]{6}$/i;
  const NEUTRAL=["#c4cbd2","#090d14"];
  const LEAGUES={
    nfl:["#013369","#d50a0a"],nba:["#17408b","#c9082a"],
    nhl:["#111111","#a5a5a5"],mlb:["#002d72","#d50032"],
    wnba:["#f36f21","#171717"],cfb:["#b5b5b5","#151515"],
    cbb:["#b5b5b5","#151515"]
  };
  function colors(event,teams){
    const e=event||{}, list=Array.isArray(teams)?teams:[];
    if(e.kind==="league"||e.officialLeagueEvent===true)
      return LEAGUES[String(e.league||"").toLowerCase()]||NEUTRAL;
    if(e.kind==="neutral"||e.teamSpecific===false)return NEUTRAL;
    // Actor team wins over possession; never guess from the score.
    const id=e.actorTeamId||e.eventTeamId||e.teamId;
    const team=id==null?null:list.find(t=>String(t.id)===String(id));
    if(!team)return NEUTRAL;
    return [team.primaryColor,team.secondaryColor].map((c,i)=>HEX.test(c||"")?c:NEUTRAL[i]);
  }
  function gradient(event,teams){
    const [a,b]=colors(event,teams);
    // Full 100% width: no transparent stop or default gray at right.
    return "linear-gradient(105deg, "+a+" 0%, "+a+" 16%, "+b+" 100%)";
  }
  function timeouts(remaining,total){
    if(!Number.isInteger(total)||total<0||total>10)return [];
    if(!Number.isInteger(remaining)||remaining<0||remaining>total)return [];
    return Array.from({length:total},(_,i)=>({
      available:i<remaining,color:i<remaining?"#facc15":"#d1d5db"
    }));
  }
  return Object.freeze({colors,gradient,timeouts});
});
