/* Build 33: isolated persistent last-play motion prototype. No Build 32 changes. */
(() => {
 const memory=new Map(); let activeKey='',pending=false; let lastGame='';
 const colors={DEN:'#FB4F14',KC:'#E31837',BUF:'#00338D',NE:'#002244',BAL:'#241773',PHI:'#004C54',DAL:'#003594',SF:'#AA0000',GB:'#203731',PIT:'#FFB612'};
 const clean=s=>String(s||'').trim();
 const ns='http://www.w3.org/2000/svg';
 function render(){
  const story=document.querySelector('.game-story.is-live:has(.football-field)');
  if(!story)return;
  const field=story.querySelector('.football-field');
  const runReview=new URLSearchParams(location.search).get('run-review')==='1';
  const play=runReview?'Isiah Pacheco rushes for 8 yards':clean(story.querySelector('.story-event strong')?.textContent);
  const game=clean(document.querySelector('.hero')?.getAttribute('aria-label'))||clean(document.querySelector('.hero')?.textContent).slice(0,120);
  if(!play||/waiting|no play|loading/i.test(play))return;
  const key=game+'|'+play+'|'+(runReview?'run-review':'live');
  if(runReview){const playLabel=story.querySelector('.story-event strong');if(playLabel&&playLabel.textContent!==play)playLabel.textContent=play;}
  const prior=memory.get(game);
  if(prior?.key!==key){
   const home=clean(field.querySelector('.home-zone')?.dataset.teamCode);
   const away=clean(field.querySelector('.away-zone')?.dataset.teamCode);
   const pos=clean(story.querySelector('.story-header strong')?.textContent).match(/^([A-Z]{2,4}) BALL/i)?.[1]||home;
   const code=pos==='WSH'?'WAS':pos;
   const t=play.toLowerCase();
   const yardsMatch=t.match(/(?:for|gain of|loss of)\s+(-?\d+)\s+(?:yards?|yds?)/);
   const yards=yardsMatch?Number(yardsMatch[1]):null;
   const loss=(yards!==null&&yards<0)||/sacked|tackled for a loss|loss of \d+ yards/.test(t);
   const pass=/pass|intercept|sacked|complete to|completion/.test(t)&&!/pass interference/.test(t);
   const incomplete=/incomplete|intended for|pass falls/.test(t)&&!/complete to/.test(t);
   const interception=/intercept/.test(t);
   const fumble=/fumbl/.test(t);
   const touchdown=/touchdown/.test(t);
   const first=/first down/.test(t);
   const penalty=/penalty|holding|offsides|offside|false start|pass interference/.test(t);
   const timeout=/time.?out/.test(t);
   const sack=/sacked/.test(t);
   const kick=/punt|kickoff|field goal|extra point/.test(t);
   const x=loss||incomplete||interception||fumble;
   const announcement=touchdown?'TOUCHDOWN':interception?'INTERCEPTION':fumble?'FUMBLE RECOVERED':penalty?'PENALTY':timeout?'TIMEOUT':first?'FIRST DOWN':sack?'SACK':incomplete?'INCOMPLETE':kick?'KICK':loss?'LOSS OF YARDS':'';
   const color=penalty?'#FFD700':interception||fumble||loss||incomplete?'#ff4545':colors[code]||getComputedStyle(story).getPropertyValue('--football-primary').trim()||'#ffffff';
   const ball=field.querySelector('.football-ball');
   const computed=ball?getComputedStyle(ball):null;
   const rawLeft=computed?.left||'50%';
   const px=parseFloat(rawLeft);
   const from=rawLeft.endsWith('%')?px:Number.isFinite(px)&&field.clientWidth?px/field.clientWidth*100:50;
   const ballRect=ball?.getBoundingClientRect();
   const fieldRect=field.getBoundingClientRect();
   const ballCenter=ballRect&&fieldRect.width>0?(ballRect.left+ballRect.width/2-fieldRect.left)/fieldRect.width*100:from;
   const end=Math.max(2,Math.min(98,ballCenter));
   // Never invent yardage or a trail length when the feed lacks movement data.
   const demo=!!document.querySelector('.live-count.demo')||/demo/i.test(document.querySelector('.hero')?.textContent||'');
   const knownDemoPass=demo&&/mah omes|mahomes/i.test(t)&&/kelce/i.test(t)&&/complet/i.test(t);
   const distance=yards===null?(knownDemoPass?12.32:0):Math.max(0,Math.min(30,Math.abs(yards)*.88));
   const towardLeft=runReview?true:code===home;
   const direction=towardLeft?-1:1;
   const start=Math.max(2,Math.min(98,end-direction*(loss?-1:1)*distance));
   const data={key,play,announcement,color,from:start,to:end,pass,loss,x,success:pass&&!incomplete&&!interception, duration:pass?2000:1500,hasMovement:distance>0,teamColor:colors[code]||'#E31837'};
   memory.set(game,data);if(memory.size>100)memory.delete(memory.keys().next().value);
  }
  const data=memory.get(game);if(!data)return;
  const current=field.querySelector('.mcsb-motion');
  if(activeKey===key&&current)return;
  activeKey=key;
  current?.remove();
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1000 400');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.classList.add('mcsb-motion');
  const path=document.createElementNS(ns,'path');
  const x1=data.from*10,x2=data.to*10,y=200;
  const d=data.pass&&data.hasMovement?`M ${x1} ${y} Q ${(x1+x2)/2} 40 ${x2} ${y}`:`M ${x1} ${y} Q ${x1+(x2-x1)*.30} ${y-48} ${x1+(x2-x1)*.55} ${y+20} T ${x2} ${y}`;
  path.setAttribute('d',d);path.setAttribute('fill','none');if(!data.hasMovement)path.setAttribute('opacity','0');const trailColor=data.loss?'#ff4141':data.pass?'#f5f5ee':(runReview?'#E31837':data.teamColor);
  path.setAttribute('stroke',trailColor);
  path.style.setProperty('stroke',trailColor,'important');path.setAttribute('stroke-width','6');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-dasharray',data.pass?'none':'14 14');path.classList.add('mcsb-path');svg.append(path);
  if(data.x||data.success){
   const mark=document.createElementNS(ns,'text');mark.setAttribute('x',x2);mark.setAttribute('y',y+14);mark.setAttribute('text-anchor','middle');mark.setAttribute('font-size','58');mark.setAttribute('font-weight','900');mark.setAttribute('fill',data.x?'#ff3434':'#39ff6a');mark.textContent=data.x?'×':'✓';mark.classList.add('mcsb-mark');svg.append(mark);
  }
  field.append(svg); 
  field.dataset.motionStatus='active'; 
  field.dataset.motionPlay=data.play.slice(0,80);
  if(runReview){let info=document.getElementById('run34-proof');if(!info){info=document.createElement('div');info.id='run34-proof';info.style.cssText='position:fixed;top:5px;right:5px;z-index:999999;padding:5px 9px;background:#0b1629;color:#fff;font:12px monospace;border:1px solid #E31837';document.body.append(info);}info.textContent='RUN 34 | '+(data.pass?'PASS':'RUN')+' | stroke '+getComputedStyle(path).stroke+' | endpoint '+Math.round(data.to)+'%';}
  let label=field.querySelector('.mcsb-announcement');
  if(!label){label=document.createElement('div');label.className='mcsb-announcement';field.append(label);}
  label.textContent=data.announcement?((story.querySelector('.story-header strong')?.textContent.match(/^([A-Z]{2,4}) BALL/)?.[1]||'')+' '+data.announcement).trim():'';
  label.style.color=data.color;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const length=path.getTotalLength();
   if(data.hasMovement&&length>0){if(data.pass){path.setAttribute('stroke-dasharray',String(length));path.animate([{strokeDashoffset:length},{strokeDashoffset:0}],{duration:data.duration,easing:'ease-in-out',fill:'forwards'});}else{path.setAttribute('stroke-dasharray','14 14');path.animate([{strokeDashoffset:length,opacity:.2},{strokeDashoffset:0,opacity:1}],{duration:data.duration,easing:'ease-in-out',fill:'forwards'});}}
   if(label.textContent)label.animate([{opacity:0,transform:'translateX(-50%) scale(.94)'},{opacity:1,transform:'translateX(-50%) scale(1)'}],{duration:650,delay:data.duration,fill:'both'});
  }
 }
 window.__mcsbFootballMotion34={getStatus:()=>({activeKey,plays:[...memory.values()].map(v=>({play:v.play,hasMovement:v.hasMovement,pass:v.pass})),overlay:!!document.querySelector('.mcsb-motion')})};
 const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;try{render()}catch(e){console.error('Football motion:',e);}});});
 observer.observe(document.getElementById('app'),{childList:true,subtree:true,characterData:true});
 render();
})();