// Basic service worker for PWA installability
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Claim clients
});

self.addEventListener('fetch', (e) => {
  // Let browser handle fetches normally for now
});
