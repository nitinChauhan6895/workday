// Minimal offline-friendly service worker for MyDay.
// Strategy: cache-first ONLY for truly-immutable build assets; network-first
// (with cache fallback) for everything else. We deliberately never cache
// Next.js App Router RSC/data requests — caching those makes freshly added
// rows "vanish" until a full reload (sibling-app gotcha).

const CACHE = "workday-v1";
const APP_SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

function isImmutableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|ttf)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin GETs; let auth/API/RSC calls pass straight through.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache RSC / router data requests.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") return;

  // Cache-first for immutable assets.
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            return response;
          }),
      ),
    );
    return;
  }

  // Network-first for navigations/pages; fall back to cache, then app shell.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});
