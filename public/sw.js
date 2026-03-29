// SmartFlow Service Worker
// Version: 2026-01-17T20:22:47.767Z

const CACHE_NAME = 'smartflow-v1-1768681367768';
const RUNTIME_CACHE = 'smartflow-runtime';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.min.css',
  '/sfs-components.min.css',
  '/sfs-powerhouse.min.css',
  '/sfs-responsive.min.css',
  '/sfs-ultimate.min.css',
  '/app.min.js',
  '/sfs-powerhouse.min.js',
  '/sfs-ultimate.min.js',
  '/assets/hero-bg-1024w.webp',
  '/assets/smartflow-logo-200w.webp',
  '/assets/favicon.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache images and static assets
        if (event.request.url.match(/\.(jpg|jpeg|png|webp|gif|css|js)$/)) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});

// Message event - handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
