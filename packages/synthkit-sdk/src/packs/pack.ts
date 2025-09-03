import type { ScenarioPack, Generator, Scenario } from '../types';

export function createPack(options: {
  id: string;
  name: string;
  description: string;
  version: string;
  generators?: Record<string, Generator<any>>;
  scenarios?: Record<string, Scenario>;
}): ScenarioPack {
  return {
    id: options.id,
    name: options.name,
    description: options.description,
    version: options.version,
    generators: options.generators || {},
    scenarios: options.scenarios || {},
  };
}
