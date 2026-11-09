/* Source injected into the established React bundle; no external DOM mutations. */
const staticPlayMemory=new Map(),staticMarkerMemory=new Map();
function staticLatest(config,competition,summary,status){
  const flat = [...(summary.plays||[]),...(summary.drives?.previous||[]).flatMap(d=>d.plays||[]),...(summary.drives?.current?.plays||[])];
  const current=competition.situation?.lastPlay;
  const key=config.key+':'+String(competition.id||summary.header?.id||'');
  const full=current?.text?flat.find(p=>String(p.id)===String(current.id)):null;
  const latest=current?.text?{...full,...current,start:{...full?.start,...current.start},end:{...full?.end,...current.end}}:flat.at(-1);
  if(latest?.text){if(staticPlayMemory.size>128)staticPlayMemory.delete(staticPlayMemory.keys().next().value);staticPlayMemory.set(key,latest);return latest;}
  return staticPlayMemory.get(key)||null;
}
function staticFootballState(competition,summary,away,home,play){
  const current=competition.situation||{},end=play?.end||{};
  const number=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  const drive=summary.drives?.current;
  const driveMatches=drive?.plays?.some(p=>String(p.id)===String(play?.id));
  const possessionId=current.possession||end.team?.id||(driveMatches?drive.team?.id:null);
  const possession=String(possessionId)===String(home.id)?'home':String(possessionId)===String(away.id)?'away':null;
  const down=number(current.down)??number(end.down);
  const distance=number(current.distance)??number(end.distance);
  const label=current.possessionText||end.possessionText;
  let ball=window.MancavePlayFeed.footballField({...current,possessionText:label},away,home).ball;
  // ESPN football yardLine is measured from the home goal line. Confirmed
  // against the provider's own possessionText in recorded NFL/CFB data.
  const yardLine=number(current.yardLine)??number(end.yardLine);
  if(ball==null&&yardLine!=null&&yardLine>=0&&yardLine<=100)ball=6+(100-yardLine)*.88;
  const goalToGo=/goal/i.test(current.shortDownDistanceText||current.downDistanceText||end.shortDownDistanceText||end.downDistanceText||'');
  const target=ball!=null&&distance!=null&&possession?ball+(possession==='away'?1:-1)*distance*.88:null;
  const firstDown=down>=1&&down<=4&&!goalToGo&&target!=null&&target>6&&target<94?target:null;
  return {ball,firstDown,down,distance,possession,start:window.MancavePlayFeed.footballField(current,away,home).start};
}
function staticFootballField(config,competition,summary,status,away,home,play){
  return staticFootballState(competition,summary,away,home,play);
}
function staticData(config,competition,summary,status,away,home,play){
  const situation=competition.situation||{};
  const text=String(play?.text||'');
  const kind=String(play?.type?.text||'');
  const result={playId:String(play?.id||text),markers:[],possessionKnown:!!situation.possession,play};
  const numeric=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
  const coord=play?.coordinate;
  const shotSide=String(play?.team?.id)===String(home.id)?'home':String(play?.team?.id)===String(away.id)?'away':null;
  if(['NBA','WNBA','CBB'].includes(config.key)){
    const shot=play?.shootingPlay===true||/shot|jumper|layup|dunk|free throw/i.test(kind+' '+text);
    if(shot&&shotSide&&numeric(coord?.x)&&numeric(coord?.y)&&coord.x>=0&&coord.x<=50&&coord.y>=0&&coord.y<=88.75){
      const longitudinal=(5.25+Number(coord.y))/94*100;
      const blocked=/block/i.test(text+' '+kind),made=!blocked&&!/miss/i.test(text)&&(play.scoringPlay===true||/makes|made/i.test(text));
      result.markers=[{x:shotSide==='away'?longitudinal:100-longitudinal,y:shotSide==='away'?coord.x*2:100-coord.x*2,kind:blocked?'block':made?'make':'miss',label:text}];
    }
  }
  if(config.key==='NHL'){
    const blocked=/blocked shot|shot blocked|blocks.*shot/i.test(text+' '+kind);
    const goal=play?.scoringPlay===true||/\bgoal\b/i.test(kind)&&!/no goal/i.test(kind);
    const shot=blocked||goal||/shot on goal|missed shot|shot.*saved|saved by/i.test(text+' '+kind);
    if(shot&&numeric(coord?.x)&&numeric(coord?.y)&&Math.abs(coord.x)<=100&&Math.abs(coord.y)<=42.5){result.markers=[{x:(Number(coord.x)+100)/2,y:(42.5-Number(coord.y))/85*100,kind:blocked?'block':goal?'make':'miss',label:text}];}
  }
  if(['NFL','CFB'].includes(config.key)){
    const football=staticFootballState(competition,summary,away,home,play);
    result.line=football.ball;
    result.firstDown=football.firstDown;
  }
  if(config.key==='MLB'){
    result.bases=[!!situation.onFirst,!!situation.onSecond,!!situation.onThird];
    result.count={balls:situation.balls??null,strikes:situation.strikes??null,outs:situation.outs??null};
    const at={first:[75,64],second:[50,39],third:[25,64],home:[50,89]};
    const spots=new Set();
    for(const runner of play?.runners||[]){if(runner.isOut===true||runner.out===true){const base=runner.outBase||runner.movement?.outBase;const key={1:'first',2:'second',3:'third',4:'home','1B':'first','2B':'second','3B':'third',HP:'home'}[base];if(key)spots.add(key);}}
    if(/struck out|strikes out|strikeout/i.test(text+' '+kind))spots.add('home');
    for(const [word,key] of [['first','first'],['second','second'],['third','third'],['home','home']])if(new RegExp('out at '+word,'i').test(text))spots.add(key);
    if(/ground(?:ed|s) out/i.test(text)&&!/double play|triple play|fielder.?s choice/i.test(text))spots.add('first');
    if(/double play/i.test(text)&&/to second.*to first/i.test(text)){spots.add('second');spots.add('first');}
    result.markers=[...spots].map(key=>({x:at[key][0],y:at[key][1],kind:'block',label:'Out at '+key}));
  }
  const cacheKey=config.key+':'+String(competition.id||summary.header?.id||'');
  const previous=staticMarkerMemory.get(cacheKey);
  if(previous?.playId===result.playId&&previous.play?.text===play?.text&&!result.markers.length&&previous.markers.length)result.markers=previous.markers;
  if(staticMarkerMemory.size>128)staticMarkerMemory.delete(staticMarkerMemory.keys().next().value);
  staticMarkerMemory.set(cacheKey,result);
  return result;
}
function staticActor(config,summary,competition,text,away,home){
  const original=lastPlayActor(config,summary,competition,text,away,home);
  if(original?.name)return original;
  const play=competition.situation?.lastPlay;
  const athletes=(summary.boxscore?.players||[]).flatMap(g=>(g.statistics||[]).flatMap(t=>(t.athletes||[]).map(a=>({...a.athlete,teamId:g.team?.id}))));
  const refs=[...(play?.participants||[]).map(p=>p.athlete),...(play?.athletesInvolved||[])].filter(Boolean);
  const normalized=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const beginning=normalized(text);
  let actor=athletes.find(a=>[a.displayName,a.fullName,a.shortName].some(n=>n&&beginning.startsWith(normalized(n))));
  actor=actor||refs.find(a=>[a.displayName,a.fullName,a.shortName].some(n=>n&&beginning.startsWith(normalized(n))));
  if(!actor&&refs.length){const ref=(config.key==='MLB'?play?.participants?.find(p=>p.type==='batter')?.athlete:null)||refs[0];actor=athletes.find(a=>String(a.id)===String(ref.id))||ref;}
  const team=[away,home].find(t=>String(t.id)===String(actor?.teamId||actor?.team?.id||play?.team?.id));
  return {name:actor?.displayName||actor?.fullName||actor?.shortName||'',src:actor?ri(config,actor):'',team:team?.short||original?.team||''};
}
function StaticMarker({marker}){return I.createElement('span',{className:'static-play-marker '+marker.kind,style:{left:marker.x+'%',top:marker.y+'%'},role:'img','aria-label':marker.label,title:marker.label},marker.kind==='block'?'×':'');}
function Vm({game}){
  const data=game.staticState||{markers:[]};
  const decorate=node=>{
    if(!I.isValidElement(node))return node;
    const cls=node.props.className||'';
    let children=I.Children.toArray(node.props.children).map(decorate);
    if(/^(basketball-court|hockey-rink|football-field)$/.test(cls)){
      children.push(...(data.markers||[]).map((m,i)=>I.createElement(StaticMarker,{key:'static-marker-'+i,marker:m})));
      if(cls==='hockey-rink'||cls==='football-field')children.push(I.createElement('div',{key:'center-logo',className:'static-center-logo'},I.createElement(Nl,{src:game.home.logo,fallbackSrc:game.home.logoFallback,label:game.home.short})));
      if(cls==='football-field'){
        if(data.line!=null)children.push(I.createElement('i',{key:'scrimmage',className:'static-scrimmage',style:{left:data.line+'%'},'aria-label':'Line of scrimmage'}));
        if(data.firstDown!=null)children.push(I.createElement('i',{key:'first-down',className:'static-first-down',style:{left:data.firstDown+'%'},'aria-label':'First-down line'}));
      }
    }
    return I.cloneElement(node,{},children);
  };
  if(game.sport==='MLB'){
    const bases=data.bases||[false,false,false],count=data.count||{};
    return I.createElement('section',{className:'context panel surface-status static-baseball-status'},I.createElement('div',{className:'surface-body'},
      I.createElement('div',{className:'static-baseball-field'},
        I.createElement('svg',{viewBox:'0 0 100 100',className:'static-baseball-lines','aria-hidden':true},
          I.createElement('path',{d:'M50 89L5 44Q50 -22 95 44Z',fill:'#1e6a41',stroke:'#f7f5db','strokeWidth':.65}),
          I.createElement('path',{d:'M50 89L25 64L50 39L75 64Z',fill:'#ba8c5b',stroke:'#f7f5db','strokeWidth':.7}),
          I.createElement('circle',{cx:50,cy:64,r:4,fill:'#c99b6c'})),
        I.createElement('div',{className:'static-baseball-logo'},I.createElement(Nl,{src:game.home.logo,fallbackSrc:game.home.logoFallback,label:game.home.short})),
        ...[[75,64],[50,39],[25,64],[50,89]].map(([x,y],i)=>I.createElement('i',{key:'base'+i,className:'static-base'+(bases[i]?' occupied':''),style:{left:x+'%',top:y+'%'},'aria-label':(i===3?'Home plate':['First base','Second base','Third base'][i])+(bases[i]?' occupied':'')})),
        ...(data.markers||[]).map((m,i)=>I.createElement(StaticMarker,{key:'out'+i,marker:m}))),
      I.createElement('div',{className:'static-count'},...['balls','strikes','outs'].map(k=>I.createElement('span',{key:k},k.toUpperCase()+' ',I.createElement('b',{},count[k]??'—'))))));
  }
  return decorate(OriginalVm({game}));
}
function Qm({game,colorCollision}){
  const a=my(game),baseball=game.sport==='MLB',p=game.baseball?.pitcher;
  return I.createElement('section',{className:'game-story is-live story-'+game.sport.toLowerCase(),'aria-label':'Game playing surface',style:{'--story-accent':game.home.color}},
    I.createElement(LastPlayPortrait,{game,key:JSON.stringify(game.lastPlayActor||{})}),
    I.createElement('div',{className:'story-header'},I.createElement('div',{className:'story-kicker'},baseball?'ON THE MOUND':'GAME FLOW'),I.createElement('strong',{},game.state==='post'?'GAME COMPLETE':baseball?[p?.name,game.situation].filter(Boolean).join(' · '):game.situation)),
    I.createElement('div',{className:'story-live-body'},I.createElement(Vm,{game})),
    I.createElement('div',{className:'story-event'},I.createElement('span',{},'LAST PLAY'),I.createElement('strong',{},game.lastPlay),I.createElement('b',{},a.upper+' · '+a.lower)));
}
