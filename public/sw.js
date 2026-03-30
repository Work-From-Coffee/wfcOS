const STATIC_CACHE = "wfcos-static-v4";
const RUNTIME_CACHE = "wfcos-runtime-v4";

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/lib/timerWorker.js",
  "/metadata/wfc-og.png",
  "/metadata/wfcos.png",
  "/icons/ambience.png",
  "/icons/board.png",
  "/icons/bookmark.png",
  "/icons/cafe.png",
  "/icons/camera.png",
  "/icons/clock.png",
  "/icons/coffee.png",
  "/icons/default.png",
  "/icons/music.png",
  "/icons/news.png",
  "/icons/notepad.png",
  "/icons/phone.png",
  "/icons/settings.png",
  "/icons/tips.png",
  "/icons/volume.png",
  "/icons/wallpaper.png",
  "/background/bg-1.webp",
  "/background/bg-2.webp",
  "/background/bg-3.webp",
  "/background/bg-4.webp",
  "/background/bg-5.webp",
  "/background/bg-6.webp",
  "/background/bg-7.webp",
  "/background/bg-8.webp",
  "/background/bg-9.webp",
  "/background/bg-10.webp",
  "/background/bg-11.webp",
  "/background/bg-12.webp",
  "/background/bg-13.webp",
  "/background/bg-14.webp",
  "/background/bg-15.webp",
  "/background/bg-16.webp",
  "/background/bg-17.webp",
  "/sounds/ambience/cafe.mp3",
  "/sounds/ambience/fireplace.mp3",
  "/sounds/ambience/forest.mp3",
  "/sounds/ambience/making-a-coffee-latte.mp3",
  "/sounds/ambience/night.mp3",
  "/sounds/ambience/ocean.mp3",
  "/sounds/ambience/park.mp3",
  "/sounds/ambience/rain.mp3",
  "/sounds/ambience/river.mp3",
  "/sounds/ambience/thunder.mp3",
  "/sounds/click.mp3",
  "/sounds/close.mp3",
  "/sounds/keyboard.mp3",
  "/sounds/loading.mp3",
  "/sounds/minimize.mp3",
  "/sounds/open.mp3",
  "/sounds/timeup.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      // Be resilient: if a single asset is missing/404, `cache.addAll` would
      // reject and prevent the SW from installing. Offline support should
      // still work for the assets that actually exist.
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          const response = await fetch(url, { cache: "no-store" });
          if (!response || !response.ok) return;
          await cache.put(url, response);
        })
      );
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

const isSameOrigin = (url) => url.origin === self.location.origin;
const isAppAsset = (pathname) =>
  pathname.startsWith("/icons/") ||
  pathname.startsWith("/background/") ||
  pathname.startsWith("/sounds/") ||
  pathname.startsWith("/metadata/") ||
  pathname.startsWith("/lib/") ||
  pathname.startsWith("/_next/static/");

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (!isSameOrigin(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            Response.error()
          );
        })
    );
    return;
  }

  if (isAppAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => cachedResponse || Response.error());

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    })
  );
});
