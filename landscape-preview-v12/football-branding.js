/* V12 football-only DOM enhancement; never changes basketball or hockey. */
(() => {
  const names={ARI:'CARDINALS',ATL:'FALCONS',BAL:'RAVENS',BUF:'BILLS',CAR:'PANTHERS',CHI:'BEARS',CIN:'BENGALS',CLE:'BROWNS',DAL:'COWBOYS',DEN:'BRONCOS',DET:'LIONS',GB:'PACKERS',HOU:'TEXANS',IND:'COLTS',JAX:'JAGUARS',KC:'CHIEFS',LV:'RAIDERS',LAC:'CHARGERS',LAR:'RAMS',MIA:'DOLPHINS',MIN:'VIKINGS',NE:'PATRIOTS',NO:'SAINTS',NYG:'GIANTS',NYJ:'JETS',PHI:'EAGLES',PIT:'STEELERS',SEA:'SEAHAWKS',SF:'49ERS',TB:'BUCCANEERS',TEN:'TITANS',WAS:'COMMANDERS'};
  const aliases={WSH:'WAS',LA:'LAR',JAC:'JAX'};
  const postSVG='<svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" aria-hidden="true"><path d="M12 6 L12 64 L88 64 L88 6 M50 64 L50 114" fill="none" stroke="#ffdb28" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8 L14 62 L86 62 L86 8" fill="none" stroke="#fff2a0" stroke-opacity=".7" stroke-width="1.6"/></svg>';
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
      if(surface.querySelectorAll(':scope > .football-goalpost-external').length===2)return;
      ['left','right'].forEach(side=>{
        const post=document.createElement('div');
        post.className='football-goalpost-external '+side;
        post.innerHTML=postSVG;
        surface.appendChild(post);
      });
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
