// T-Cubed offline support: network-first pages, cached static assets.
const VERSION = "tcubed-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;
  if (request.mode === "navigate") {
    e.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }
  e.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
      )
    )
  );
});
