import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { configSchema } from './schema';
import type { SynthConfig } from '../types';

export async function loadConfig(configPath?: string): Promise<SynthConfig> {
  const paths = configPath 
    ? [configPath]
    : ['synth.config.json', 'synth.config.js', '.synthrc.json'];

  for (const p of paths) {
    try {
      const fullPath = path.resolve(process.cwd(), p);
      
      if (p.endsWith('.js')) {
        const module = await import(fullPath);
        return validateConfig(module.default || module);
      } else {
        const content = await fs.readFile(fullPath, 'utf-8');
        return validateConfig(JSON.parse(content));
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // Return default config if no config file found
  return validateConfig({});
}

export function validateConfig(config: unknown): SynthConfig {
  return configSchema.parse(config);
}

export function mergeConfigs(base: SynthConfig, override: Partial<SynthConfig>): SynthConfig {
  return {
    ...base,
    ...override,
    scenarios: {
      ...base.scenarios,
      ...override.scenarios,
    },
  };
}
