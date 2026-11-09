/* Cache this isolated preview and its exact approved assets after a successful visit. */
const CACHE='mancave-rotation-20261109-v1';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./runtime.js','./live.html','./live-app.js','./live-bridge.js','./final.html','./final-bridge.js','./ranks.js','./rank.css','../rotation/approved-policy.js','../rotation/engine.js']))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||event.request.url.includes('api.espn.com'))return;event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(c=>c.put(event.request,response.clone())).catch(()=>{});return response;}).catch(()=>caches.match(event.request)));});
