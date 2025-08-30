/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],

    remotePatterns: [
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
