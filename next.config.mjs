import { readFileSync } from "node:fs";

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    // Shown by the tasks app (tasks/_components/version-display.tsx).
    NEXT_PUBLIC_APP_VERSION: version,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  async redirects() {
    return [
      // The tasks app has no page at its root. Redirect on the server instead of letting the
      // client router boot just to bounce to /dashboard. Next matches a trailing slash too.
      {
        source: "/v2/tasks",
        destination: "/v2/tasks/dashboard",
        permanent: false,
      },
    ];
  },
  // Browser caching for the static files in /public. Next serves them with `max-age=0` by default, so every visit re-asks the
  // server for each logo, icon and font (a 304 at best). /_next/static already gets its own immutable header from Next.
  // Deliberately not covered: /tasks/tasks.css and /files/nimbus.css (rebuilt on each deploy, so a long cache could pin old styles).
  async headers() {
    const day = 60 * 60 * 24;
    return [
      {
        // MediaPipe model + wasm for background effects (~29 MB). Same file names across package upgrades, so a week, not "immutable".
        source: "/meet-effects/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${7 * day}` }],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${30 * day}, immutable` }],
      },
      {
        // Logos, icons, illustrations, sounds: a day, then served stale for up to a week while it revalidates in the background.
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|ico|mp3)",
        headers: [{ key: "Cache-Control", value: `public, max-age=${day}, stale-while-revalidate=${7 * day}` }],
      },
    ];
  },
  turbopack: {},
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "bit.ly",
      },
      {
        protocol: "https",
        hostname: "cdn.dribbble.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;
