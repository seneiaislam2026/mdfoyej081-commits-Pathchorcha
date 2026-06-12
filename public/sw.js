self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Simple pass-through fetch to satisfy PWA install requirements
  e.respondWith(
    fetch(e.request).catch(
      () => new Response('You are offline.', { status: 503, statusText: 'Service Unavailable' })
    )
  );
});
