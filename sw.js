/**
 * @fileoverview NATO Phonetic Generator - Progressive Web App Service Worker
 * ==========================================================================
 * Provides offline caching and network routing strategies for the NATO
 * Phonetic Generator application.
 *
 * Caching Strategies:
 * -------------------
 * Static Assets (HTML, CSS, JS, Favicons, Badges, Google Fonts, Font Awesome):
 * Cache-First with background cache revalidation. Returns cached shell assets
 * instantly for instant load times and offline reliability, whilst updating
 * cache contents in the background when network is reachable.
 *
 * @author Guilherme Marques (https://guinuxbr.com)
 * @license GNU GPLv3
 */

/**
 * Identifier for current service worker cache version.
 * Increment this string (e.g. 'nato-phonetic-v2') when updating shell assets.
 * @constant {string}
 */
const CACHE_NAME = "nato-phonetic-v1";

/**
 * List of static shell assets to pre-cache on service worker installation.
 * @constant {string[]}
 */
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/script.js",
  "./favicon.png",
  "./img/nato_badge.png",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
];

/**
 * Service Worker 'install' event.
 * Pre-caches core shell assets and skips waiting to activate promptly.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

/**
 * Service Worker 'activate' event.
 * Cleans obsolete cache versions and immediately claims control of clients.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Service Worker 'fetch' event.
 * Intercepts HTTP GET requests and applies Cache-First with background revalidation.
 */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for subsequent visits
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {
          // Suppress network errors whilst offline
        });
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
