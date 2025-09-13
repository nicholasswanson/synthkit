import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { ScenarioPack } from '@synthkit/sdk';
import { ConfigLoader } from './config-loader';

export interface PackInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  path: string;
  pack: ScenarioPack;
}

export class PackLoader {
  private static instance: PackLoader;
  private loadedPacks: Map<string, PackInfo> = new Map();
  private configLoader: ConfigLoader;

  constructor() {
    this.configLoader = ConfigLoader.getInstance();
  }

  static getInstance(): PackLoader {
    if (!PackLoader.instance) {
      PackLoader.instance = new PackLoader();
    }
    return PackLoader.instance;
  }

  /**
   * Load all packs specified in the config
   */
  async loadConfiguredPacks(): Promise<Map<string, PackInfo>> {
    const config = this.configLoader.getConfig();
    const projectRoot = this.configLoader.getProjectRoot();
    
    this.loadedPacks.clear();

    for (const packPath of config.packs) {
      try {
        const packInfo = await this.loadPack(packPath, projectRoot);
        this.loadedPacks.set(packInfo.id, packInfo);
      } catch (error) {
        console.warn(`Warning: Failed to load pack "${packPath}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return this.loadedPacks;
  }

  /**
   * Load a specific pack by path
   */
  async loadPack(packPath: string, projectRoot?: string): Promise<PackInfo> {
    const root = projectRoot || this.configLoader.getProjectRoot();
    const fullPath = this.resolvePath(packPath, root);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`Pack directory not found: ${fullPath}`);
    }

    const packJsonPath = path.join(fullPath, 'pack.json');
    if (!await fs.pathExists(packJsonPath)) {
      throw new Error(`pack.json not found in: ${fullPath}`);
    }

    try {
      const packData = await fs.readJSON(packJsonPath);
      const pack = this.validatePack(packData);
      
      return {
        id: pack.id,
        name: pack.name,
        description: pack.description || '',
        version: pack.version,
        path: fullPath,
        pack
      };
    } catch (error) {
      throw new Error(`Invalid pack.json in ${fullPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Discover all available packs in the project
   */
  async discoverPacks(searchPaths?: string[]): Promise<PackInfo[]> {
    const projectRoot = this.configLoader.getProjectRoot();
    const paths = searchPaths || [
      'packs/*',
      'node_modules/@synthkit/pack-*',
      '../packs/*' // For monorepo development
    ];

    const discovered: PackInfo[] = [];

    for (const searchPath of paths) {
      try {
        const fullSearchPath = path.resolve(projectRoot, searchPath);
        const packDirs = await glob(fullSearchPath);

        for (const packDir of packDirs) {
          try {
            const packInfo = await this.loadPack(packDir);
            discovered.push(packInfo);
          } catch (error) {
            // Silently skip invalid packs during discovery
          }
        }
      } catch (error) {
        // Silently skip failed search paths
      }
    }

    return discovered;
  }

  /**
   * Get a loaded pack by ID
   */
  getPack(packId: string): PackInfo | undefined {
    return this.loadedPacks.get(packId);
  }

  /**
   * Get all loaded packs
   */
  getAllPacks(): PackInfo[] {
    return Array.from(this.loadedPacks.values());
  }

  /**
   * Get all business categories from loaded packs
   */
  getBusinessCategories(): Array<{ id: string; name: string; description: string }> {
    const categories: Array<{ id: string; name: string; description: string }> = [];
    
    for (const packInfo of this.loadedPacks.values()) {
      categories.push({
        id: packInfo.id,
        name: packInfo.name,
        description: packInfo.description
      });
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all schemas from a specific pack
   */
  getPackSchemas(packId: string): Record<string, any> | undefined {
    const pack = this.getPack(packId);
    return pack?.pack.schemas;
  }

  /**
   * Get all scenarios from a specific pack
   */
  getPackScenarios(packId: string): Record<string, any> | undefined {
    const pack = this.getPack(packId);
    return pack?.pack.scenarios;
  }

  /**
   * Get all personas/roles from a specific pack
   */
  getPackPersonas(packId: string): Record<string, any> | undefined {
    const pack = this.getPack(packId);
    return pack?.pack.personas;
  }

  /**
   * Validate pack structure from file path
   */
  async validatePackFromPath(packPath: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const packInfo = await this.loadPack(packPath);
      const pack = packInfo.pack;

      // Validate required fields
      if (!pack.id) errors.push('Missing required field: id');
      if (!pack.name) errors.push('Missing required field: name');
      if (!pack.version) errors.push('Missing required field: version');

      // Validate schemas
      if (!pack.schemas || typeof pack.schemas !== 'object') {
        errors.push('Missing or invalid schemas object');
      } else {
        for (const [schemaName, schema] of Object.entries(pack.schemas)) {
          if (!schema || typeof schema !== 'object') {
            errors.push(`Invalid schema: ${schemaName}`);
          }
        }
      }

      // Validate scenarios
      if (pack.scenarios) {
        for (const [scenarioName, scenario] of Object.entries(pack.scenarios)) {
          if (!scenario || typeof scenario !== 'object') {
            errors.push(`Invalid scenario: ${scenarioName}`);
          }
        }
      }

      // Validate personas
      if (pack.personas) {
        for (const [personaName, persona] of Object.entries(pack.personas)) {
          if (!persona || typeof persona !== 'object') {
            errors.push(`Invalid persona: ${personaName}`);
          }
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Failed to load pack: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors };
    }
  }

  /**
   * Resolve pack path relative to project root
   */
  private resolvePath(packPath: string, projectRoot: string): string {
    if (path.isAbsolute(packPath)) {
      return packPath;
    }

    // Try relative to project root first
    const relativePath = path.resolve(projectRoot, packPath);
    if (fs.existsSync(relativePath)) {
      return relativePath;
    }

    // Try as node_modules package
    const nodeModulesPath = path.resolve(projectRoot, 'node_modules', packPath);
    if (fs.existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }

    // Return the relative path (will fail later if not found)
    return relativePath;
  }

  /**
   * Validate pack data structure
   */
  private validatePack(packData: any): ScenarioPack {
    if (!packData || typeof packData !== 'object') {
      throw new Error('Pack data must be a valid JSON object');
    }

    const requiredFields = ['id', 'name', 'version'];
    for (const field of requiredFields) {
      if (!packData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure schemas exist
    if (!packData.schemas || typeof packData.schemas !== 'object') {
      throw new Error('Pack must have a schemas object');
    }

    return packData as ScenarioPack;
  }
}

/**
 * Convenience function to get pack loader instance
 */
export function getPackLoader(): PackLoader {
  return PackLoader.getInstance();
}
