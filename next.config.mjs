/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
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
