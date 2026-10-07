import type { NextConfig } from 'next';
import path from 'path';

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
        loaders: ['raw-loader'],
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

