const CACHE_NAME = "jee-planner-v5";
const STATIC_ASSETS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests (our app shell)
  if (url.origin !== self.location.origin) return;

  // API requests: let the network handle it (sync-fetch will manage offline)
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached, but update in background
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => null);
        
        return cached;
      }

      // Not cached, try network
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Network failed and not cached - return offline page if available
        if (request.destination === "document") {
          return caches.match("/index.html").catch(() => new Response("Offline", { status: 503 }));
        }
        throw new TypeError("Failed to fetch");
      });
    })
  );
});
