import type { NextConfig } from 'next';
import path from 'path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rawLoader = require.resolve('raw-loader');

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
    root: path.resolve(__dirname),
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
  }
};

export default nextConfig;

