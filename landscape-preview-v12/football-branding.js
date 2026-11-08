/* V12 football-only DOM enhancement; never changes basketball or hockey. */
(() => {
  const names={ARI:'CARDINALS',ATL:'FALCONS',BAL:'RAVENS',BUF:'BILLS',CAR:'PANTHERS',CHI:'BEARS',CIN:'BENGALS',CLE:'BROWNS',DAL:'COWBOYS',DEN:'BRONCOS',DET:'LIONS',GB:'PACKERS',HOU:'TEXANS',IND:'COLTS',JAX:'JAGUARS',KC:'CHIEFS',LV:'RAIDERS',LAC:'CHARGERS',LAR:'RAMS',MIA:'DOLPHINS',MIN:'VIKINGS',NE:'PATRIOTS',NO:'SAINTS',NYG:'GIANTS',NYJ:'JETS',PHI:'EAGLES',PIT:'STEELERS',SEA:'SEAHAWKS',SF:'49ERS',TB:'BUCCANEERS',TEN:'TITANS',WAS:'COMMANDERS'};
  const aliases={WSH:'WAS',LA:'LAR',JAC:'JAX'};
  const postSVG='<svg viewBox="0 0 44 100" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true"><path d="M4 5 V54 H40 V5 M22 54 V98" fill="none" stroke="#f8ce21" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5 V54 H40" fill="none" stroke="#fff3a4" stroke-opacity=".55" stroke-width="1"/></svg>';
  function enhance(){
    document.querySelectorAll('.football-field').forEach(field=>{
      const away=field.querySelector('.away-zone'),home=field.querySelector('.home-zone');
      if(!away||!home)return;
      const a=(away.dataset.teamCode||away.textContent||'').trim().toUpperCase();
      const h=(home.dataset.teamCode||home.textContent||'').trim().toUpperCase();
      if(!a||!h)return;
      const aa=aliases[a]||a,hh=aliases[h]||h;
      if(field.dataset.v12Teams===a+'-'+h && field.querySelector('.football-midfield'))return;
      away.dataset.teamCode=a;home.dataset.teamCode=h;
      away.textContent=names[aa]||a;home.textContent=names[hh]||h;
      field.dataset.v12Teams=a+'-'+h;
      field.querySelectorAll('.football-midfield,.football-goalpost').forEach(n=>n.remove());
      if(names[hh]){
        const logo=document.createElement('img');logo.className='football-midfield';
        logo.alt='';logo.decoding='async';logo.src='https://a.espncdn.com/i/teamlogos/nfl/500/'+hh.toLowerCase()+'.png';
        field.appendChild(logo);
      }
      ['left','right'].forEach(side=>{
        const post=document.createElement('div');post.className='football-goalpost '+side;
        post.innerHTML=postSVG;field.appendChild(post);
      });
    });
  }
  let pending=false;
  const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance();});});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  enhance();
})();
