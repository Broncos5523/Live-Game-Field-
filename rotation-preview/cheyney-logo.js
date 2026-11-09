/* User-supplied Cheyney Wolves logo. Only override Cheyney team marks. */
(function(){
'use strict';
const logo='../A06F4D27-EC5C-4F25-AF50-6F59A24D9435.png';
const isCheyney=s=>/\bcheyney\b/i.test(String(s||''));
function apply(){
 const final=document.querySelector('#stage');
 if(final){
  for(const side of ['away','home']){
   const name=document.getElementById(side+'Name');
   if(isCheyney(name?.textContent)){
    for(const id of [side+'Logo',side+'CenterLogo']){
     const img=document.getElementById(id);
     if(img&&img.getAttribute('src')!==logo){img.src=logo;img.hidden=false;}
    }
   }
  }
 }
 // ESPN shortens Cheyney to CHE in ticker rows; use the full on-screen
 // team name as confirmation so unrelated CHE abbreviations stay untouched.
 const cheyneyIsCurrent=!!document.querySelector('.dashboard')&&
   isCheyney(document.querySelector('.dashboard')?.textContent);
 if(cheyneyIsCurrent){
  document.querySelectorAll('.ticker .ticker-team').forEach(node=>{
   const abbreviation=node.querySelector('b')?.textContent?.trim().toUpperCase();
   if(abbreviation!=='CHE')return;
   const holder=node.querySelector('.ticker-logo');
   if(!holder)return;
   // React's image fallback can render a SPAN instead of IMG. Replace it.
   let img=holder.querySelector('img');
   if(!img){
    img=document.createElement('img');
    img.alt='Cheyney Wolves';
    img.dataset.cheyneyLogo='true';
    holder.replaceChildren(img);
   }
   if(!img.src.endsWith('/A06F4D27-EC5C-4F25-AF50-6F59A24D9435.png'))img.src=logo;
  });
 }

 document.querySelectorAll('.ticker-final-team,.ticker-team,.team,.ticker-matchup').forEach(node=>{
  if(!isCheyney(node.textContent)&&!isCheyney(node.querySelector('img')?.alt))return;
  const target=node.classList.contains('ticker-matchup')?null:node;
  if(!target)return;
  target.querySelectorAll('img').forEach(img=>{if(img.getAttribute('src')!==logo)img.src=logo;});
 });
 document.querySelectorAll('img').forEach(img=>{
  if(img.getAttribute('src')===logo)return;
  if(isCheyney(img.alt)||isCheyney(img.closest('.ticker-team,.team')?.textContent))img.src=logo;
 });
}
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','alt']});
apply();
})();