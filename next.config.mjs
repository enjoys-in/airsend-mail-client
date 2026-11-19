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
