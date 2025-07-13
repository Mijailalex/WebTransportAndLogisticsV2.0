/* ===================================
   PERU LOGISTICS - SERVICE WORKER
   =================================== */

const CACHE_NAME = 'peru-logistics-v1';
const STATIC_CACHE = 'static-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/nosotros.html',
  '/servicios.html',
  '/contacto.html',
  '/assets/css/00-variables.css',
  '/assets/css/01-base.css',
  '/assets/css/02-layout.css',
  '/assets/css/03-components.css',
  '/assets/css/04-navigation.css',
  '/assets/css/05-sections.css',
  '/assets/css/06-animations.css',
  '/assets/css/07-responsive.css',
  '/assets/js/utils.js',
  '/assets/js/navigation.js',
  '/assets/js/animation.js',
  '/assets/js/forms.js',
  '/assets/js/main.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback offline page
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});