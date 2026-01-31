import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Reduce memory usage during build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side specific optimizations
    }
    return config;
  },
};

export default nextConfig;