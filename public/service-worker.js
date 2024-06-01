// public/service-worker.js

self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', event => {
  // No caching, simply forwarding requests
  event.respondWith(fetch(event.request));
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING message from client.');
    self.skipWaiting();
  }
});
