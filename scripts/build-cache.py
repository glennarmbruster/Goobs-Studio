from pathlib import Path
import json
root = Path(__file__).resolve().parents[1] / 'dist'
version = 'goobs-studio-v5'
paths = ['./'] + ['./'+str(p.relative_to(root)) for p in sorted(root.rglob('*')) if p.is_file() and p.name != 'sw.js']
script = 'const CACHE='+json.dumps(version)+';\nconst FILES='+json.dumps(paths)+';\n'
script += '''self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(CACHE);await cache.addAll(FILES);await cache.put(new URL('./__offline-ready',self.registration.scope),new Response('ready'));await self.skipWaiting()}catch(e){await caches.delete(CACHE);throw e}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('goobs-studio-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith((async()=>{const hit=await caches.match(event.request);if(hit)return hit;try{return await fetch(event.request)}catch(e){if(event.request.mode==='navigate')return await caches.match(new URL('./index.html',self.registration.scope));throw e}})())});
'''
(root/'sw.js').write_text(script)
print('Cached assets:', len(paths))
