const CACHE_NAME = 'norway26-cache-v7';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Heebo:wght@300;400;500;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // איננו רוצים שה-Service worker יתפוס בקשות API למזג אוויר ולשערי חליפין
  // הטיפול בהם נעשה כבר מקומית בקוד ה-JS בעזרת LocalStorage
  if (event.request.url.includes('api.open-meteo.com') || 
      event.request.url.includes('open.er-api.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // אם מצאנו ב-Cache נחזיר משם, אחרת נמשוך מהרשת
        return response || fetch(event.request);
      })
  );
});
