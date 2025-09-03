/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@synthkit/client', '@synthkit/sdk'],
  
  // Enable experimental features if needed
  experimental: {},
  
  // Webpack configuration for MSW
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure MSW can intercept fetch requests
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
      
      // Ignore node-specific modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'msw/node': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
