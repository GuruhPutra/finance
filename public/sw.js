const CACHE_NAME = "financeos-v1";
const STATIC_ASSETS = [
  "/finance/",
  "/finance/index.html",
  "/finance/manifest.json",
  "/finance/icon-192.png",
  "/finance/icon-512.png",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Firebase/external requests
  if (request.method !== "GET") return;
  if (url.hostname.includes("firebase") || url.hostname.includes("google")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache fresh responses
        if (response && response.status === 200 && response.type === "basic") {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(
          (cached) => cached || caches.match("/finance/index.html")
        );
      })
  );
});
