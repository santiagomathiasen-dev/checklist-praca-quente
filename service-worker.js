const CACHE_NAME = 'praca-quente-v1';
const URLS_TO_CACHE = [
  '/',
  '/checklist-praca-quente.html',
  '/manifest.json'
];
 
// INSTALL - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        // Se falhar, tudo bem - o app funciona sem cache em algumas situações
        return cache.add(URLS_TO_CACHE[1]).catch(() => true);
      });
    })
  );
  self.skipWaiting();
});
 
// ACTIVATE - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
 
// FETCH - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
 
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return response
      if (response) {
        return response;
      }
 
      return fetch(event.request).then(response => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
 
        // Clone the response
        const responseToCache = response.clone();
 
        // Cache it for future use (but don't cache everything)
        const shouldCache = event.request.url.includes(self.location.origin);
        if (shouldCache) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
 
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/checklist-praca-quente.html');
        }
      });
    })
  );
});
 
// Background sync for photos (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-photos') {
    // Placeholder for future photo sync
  }
});
 
