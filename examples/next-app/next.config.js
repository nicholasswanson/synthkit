/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@synthkit/client', '@synthkit/sdk'],
  
  // Static export configuration for GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Disable TypeScript checking for build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint checking for build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable experimental features if needed
  experimental: {},
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Ensure MSW can intercept fetch requests in development
      if (dev) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          _http_common: false,
          http: false,
          https: false,
          stream: false,
          zlib: false,
          util: false,
        };
      }
      
      // Ignore node-specific modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'msw/node': false,
      };
      
      // In production, exclude MSW from the bundle
      if (!dev) {
        config.externals = {
          ...config.externals,
          msw: 'msw',
        };
      }
    }
    return config;
  },
  
  // Note: Headers configuration removed for static export compatibility
};

module.exports = nextConfig;
