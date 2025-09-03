import { synthStore, SchemaGenerator } from '@synthkit/sdk';
import type { ScenarioPack } from '@synthkit/sdk';
import path from 'path';
import fs from 'fs';

export class MCPSynthServer {
  private store: ReturnType<typeof synthStore>;
  private generator: SchemaGenerator;
  private globalSeed?: number;
  private packs: ScenarioPack[] = [];

  constructor() {
    this.store = synthStore;
    this.generator = new SchemaGenerator();
    
    // Load packs from default locations
    this.loadDefaultPacks();
  }

  private async loadDefaultPacks() {
    try {
      // Look for packs in common locations
      const packDirs = [
        path.join(process.cwd(), 'packs'),
        path.join(process.cwd(), '..', '..', 'packs'), // From packages/mcp-synth
        path.join(__dirname, '..', '..', '..', 'packs'), // From dist
      ];

      for (const packDir of packDirs) {
        if (fs.existsSync(packDir)) {
          console.error(`Loading packs from: ${packDir}`);
          
          // Load individual pack directories
          const packSubDirs = fs.readdirSync(packDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

          for (const packName of packSubDirs) {
            try {
              const packPath = path.join(packDir, packName, 'pack.json');
              if (fs.existsSync(packPath)) {
                const packData = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
                this.packs.push(packData as ScenarioPack);
                
                // Register pack with store
                this.store.registerPack(packData as ScenarioPack);
              }
            } catch (error) {
              console.error(`Failed to load pack ${packName}:`, error);
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error('Failed to load default packs:', error);
    }
  }

  async generate(
    generatorKey: string,
    count: number = 1,
    seed?: number,
    overrides?: any
  ): Promise<any[]> {
    const [packId, generatorId] = generatorKey.split(':');
    if (!packId || !generatorId) {
      throw new Error('Generator key must be in format "pack:generator"');
    }

    const pack = this.packs.find(p => p.id === packId);
    if (!pack) {
      throw new Error(`Pack not found: ${packId}`);
    }

    const schema = pack.schemas[generatorId];
    if (!schema) {
      throw new Error(`Generator not found: ${generatorKey}`);
    }

    // Use provided seed, global seed, or random
    const effectiveSeed = seed ?? this.globalSeed ?? Math.floor(Math.random() * 100000);

    const results = [];
    for (let i = 0; i < count; i++) {
      const itemSeed = effectiveSeed + i;
      let generated = this.generator.generate(schema, itemSeed);
      
      // Apply overrides if provided
      if (overrides) {
        generated = { ...generated, ...overrides };
      }

      results.push(generated);
    }

    return results;
  }

  async activateScenario(scenarioKey: string): Promise<void> {
    const [packId, scenarioId] = scenarioKey.split(':');
    if (!packId || !scenarioId) {
      throw new Error('Scenario key must be in format "pack:scenario"');
    }

    const pack = this.packs.find(p => p.id === packId);
    if (!pack) {
      throw new Error(`Pack not found: ${packId}`);
    }

    const scenario = pack.scenarios?.[scenarioId];
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioKey}`);
    }

    // Apply scenario configuration to store (using just scenarioId as expected)
    await this.store.activateScenario(scenarioId);
    
    console.error(`Activated scenario: ${scenarioKey}`);
  }

  async deactivateScenario(scenarioKey: string): Promise<void> {
    const [, scenarioId] = scenarioKey.split(':');
    if (!scenarioId) {
      throw new Error('Scenario key must be in format "pack:scenario"');
    }

    await this.store.deactivateScenario(scenarioId);
    console.error(`Deactivated scenario: ${scenarioKey}`);
  }

  listPacks(): any[] {
    return this.packs.map(pack => ({
      id: pack.id,
      name: pack.name,
      version: pack.version,
      description: pack.description,
      schemas: Object.keys(pack.schemas || {}),
      scenarios: Object.keys(pack.scenarios || {}),
      personas: Object.keys(pack.personas || {}),
    }));
  }

  listGenerators(packFilter?: string): any[] {
    const generators: any[] = [];

    for (const pack of this.packs) {
      if (packFilter && pack.id !== packFilter) continue;

      for (const [schemaId, schema] of Object.entries(pack.schemas || {})) {
        generators.push({
          key: `${pack.id}:${schemaId}`,
          pack: pack.id,
          id: schemaId,
          schema: schema,
          description: (schema as any).description || `Generate ${schemaId} data`,
        });
      }
    }

    return generators;
  }

  listScenarios(packFilter?: string): any[] {
    const scenarios: any[] = [];

    for (const pack of this.packs) {
      if (packFilter && pack.id !== packFilter) continue;

      for (const [scenarioId, scenario] of Object.entries(pack.scenarios || {})) {
        scenarios.push({
          key: `${pack.id}:${scenarioId}`,
          pack: pack.id,
          id: scenarioId,
          name: scenario.name,
          description: scenario.description || '',
          config: scenario.config,
          active: this.store.isScenarioActive(scenarioId),
        });
      }
    }

    return scenarios;
  }

  setSeed(seed: number): void {
    this.globalSeed = seed;
    this.store.setSeed(seed);
    console.error(`Global seed set to: ${seed}`);
  }

  getGlobalSeed(): number | undefined {
    return this.globalSeed;
  }
}