(()=>{'use strict';
const frame=document.querySelector('iframe'),info=document.getElementById('info'),toggle=document.getElementById('toggle');
let plays=[],index=0,running=true,anim=0,field=null;
const endpoint='https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401873033';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function getField(){try{return frame.contentDocument?.getElementById('players')?frame.contentDocument:null}catch(e){return null}}
function getStart(p){const n=Number(p.start?.yardLine);return Number.isFinite(n)&&n>0?clamp(10+n,19,100):48}
function playType(p){const t=(p.type?.text||'')+' '+(p.text||'');return /punt/i.test(t)?'PUNT':/field goal/i.test(t)?'KICK':/sack/i.test(t)?'SACK':/incomplete/i.test(t)?'INCOMPLETE':/pass/i.test(t)?'PASS':/rush|run/i.test(t)?'RUN':'PLAY'}
function animate(p){const doc=getField();if(!doc){info.textContent+=' • Field not ready';return}
cancelAnimationFrame(anim);const dots=[...doc.querySelectorAll('#players .dot')],ball=doc.getElementById('ball'),los=doc.getElementById('los'),first=doc.getElementById('first'),route=doc.getElementById('route');
const x=getStart(p),kind=playType(p),gain=clamp(Number(p.statYardage??p.end?.yardLine-p.start?.yardLine)||0,-15,35);
const dir=1;const x2=clamp(x+gain*0.7,12,108);
if(los){los.setAttribute('x1',x);los.setAttribute('x2',x)}
if(first){first.setAttribute('x1',clamp(x+10,12,108));first.setAttribute('x2',clamp(x+10,12,108))}
if(route){route.setAttribute('d',kind==='PASS'||kind==='INCOMPLETE'?'M '+(x-4)+' 26 Q '+(x+gain*.3)+' 10 '+x2+' 17':'M '+(x-4)+' 26 L '+x2+' 27');route.classList.add('on')}
const base=dots.map((dot,i)=>{const off=i<11;const j=i%11;const a=off?[[ -5,26],[-1,17],[-1,21],[-1,26],[-1,31],[-1,35],[-4,10],[-4,43],[-9,18],[-9,34],[-12,26]][j]:[[2,17],[2,21],[2,26],[2,31],[2,35],[6,11],[6,42],[9,19],[9,33],[13,25],[13,38]][j];return {dot,x:x+a[0],y:a[1],off,j}});
const start=performance.now();
function step(now){const t=clamp((now-start)/3300,0,1),ease=t*t*(3-2*t);base.forEach(d=>{const move=d.off?(d.j===0?Math.max(1,gain*.35):d.j>7?gain*.7:2.8):(d.j>7?gain*.35:-1.7);const dy=d.off&&d.j>7?(d.j%2?-7:7)*ease:Math.sin(d.j*2)*ease;d.dot.setAttribute('transform','translate('+(d.x+move*ease)+' '+(d.y+dy)+')')});if(ball){ball.setAttribute('cx',x-5+(x2-x+5)*ease);ball.setAttribute('cy',26+(kind==='PASS'?-9*Math.sin(Math.PI*t):0))}if(t<1)anim=requestAnimationFrame(step)}anim=requestAnimationFrame(step);
const down=doc.getElementById('down');if(down)down.textContent=(p.start?.down||'')+' & '+(p.start?.distance||'')+' • '+kind;
const content=doc.getElementById('lastcontent');if(content){content.replaceChildren();const div=doc.createElement('div');div.className='lastmessage';div.textContent=p.text||kind;content.append(div)}
const flag=doc.querySelector('.flag');if(flag)flag.textContent='RECORDED GAME REPLAY • SIMULATED PLAYER POSITIONS';
}
function show(){if(!plays.length)return;const p=plays[index];info.textContent='PLAY '+(index+1)+'/'+plays.length+' • Q'+(p.period?.number||p.period||'?')+' '+(p.clock?.displayValue||'')+' • '+(p.text||p.type?.text||'Play');animate(p)}
function next(){if(!running||!plays.length)return;index=(index+1)%plays.length;show()}
toggle.onclick=()=>{running=!running;toggle.textContent=running?'Pause':'Play'};document.getElementById('restart').onclick=()=>{index=0;show()};
async function load(){try{const r=await fetch(endpoint,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();const all=Array.isArray(data.plays)?data.plays:Array.isArray(data.drives?.previous)?data.drives.previous.flatMap(d=>d.plays||[]):Array.isArray(data.drives?.drives)?data.drives.drives.flatMap(d=>d.plays||[]):[];plays=all.filter(p=>p.text||p.type?.text);if(!plays.length)throw Error('No recorded plays');if(getField())show();else frame.addEventListener('load',show,{once:true})}catch(e){running=false;toggle.textContent='Play';info.textContent='Replay unavailable: '+e.message}}load();setInterval(next,5000);
})();