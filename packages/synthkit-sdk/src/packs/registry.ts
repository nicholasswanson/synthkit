import type { ScenarioPack, Generator, Scenario } from '../types';

export class PackRegistry {
  private packs = new Map<string, ScenarioPack>();
  private generators = new Map<string, Generator<any>>();
  private scenarios = new Map<string, Scenario>();

  register(pack: ScenarioPack): void {
    if (this.packs.has(pack.id)) {
      throw new Error(`Pack '${pack.id}' is already registered`);
    }

    this.packs.set(pack.id, pack);

    // Register generators with namespaced keys
    for (const [name, generator] of Object.entries(pack.generators)) {
      const key = `${pack.id}:${name}`;
      this.generators.set(key, generator);
    }

    // Register scenarios with namespaced keys
    for (const [name, scenario] of Object.entries(pack.scenarios)) {
      const key = `${pack.id}:${name}`;
      this.scenarios.set(key, scenario);
    }
  }

  unregister(packId: string): void {
    const pack = this.packs.get(packId);
    if (!pack) return;

    // Remove generators
    for (const name of Object.keys(pack.generators)) {
      this.generators.delete(`${packId}:${name}`);
    }

    // Remove scenarios
    for (const name of Object.keys(pack.scenarios)) {
      this.scenarios.delete(`${packId}:${name}`);
    }

    this.packs.delete(packId);
  }

  getPack(packId: string): ScenarioPack | undefined {
    return this.packs.get(packId);
  }

  getGenerator(key: string): Generator<any> | undefined {
    return this.generators.get(key);
  }

  getScenario(key: string): Scenario | undefined {
    return this.scenarios.get(key);
  }

  listPacks(): ScenarioPack[] {
    return Array.from(this.packs.values());
  }

  listGenerators(): Array<{ pack: string; name: string; generator: Generator<any> }> {
    const results: Array<{ pack: string; name: string; generator: Generator<any> }> = [];
    
    for (const [key, generator] of this.generators.entries()) {
      const [pack, name] = key.split(':');
      results.push({ pack, name, generator });
    }
    
    return results;
  }

  listScenarios(): Array<{ pack: string; name: string; scenario: Scenario }> {
    const results: Array<{ pack: string; name: string; scenario: Scenario }> = [];
    
    for (const [key, scenario] of this.scenarios.entries()) {
      const [pack, name] = key.split(':');
      results.push({ pack, name, scenario });
    }
    
    return results;
  }
}
