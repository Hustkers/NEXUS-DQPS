import type { NextConfig } from 'next';
import path from 'path';
import { createRequire } from 'node:module';

let rawLoader = 'raw-loader';
try {
  const require = createRequire(import.meta.url);
  rawLoader = require.resolve('raw-loader');
} catch {
  // raw-loader not found directly, fallback to name
}

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  },
  turbopack: {
    root: path.resolve(__dirname, '..'),
    rules: {
      '*.html': {
        loaders: [rawLoader],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      type: 'asset/source',
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/dashboard/ad-playground',
        destination: '/dashboard/playground'
      }
    ];
  }
};

export default nextConfig;

