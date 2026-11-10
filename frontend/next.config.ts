import path from 'node:path';
import type { NextConfig } from 'next';

const isDockerBuild = process.env.DOCKER_BUILD === 'true';

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isDockerBuild ? { output: 'standalone' as const } : {}),
  turbopack: {
    root: isDockerBuild ? __dirname : path.resolve(__dirname, '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

