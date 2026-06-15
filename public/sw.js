const CACHE_NAME = 'shikkhangon-cache-v8';
const PRE_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// On install, pre-cache core layout resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_RESOURCES).catch(err => {
        console.warn('Pre-cache fail:', err);
      });
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch handler supporting real offline usage
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass non-GET requests, Firebase Auth/Firestore functions, hot module reloading
  if (
    event.request.method !== 'GET' || 
    url.href.includes('googleapis.com/identitytoolkit') || 
    url.href.includes('firestore.googleapis.com') || 
    url.href.includes('securetoken.googleapis.com') ||
    url.href.includes('accounts.google.com') ||
    url.pathname.startsWith('/api/') || 
    url.pathname.includes('hot_reload') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    return;
  }

  // Handle SPA navigation requests (returning index.html shell so React can boot up)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, return the pre-cached base root index page
          return caches.match('/');
        })
    );
    return;
  }

  // Cache-first strategy for static assets, scripts, stylesheets, and local icons
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Validate response status and skip offline error pages before caching
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache the newly fetched asset dynamically
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback placeholder response
        return new Response('Offline resource not found', { status: 404 });
      });
    })
  );
});
