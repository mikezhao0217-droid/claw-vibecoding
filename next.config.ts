import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
    // Enable Turbopack explicitly to avoid conflicts
    turbopack: {},
  },
  // Only include webpack config if specifically needed
  // For our project, we can remove it since Turbopack is the default
};

export default nextConfig;