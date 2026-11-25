/* KMS-CRM service worker: offline-first (cache, refresh in background) */
const V = 'kms-crm-v4.7', CORE = ['./', './index.html', './manifest.json', './icon.png']
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()))
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', e => {
  const r = e.request
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => {
    const net = fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)) } return res }).catch(() => null)
    if (hit) { e.waitUntil(net); return hit }
    return net.then(res => res || (r.mode === 'navigate' ? caches.match('./index.html').then(x => x || caches.match('./')) : Response.error()))
  }))
})
