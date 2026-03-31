const OFFLINE_CACHE_NAME = "wfcos-offline-v1";
const APP_SHELL_PATHS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/lib/timerWorker.js",
];

const canUseCacheStorage = () =>
  typeof window !== "undefined" && "caches" in window;

const cacheRequest = async (cache: Cache, url: string) => {
  const request = new Request(url, { method: "GET" });
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return;
  }

  const response = await fetch(request, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to cache ${url}: ${response.status}`);
  }

  await cache.put(request, response.clone());
};

export const cacheAssetInBackground = async (url: string) => {
  if (!canUseCacheStorage()) {
    return false;
  }

  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    await cacheRequest(cache, url);
    return true;
  } catch (error) {
    console.error(`Error caching asset in background: ${url}`, error);
    return false;
  }
};

const getCurrentPageResourceUrls = () => {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return [];
  }

  const resourceEntries = performance.getEntriesByType(
    "resource"
  ) as PerformanceResourceTiming[];

  return resourceEntries
    .map((entry) => entry.name)
    .filter((entryUrl) => {
      try {
        const url = new URL(entryUrl, window.location.origin);
        return (
          url.origin === window.location.origin &&
          (url.pathname.startsWith("/_next/static/") ||
            url.pathname.startsWith("/icons/") ||
            url.pathname.startsWith("/background/") ||
            url.pathname.startsWith("/sounds/") ||
            url.pathname.startsWith("/lib/"))
        );
      } catch {
        return false;
      }
    });
};

export const cacheCurrentAppShell = async () => {
  if (!canUseCacheStorage() || typeof window === "undefined") {
    return false;
  }

  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const currentPath = window.location.pathname || "/";
  const currentHref = window.location.href;
  const urlsToCache = [
    ...APP_SHELL_PATHS,
    currentPath,
    currentHref,
    ...getCurrentPageResourceUrls(),
  ];
  const uniqueUrls = [...new Set(urlsToCache)];

  const results = await Promise.allSettled(
    uniqueUrls.map((url) => cacheRequest(cache, url))
  );

  return results.every((result) => result.status === "fulfilled");
};

interface DownloadOfflinePackOptions {
  concurrency?: number;
  onProgress?: (completed: number, total: number) => void;
}

interface DownloadOfflinePackResult {
  completed: number;
  failed: string[];
  total: number;
}

export const downloadOfflinePack = async (
  urls: readonly string[],
  options: DownloadOfflinePackOptions = {}
): Promise<DownloadOfflinePackResult> => {
  if (!canUseCacheStorage()) {
    return {
      completed: 0,
      failed: [...urls],
      total: urls.length,
    };
  }

  const concurrency = Math.max(1, options.concurrency ?? 3);
  const pendingUrls = [...urls];
  const failed: string[] = [];
  let completed = 0;

  const cache = await caches.open(OFFLINE_CACHE_NAME);

  const worker = async () => {
    while (pendingUrls.length > 0) {
      const nextUrl = pendingUrls.shift();
      if (!nextUrl) {
        return;
      }

      try {
        await cacheRequest(cache, nextUrl);
      } catch (error) {
        console.error(`Error downloading offline asset: ${nextUrl}`, error);
        failed.push(nextUrl);
      } finally {
        completed += 1;
        options.onProgress?.(completed, urls.length);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, pendingUrls.length || 1) }, () =>
      worker()
    )
  );

  return {
    completed,
    failed,
    total: urls.length,
  };
};

export const areAssetsCached = async (urls: readonly string[]) => {
  if (!canUseCacheStorage()) {
    return false;
  }

  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const matches = await Promise.all(
    urls.map((url) => cache.match(new Request(url, { method: "GET" })))
  );

  return matches.every(Boolean);
};
