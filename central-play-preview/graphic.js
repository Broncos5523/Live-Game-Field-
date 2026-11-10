/* Central React component only. Original DOM remains hidden to preserve shared :has selectors. */
(function(root){'use strict';
function VenueFallback({React,sport,eventId}){
 React.useEffect(()=>{
  const dashboard=document.querySelector('.dashboard[data-event="'+eventId+'"]');
  const backdrop=dashboard?.querySelector('.matchup-backdrop');
  if(!backdrop)return;
  const previous={image:backdrop.style.backgroundImage,size:backdrop.style.backgroundSize,position:backdrop.style.backgroundPosition};
  const url=root.ManCaveCentralArtwork?.[sport]||'../central-play-preview/assets/'+sport+'.jpeg';
  backdrop.style.backgroundImage='url("'+url+'")';backdrop.style.backgroundSize='cover';backdrop.style.backgroundPosition='center';
  return ()=>{backdrop.style.backgroundImage=previous.image;backdrop.style.backgroundSize=previous.size;backdrop.style.backgroundPosition=previous.position;};
 },[sport,eventId]);
 return null;
}
root.ManCaveCentralGraphic=function(React,game,legacy,summary,options){
 const model=root.ManCaveCentralData.fromGame(game,summary,options);
 if(!model)return legacy;
 const h=React.createElement,football=model.situation.length>0;
 const image=h('img',{key:model.portrait,src:model.portrait,alt:model.name||game.sport,decoding:'async',onError:e=>{const node=e.currentTarget;if(node.dataset.fallback)return node.style.visibility='hidden';node.dataset.fallback='1';node.src=model.fallback;}});
 const stats=model.stats.map(([label,value])=>h('span',{className:'central-stat',key:label},h('b',null,value??'—'),h('small',null,label)));
 const bottom=football?
  h('div',{className:'central-situation'},...model.situation.map(([label,value])=>h('span',{key:label},h('small',null,label),h('b',null,value)))):
  h('div',{className:'central-player-line'},h('strong',null,model.footer),stats.length?h('div',{className:'central-stats'},...stats):null);
 const graphic=h('article',{className:'central-broadcast'+(game.sport==='NHL'?' central-ice':''),'aria-label':game.sport+' last-play broadcast graphic',style:{'--central-primary':model.primary,'--central-secondary':model.secondary},'data-tone':model.tone,'data-football':String(football),'data-play-id':model.playId,'data-athlete-id':model.athleteId||'','data-team-id':model.teamId||''},
  h('header',{className:'central-tier central-top'},h('span',null,model.topLabel),h('strong',{className:football?'':'central-result'},model.top)),
  h('div',{className:'central-tier central-middle'},h('div',{className:'central-portrait'+(model.isPlayer?' central-headshot':' central-mark')},image),h('div',{className:'central-play-copy'},football?h('strong',{className:'central-result central-football-result'},model.headline):h('span',null,'LAST EVENT'),h('p',{'data-length':model.text.length>175?'long':model.text.length>115?'medium':'short'},model.text))),
  h('footer',{className:'central-tier central-bottom','aria-label':model.footer},bottom));
 return React.cloneElement(legacy,{className:legacy.props.className+' central-updated','aria-label':game.sport+' central last-play presentation'},
  h('div',{className:'central-preserved-context',hidden:true,'aria-hidden':true},legacy.props.children),
  h(VenueFallback,{React,sport:game.sport,eventId:String(game.id)}),
  h('div',{className:'central-stage'},graphic));
};
})(window);
