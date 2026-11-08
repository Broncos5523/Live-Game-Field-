/* V12 football-only DOM enhancement; never changes basketball or hockey. */
(() => {
  const names={ARI:'CARDINALS',ATL:'FALCONS',BAL:'RAVENS',BUF:'BILLS',CAR:'PANTHERS',CHI:'BEARS',CIN:'BENGALS',CLE:'BROWNS',DAL:'COWBOYS',DEN:'BRONCOS',DET:'LIONS',GB:'PACKERS',HOU:'TEXANS',IND:'COLTS',JAX:'JAGUARS',KC:'CHIEFS',LV:'RAIDERS',LAC:'CHARGERS',LAR:'RAMS',MIA:'DOLPHINS',MIN:'VIKINGS',NE:'PATRIOTS',NO:'SAINTS',NYG:'GIANTS',NYJ:'JETS',PHI:'EAGLES',PIT:'STEELERS',SEA:'SEAHAWKS',SF:'49ERS',TB:'BUCCANEERS',TEN:'TITANS',WAS:'COMMANDERS'};
  const aliases={WSH:'WAS',LA:'LAR',JAC:'JAX'};
  // End-zone goalposts seen almost edge-on, as in the ESPN Gamecast reference.
  // Mirror the geometry at opposite ends; avoid a front-facing U silhouette.
  // Edge-on goalposts: uprights overlap in perspective, not a wide U shape.
  // One full-surface SVG: short ESPN-style goal silhouettes, no narrow post boxes.
  const goalOverlay='<svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffdf24" stroke-width="3.8" stroke-linejoin="round" stroke-linecap="round"><path d="M45 285 L37 257 L17 251 L14 225 M37 257 L33 222"/><path d="M955 285 L963 257 L983 251 L986 225 M963 257 L967 222"/></g><g fill="none" stroke="#fff4a4" stroke-width="1"><path d="M45 283 L37 256 L17 250 M955 283 L963 256 L983 250"/></g></svg>';

  function enhance(){
    document.querySelectorAll('.game-story.is-live').forEach(story=>{
      if(!story.querySelector('.football-field') || story.querySelector('.play-portrait'))return;
      const leader=document.querySelector('.leader-card img');
      const portrait=document.createElement('aside');portrait.className='play-portrait';
      const title=document.createElement('span');title.textContent='LAST PLAY';
      const frame=document.createElement('div');frame.className='play-portrait-image has-photo';
      if(leader){const img=document.createElement('img');img.src=leader.src;img.alt='';frame.appendChild(img);}
      const name=document.createElement('strong');name.textContent='PLAYER SPOTLIGHT';
      portrait.append(title,frame,name);story.prepend(portrait);
    });
    document.querySelectorAll('.game-story.is-live').forEach(story=>{
      const field=story.querySelector('.football-field');
      if(!field)return;
      const surface=story.querySelector('.story-live-body');
      if(!surface)return;
      let bar=surface.querySelector('.football-drive-banner');
      if(!bar){
        bar=document.createElement('div');
        bar.className='football-drive-banner';
        bar.setAttribute('aria-label','Current drive');
        surface.appendChild(bar);
      }
      const situation=story.querySelector('.story-header strong')?.textContent?.trim()||'';
      const match=situation.match(/^([A-Z]{2,4})\s+BALL\s*[•·-]?\s*(.*)$/i);
      const possession=match?.[1]||'';
      const detail=match?.[2]||situation;
      const driveText=possession
        ? 'CURRENT DRIVE  ·  '+(names[aliases[possession]||possession]||possession)+'  ·  '+(detail||'IN PROGRESS')
        : 'CURRENT DRIVE  ·  '+(situation||'IN PROGRESS');
      if(bar.textContent!==driveText)bar.textContent=driveText;
    });
    document.querySelectorAll('.game-story.is-live').forEach(story=>{
      if(!story.querySelector('.football-field'))return;
      const header=story.querySelector('.story-header');
      if(!header)return;
      const original=header.querySelector('strong')?.textContent?.trim()||'';
      const down=original.match(/(1ST|2ND|3RD|4TH)\s*(?:&|AND)\s*(GOAL|\d+)/i);
      const label=down ? down[1].toUpperCase()+' & '+down[2].toUpperCase() : 'DOWN & DISTANCE';
      let badge=header.querySelector('.football-down-distance');
      if(!badge){badge=document.createElement('strong');badge.className='football-down-distance';header.appendChild(badge);}
      if(badge.textContent!==label)badge.textContent=label;
    });
    document.querySelectorAll('.game-story.is-live').forEach(story=>{
      if(!story.querySelector('.football-field'))return;
      const label=story.querySelector('.story-event > span');
      if(label && label.textContent!=='LAST PLAY')label.textContent='LAST PLAY';
      const surface=story.querySelector('.story-live-body');
      if(!surface)return;
      const field=surface.querySelector('.football-field');
      if(!field)return;
      field.querySelectorAll('.football-goalpost').forEach(n=>n.remove());
      surface.querySelectorAll(':scope > .football-goalpost-external, :scope > .football-goalpost-overlay').forEach(n=>n.remove());
      const overlay=document.createElement('div');
      overlay.className='football-goalpost-overlay';
      overlay.innerHTML=goalOverlay;
      surface.appendChild(overlay);
    });
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

    });
  }
  let pending=false;
  const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance();});});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  enhance();
})();
