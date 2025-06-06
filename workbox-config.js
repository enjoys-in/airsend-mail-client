// workbox-config.js
module.exports = {
  globDirectory: "public/",
  globPatterns: ["**/*.{html,css,png,jpg,jpeg,svg,gif,woff2,json,ico,txt,mp3}"],
  swDest: "public/worker.js",
  cacheId: "airsend-app-cache-v1",
  clientsClaim: true,
  skipWaiting: true,

  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "CacheFirst",
      options: {
        cacheName: "pages-cache",
      },
    },
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg)$/,

      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "assets-cache",
      },
    },
    {
      urlPattern: /^https:\/\/airsend\.in\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache-v1",
        expiration: {
          maxAgeSeconds: 60 * 10,
        },
      },
    },
  ],
};
