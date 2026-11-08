/* V12 football-only DOM enhancement; never changes basketball or hockey. */
(() => {
  const names={ARI:'CARDINALS',ATL:'FALCONS',BAL:'RAVENS',BUF:'BILLS',CAR:'PANTHERS',CHI:'BEARS',CIN:'BENGALS',CLE:'BROWNS',DAL:'COWBOYS',DEN:'BRONCOS',DET:'LIONS',GB:'PACKERS',HOU:'TEXANS',IND:'COLTS',JAX:'JAGUARS',KC:'CHIEFS',LV:'RAIDERS',LAC:'CHARGERS',LAR:'RAMS',MIA:'DOLPHINS',MIN:'VIKINGS',NE:'PATRIOTS',NO:'SAINTS',NYG:'GIANTS',NYJ:'JETS',PHI:'EAGLES',PIT:'STEELERS',SEA:'SEAHAWKS',SF:'49ERS',TB:'BUCCANEERS',TEN:'TITANS',WAS:'COMMANDERS'};
  const aliases={WSH:'WAS',LA:'LAR',JAC:'JAX'};
  const postSVG='<svg viewBox="0 0 44 100" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true"><path d="M4 5 V54 H40 V5 M22 54 V98" fill="none" stroke="#f8ce21" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5 V54 H40" fill="none" stroke="#fff3a4" stroke-opacity=".55" stroke-width="1"/></svg>';
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
      const event=story.querySelector('.story-event');
      const header=story.querySelector('.story-header');
      if(!event||!header)return;
      const down=header.querySelector('.football-down-distance');
      let display=event.querySelector('.football-down-only');
      if(!display){display=document.createElement('div');display.className='football-down-only';event.appendChild(display);}
      const next=down?.textContent||'DOWN & DISTANCE';
      if(display.textContent!==next)display.textContent=next;
      const surface=story.querySelector('.story-live-body');
      if(surface){
        surface.querySelectorAll(':scope > .football-goalpost').forEach(n=>n.remove());
        const field=surface.querySelector('.football-field');
        if(field){
          field.querySelectorAll('.football-goalpost').forEach(n=>n.remove());
          ['left','right'].forEach(side=>{
            const post=document.createElement('div');
            post.className='football-goalpost football-goalpost-external '+side;
            post.innerHTML=postSVG;surface.appendChild(post);
          });
        }
      }
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
