// SmartFlow Service Worker
// Version: 2026-03-29

const CACHE_NAME    = 'smartflow-v3-20260329';
const RUNTIME_CACHE = 'smartflow-runtime-v3';

// Only pre-cache truly static assets (images, fonts)
const PRECACHE_URLS = [
  '/assets/favicon.png'
];

// Install — cache static assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — delete ALL old caches
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

// Fetch strategy:
//   JS / JSON / HTML → network-first (always fresh)
//   Images           → cache-first (fast repeat loads)
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const isScript  = url.match(/\.js(\?|$)/);
  const isData    = url.match(/\.json(\?|$)/);
  const isHtml    = url.match(/\.html(\?|$)/) || url.endsWith('/');
  const isImage   = url.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)(\?|$)/);

  // JS, JSON, HTML → network first, no caching
  if (isScript || isData || isHtml) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Images → cache first, fallback network, then cache result
  if (isImage) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Everything else → network
  event.respondWith(fetch(event.request));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
