// Note: Next.js types are optional peer dependencies
type NextConfig = any;

export interface SynthConfig {
  enabled?: boolean;
  packs?: string[];
  defaultScenario?: string;
  defaultPersona?: string;
  defaultStage?: 'development' | 'testing' | 'production';
  defaultSeed?: number;
}

/**
 * Next.js integration helper for Synthkit
 * Automatically configures webpack and MSW for development
 */
export function withSynth(nextConfig: NextConfig = {}, synthConfig: SynthConfig = {}): NextConfig {
  const {
    enabled = process.env.NODE_ENV === 'development',
    packs = [],
    defaultScenario,
    defaultPersona,
    defaultStage = 'development',
    defaultSeed = 12345
  } = synthConfig;

  if (!enabled) {
    return nextConfig;
  }

  return {
    ...nextConfig,
    
    // Ensure client packages are transpiled
    transpilePackages: [
      ...(nextConfig.transpilePackages || []),
      '@synthkit/client',
      '@synthkit/sdk'
    ],

    // Configure webpack for MSW compatibility
    webpack: (config: any, context: any) => {
      const { isServer } = context;

      // Apply existing webpack config if present
      if (nextConfig.webpack) {
        config = nextConfig.webpack(config, context);
      }

      // Client-side MSW configuration
      if (!isServer) {
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

        config.resolve.alias = {
          ...config.resolve.alias,
          'msw/node': false,
        };
      }

      return config;
    },

    // Add environment variables for Synthkit configuration
    env: {
      ...nextConfig.env,
      SYNTHKIT_ENABLED: enabled.toString(),
      SYNTHKIT_PACKS: JSON.stringify(packs),
      SYNTHKIT_DEFAULT_SCENARIO: defaultScenario || '',
      SYNTHKIT_DEFAULT_PERSONA: defaultPersona || '',
      SYNTHKIT_DEFAULT_STAGE: defaultStage,
      SYNTHKIT_DEFAULT_SEED: defaultSeed.toString(),
    },

    // Ensure experimental features are preserved
    experimental: {
      ...nextConfig.experimental,
    }
  };
}

export default withSynth;
