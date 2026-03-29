// TradeBrief Service Worker
const CACHE_NAME = 'tradebrief-v4';
const ASSETS = [
  '/tradebrief/',
  '/tradebrief/index.html',
  '/tradebrief/manifest.json'
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', e => {
  // Only handle same-origin requests
  if(!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {title:'TradeBrief',body:'Check your positions'};
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/tradebrief/icon-192.png',
      badge: '/tradebrief/icon-192.png',
      vibrate: [200, 100, 200]
    })
  );
});
