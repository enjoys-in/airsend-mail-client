// workbox-config.js: generates public/worker.js (`npm run cache`, after `next build`).
//
// What this service worker does: it keeps STATIC files in Cache Storage so repeat visits paint without waiting for the network
// (icons, images, fonts, the app stylesheets, Next's hashed bundles, and the background-effects model).
// What it deliberately does NOT do: touch pages (navigations), API calls, auth, uploads or websockets. Those always go to the
// network, so a deploy, a sign-out or a permission change can never be hidden behind a cached copy.
//
// Push notifications live in public/service-worker.js. A scope has exactly one service worker, so this worker imports it
// (`importScripts`) and the app registers only worker.js in production (see src/lib/sw-url.ts).
//
// Rules are matched top to bottom; the first match wins. A match function is serialised into the worker, so it must not
// use anything from this file (only its own arguments: { url, request, sameOrigin }).
const { dependencies } = require("./package.json");

const DAY = 60 * 60 * 24;
// The segmentation wasm/model must match the JS in the bundle: a new package version gets a new cache.
const mediapipe = String(dependencies["@mediapipe/tasks-vision"] || "0").replace(/[^0-9.]/g, "") || "0";

module.exports = {
  globDirectory: "public/",
  swDest: "public/worker.js",
  cacheId: "airsend",
  sourcemap: false,
  clientsClaim: true,
  skipWaiting: true,
  cleanupOutdatedCaches: true,
  // The worker that handles push notifications (and click-to-open).
  importScripts: ["service-worker.js"],

  // Installed up front (small, always needed): brand + favicon + font files. Everything else is cached when first used.
  globPatterns: [
    "fonts/*.woff2",
    "favicon*",
    "apple-touch-icon.png",
    "android-chrome-*.png",
    "site.webmanifest",
    "logo.svg",
    "airsend-logo-*.png",
    "navbar-logo*.png",
    "no-msg-*.svg",
    "email-icons/*.png",
  ],
  maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,

  runtimeCaching: [
    {
      // Next's content-hashed bundles: a new build is a new URL, so a cached copy is always correct.
      urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/_next/static/"),
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 400, maxAgeSeconds: 365 * DAY, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
      },
    },
    {
      // Resized images from next/image: show the cached one, refresh it in the background.
      urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname === "/_next/image",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-image",
        expiration: { maxEntries: 120, maxAgeSeconds: 7 * DAY, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
      },
    },
    {
      // The tasks / files stylesheets are loaded as ?v=<content hash>, so each build is its own entry (old ones are evicted).
      urlPattern: ({ url, sameOrigin }) =>
        sameOrigin && (url.pathname === "/tasks/tasks.css" || url.pathname === "/files/files.css"),
      handler: "CacheFirst",
      options: {
        cacheName: "app-css",
        expiration: { maxEntries: 8, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
      },
    },
    {
      // Background-effects model and wasm (~29 MB): download once, then offline-fast. Versioned by the package, see above.
      urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/meet-effects/"),
      handler: "CacheFirst",
      options: {
        cacheName: `meet-effects-${mediapipe}`,
        expiration: { maxEntries: 20, maxAgeSeconds: 90 * DAY, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) =>
        sameOrigin && (url.pathname.startsWith("/fonts/") || /\.(?:woff2?|ttf|otf)$/i.test(url.pathname)),
      handler: "CacheFirst",
      options: {
        cacheName: "fonts",
        expiration: { maxEntries: 30, maxAgeSeconds: 365 * DAY, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
      },
    },
    {
      // Logos, icons, illustrations, avatars served from this site (not API responses): instant, then refreshed.
      urlPattern: ({ url, request, sameOrigin }) =>
        sameOrigin &&
        !url.pathname.startsWith("/api/") &&
        (request.destination === "image" || /\.(?:png|jpe?g|gif|webp|avif|svg|ico)$/i.test(url.pathname)),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * DAY, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
      },
    },
    {
      // Notification sound. Range requests (what <audio> sends) are served from the cached full file.
      urlPattern: ({ url, sameOrigin }) => sameOrigin && /\.(?:mp3|ogg|wav)$/i.test(url.pathname),
      handler: "CacheFirst",
      options: {
        cacheName: "audio",
        expiration: { maxEntries: 10, maxAgeSeconds: 90 * DAY, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
        rangeRequests: true,
      },
    },
  ],
};
