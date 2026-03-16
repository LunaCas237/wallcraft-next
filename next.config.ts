import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // This can help speed up builds by ignoring minor type errors during the build process
    // and letting your IDE handle them instead.
    ignoreBuildErrors: false, 
  },
  experimental: {
    // Reducing the number of worker threads can stop the "Heap out of memory" crash
    // if your computer is trying to do too much at once.
    cpus: 4, 
  },
  // Ensure we aren't generating massive source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;