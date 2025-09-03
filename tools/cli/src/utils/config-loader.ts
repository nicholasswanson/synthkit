import fs from 'fs-extra';
import path from 'path';
import { SynthConfig } from '@synthkit/sdk';

export interface CLIConfig extends SynthConfig {
  name?: string;
  framework?: string;
  version?: string;
}

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: CLIConfig | null = null;
  private configPath: string | null = null;

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Find and load synth.config.json from current directory or parent directories
   */
  async loadConfig(startDir: string = process.cwd()): Promise<CLIConfig> {
    if (this.config && this.configPath) {
      return this.config;
    }

    const configPath = await this.findConfigFile(startDir);
    if (!configPath) {
      throw new Error(
        'No synth.config.json found. Run "synthkit init" to create a new project.'
      );
    }

    try {
      const configContent = await fs.readJSON(configPath);
      this.config = this.validateAndNormalizeConfig(configContent);
      this.configPath = configPath;
      return this.config;
    } catch (error) {
      throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
    }
  }

  /**
   * Get the current config without loading (throws if not loaded)
   */
  getConfig(): CLIConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  /**
   * Get the config file path
   */
  getConfigPath(): string {
    if (!this.configPath) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.configPath;
  }

  /**
   * Get the project root directory (where synth.config.json is located)
   */
  getProjectRoot(): string {
    const configPath = this.getConfigPath();
    return path.dirname(configPath);
  }

  /**
   * Save config changes back to file
   */
  async saveConfig(config: CLIConfig): Promise<void> {
    if (!this.configPath) {
      throw new Error('No config file path available');
    }

    await fs.writeJSON(this.configPath, config, { spaces: 2 });
    this.config = config;
  }

  /**
   * Reload config from file
   */
  async reloadConfig(): Promise<CLIConfig> {
    this.config = null;
    this.configPath = null;
    return this.loadConfig();
  }

  /**
   * Find synth.config.json by walking up directory tree
   */
  private async findConfigFile(startDir: string): Promise<string | null> {
    let currentDir = path.resolve(startDir);
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const configPath = path.join(currentDir, 'synth.config.json');
      
      if (await fs.pathExists(configPath)) {
        return configPath;
      }

      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  /**
   * Validate and normalize config structure
   */
  private validateAndNormalizeConfig(config: any): CLIConfig {
    if (!config || typeof config !== 'object') {
      throw new Error('Config must be a valid JSON object');
    }

    // Set defaults for missing properties
    const normalizedConfig: CLIConfig = {
      name: config.name || 'synthkit-project',
      framework: config.framework || 'vanilla',
      version: config.version || '1.0.0',
      packs: config.packs || [],
      scenarios: config.scenarios || {
        default: 'development'
      },
      generators: {
        id: config.generators?.id || 12345,
        locale: config.generators?.locale || 'en-US',
        timeZone: config.generators?.timeZone || 'UTC',
        ...config.generators
      },
      msw: {
        enabled: config.msw?.enabled ?? true,
        delay: config.msw?.delay || 100,
        ...config.msw
      }
    };

    // Validate required fields
    if (!Array.isArray(normalizedConfig.packs)) {
      throw new Error('Config "packs" must be an array');
    }

    if (!normalizedConfig.scenarios || typeof normalizedConfig.scenarios !== 'object') {
      throw new Error('Config "scenarios" must be an object');
    }

    return normalizedConfig;
  }

  /**
   * Create a default config structure
   */
  static createDefaultConfig(options: {
    name?: string;
    framework?: string;
    packs?: string[];
  } = {}): CLIConfig {
    return {
      name: options.name || 'synthkit-project',
      framework: options.framework || 'vanilla',
      version: '1.0.0',
      packs: options.packs || ['core'],
      scenarios: {
        default: 'development'
      },
      generators: {
        id: 12345,
        locale: 'en-US',
        timeZone: 'UTC'
      },
      msw: {
        enabled: true,
        delay: 100
      }
    };
  }
}

/**
 * Convenience function to get loaded config
 */
export async function loadConfig(startDir?: string): Promise<CLIConfig> {
  const loader = ConfigLoader.getInstance();
  return loader.loadConfig(startDir);
}

/**
 * Convenience function to get current config
 */
export function getConfig(): CLIConfig {
  const loader = ConfigLoader.getInstance();
  return loader.getConfig();
}
