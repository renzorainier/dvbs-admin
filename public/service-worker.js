// public/service-worker.js

const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/script.js',
  '/index.html'
];

self.addEventListener('install', event => {
  console.log('Service Worker installing.');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache opened');
      return cache.addAll(urlsToCache).catch(error => {
        console.error('Failed to cache', error);
      });
    }).catch(error => {
      console.error('Failed to open cache', error);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetch event:', event.request.url);

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('Cache hit:', event.request.url);
        return response;
      }

      console.log('Cache miss:', event.request.url);
      return fetch(event.request);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING message from client.');
    self.skipWaiting();
  }
});
