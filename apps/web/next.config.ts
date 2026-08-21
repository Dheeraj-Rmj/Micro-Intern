import type { NextConfig } from 'next';
import path from 'path';

const config: NextConfig = {
  reactStrictMode: true,
  // Vercel handles serverless tracing natively, standalone is only for Docker
  ...(process.env['VERCEL'] ? {} : {
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
  // @ts-expect-error - Next.js 16 typing changes
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      }
    ]
  },

  env: {
    NEXT_PUBLIC_APP_NAME: 'MicroIntern',
    NEXT_PUBLIC_APP_VERSION: process.env['npm_package_version'] ?? '0.1.0'
  }
};

export default config;
