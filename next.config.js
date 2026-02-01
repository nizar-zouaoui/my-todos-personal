const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["framer-motion", "convex"],
};

module.exports = withPWA({
  sw: "custom-sw.js",
  customWorkerDir: "public",
  dest: "public",
  disable: false,
  workboxOptions: {
    importScripts: ["/service-worker-logic.js"],
  },
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/api\/.*$/,
      handler: "NetworkOnly",
      options: {
        cacheName: "api",
      },
    },
    {
      urlPattern: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "image" ||
        request.destination === "font",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "assets",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 10,
      },
    },
  ],
})(nextConfig);
