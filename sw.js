// Scanline offline cache. Bump VERSION by rebuilding.
const VERSION = 'scanline-202611030714';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const cdn = /(fonts.googleapis.com|fonts.gstatic.com|cdnjs.cloudflare.com)$/.test(u.hostname);
  if (u.origin !== location.origin && !cdn) return;
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: u.origin === location.origin });
    const net = fetch(e.request).then((r) => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
