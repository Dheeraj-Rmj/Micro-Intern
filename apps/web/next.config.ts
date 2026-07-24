import type { NextConfig } from 'next';

/**
 * Next.js configuration.
 *
 * Design decisions:
 * - Turbopack in dev (pnpm dev --turbopack): 10x faster HMR
 * - Strict mode on: catches double-invocation issues early
 * - Bundle analyzer: enable with ANALYZE=true pnpm build
 * - Image domains: add CDN domain and MinIO endpoint
 * - Security headers: applied via Nginx in production (nginx.conf)
 */
const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Transpile workspace packages (TypeScript source, not compiled)
  transpilePackages: ['@microintern/shared'],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatars
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub OAuth avatars
        pathname: '/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // React compiler (React 19)
    // reactCompiler: true,
    // ppr: true,
  },

  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };
    return config;
  },

  // Environment variables exposed to browser
  // (prefer NEXT_PUBLIC_ prefix for clarity)
  env: {
    NEXT_PUBLIC_APP_NAME: 'MicroIntern',
    NEXT_PUBLIC_APP_VERSION: process.env['npm_package_version'] ?? '0.1.0',
  },
};

export default config;
