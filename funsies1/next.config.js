const { withSynth } = require('@synthkit/client');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
};

module.exports = withSynth(nextConfig, {
  enabled: process.env.NODE_ENV === 'development',
  packs: ['core'],
  defaultCategory: 'core',
  msw: {
    enabled: true,
    delay: 100,
  },
});
