import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'z-cdn.chatglm.cn',
        pathname: '/image-search-mcp/**',
      },
    ],
  },
};

export default nextConfig;
