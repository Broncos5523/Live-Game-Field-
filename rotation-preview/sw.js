/* Isolated preview cache. ESPN game responses remain subject to verification in the data store. */
const CACHE='mancave-rotation-20261109-v2';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./runtime.js','./live.html','./live-app.js','./live-bridge.js','./final.html','./final-bridge.js','./spotlight.js','./ranks.js','./rank.css','../rotation/approved-policy.js','../rotation/engine.js'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.url.includes('api.espn.com'))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(event.request);
   if(response.ok||response.type==='opaque'){try{await cache.put(event.request,response.clone());}catch{/* Storage pressure never discards a usable network response. */}}
   return response;
  }catch{return await cache.match(event.request)||await caches.match(event.request)||Response.error();}
 })());
});
