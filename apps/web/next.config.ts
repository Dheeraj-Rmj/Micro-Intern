import type { NextConfig } from 'next';
import path from 'path';

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https: http:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

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
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default config;
