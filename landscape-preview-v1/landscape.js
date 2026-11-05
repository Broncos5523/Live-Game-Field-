/* Synchronize existing V5 venue selection with a full-screen landscape background. */
(function(){
 function sync(){
  var dashboard=document.querySelector('.dashboard');if(!dashboard)return;
  var bg=dashboard.querySelector('.landscape-venue');
  if(!bg){bg=document.createElement('div');bg.className='landscape-venue';dashboard.insertBefore(bg,dashboard.firstChild);}
  var original=dashboard.querySelector('.venue-backdrop');
  if(original){var src=original.currentSrc||original.src;if(src && bg.dataset.src!==src){bg.dataset.src=src;bg.innerHTML='';var img=document.createElement('img');img.alt='';img.src=src;bg.appendChild(img);}}
 }
 var timer=setInterval(sync,900);document.addEventListener('visibilitychange',sync);sync();
})();
