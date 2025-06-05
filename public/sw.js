// public/worker.js

const CACHE_NAME = "airsend-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/fonts/Mona-Sans.woff2",
  "/logo.svg",
  "/hero.png",
  "/image.png",
  "/navbar-logo.png",
  "/navbar-logo-light.png",
  "/demoi.png", 
  "/airsend-logo-light.png", 
  "/squared-bg-element.svg",
  "/squared-bg-light-element.svg",
  "/404.svg",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }
      // Fetch from network and cache the response
      return fetch(event.request).then((response) => {
        if (
          response.status === 200 && // Ensure valid response
          (event.request.url.endsWith(".png") ||
            event.request.url.endsWith(".svg") ||
            event.request.url.endsWith(".mp3") ||
            event.request.url.endsWith(".jpg") ||
            event.request.url.endsWith(".jpeg") ||
            event.request.url.endsWith(".svg") ||
            event.request.url.endsWith(".webp") ||
            event.request.url.endsWith(".mp4") || // Cache videos
            event.request.url.endsWith(".css") ||
            event.request.url.endsWith(".woff2"))
        ) {
          // Clone the response as it can only be consumed once
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
