/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@synthkit/client', '@synthkit/sdk'],
  
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
  
  // Security and caching headers
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    // Add CSP only in production
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https:;
          font-src 'self';
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          frame-ancestors 'none';
          upgrade-insecure-requests;
        `.replace(/\s{2,}/g, ' ').trim(),
      });
    }

    return [
      // Apply security headers to all routes
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // MSW service worker specific headers
      {
        source: '/mockServiceWorker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-store' 
              : 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // API routes (no cache by default)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      // Health check endpoints (cache for 10 seconds)
      {
        source: '/api/health/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=10, s-maxage=10',
          },
        ],
      },
      // Static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
