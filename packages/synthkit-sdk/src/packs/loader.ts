import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import type { ScenarioPack } from '../types';

export interface PackLoaderOptions {
  /**
   * Base directory to search for packs
   * Defaults to process.cwd()
   */
  basePath?: string;
  
  /**
   * Whether to validate pack schemas
   * Defaults to true
   */
  validate?: boolean;
}

/**
 * Load a single pack from a directory or package name
 */
export async function loadPack(packPath: string, options: PackLoaderOptions = {}): Promise<ScenarioPack> {
  const { basePath = process.cwd(), validate = true } = options;
  
  let packFile: string;
  
  // Check if it's a relative path to a local pack
  if (packPath.startsWith('./') || packPath.startsWith('../')) {
    packFile = resolve(basePath, packPath, 'pack.json');
  }
  // Check if it's in the packs directory
  else if (existsSync(join(basePath, 'packs', packPath, 'pack.json'))) {
    packFile = join(basePath, 'packs', packPath, 'pack.json');
  }
  // Try to resolve as a node module
  else {
    try {
      packFile = require.resolve(`${packPath}/pack.json`, { paths: [basePath] });
    } catch {
      throw new Error(`Could not find pack: ${packPath}`);
    }
  }
  
  try {
    const content = await readFile(packFile, 'utf-8');
    const pack = JSON.parse(content) as ScenarioPack;
    
    if (validate) {
      validatePack(pack);
    }
    
    return pack;
  } catch (error) {
    throw new Error(`Failed to load pack from ${packFile}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load multiple packs
 */
export async function loadPacks(
  packPaths: string[], 
  options: PackLoaderOptions = {}
): Promise<ScenarioPack[]> {
  const packs = await Promise.all(
    packPaths.map(path => loadPack(path, options))
  );
  
  // Check for duplicate pack IDs
  const seenIds = new Set<string>();
  for (const pack of packs) {
    if (seenIds.has(pack.id)) {
      throw new Error(`Duplicate pack ID found: ${pack.id}`);
    }
    seenIds.add(pack.id);
  }
  
  return packs;
}

/**
 * Validate a pack structure
 */
function validatePack(pack: any): asserts pack is ScenarioPack {
  if (!pack || typeof pack !== 'object') {
    throw new Error('Pack must be an object');
  }
  
  // Required fields
  const required = ['id', 'name', 'description', 'version', 'schemas'];
  for (const field of required) {
    if (!(field in pack)) {
      throw new Error(`Pack missing required field: ${field}`);
    }
  }
  
  // Validate types
  if (typeof pack.id !== 'string' || !pack.id) {
    throw new Error('Pack ID must be a non-empty string');
  }
  
  if (typeof pack.schemas !== 'object' || !pack.schemas) {
    throw new Error('Pack schemas must be an object');
  }
  
  // Validate each schema is a valid JSON Schema
  for (const [name, schema] of Object.entries(pack.schemas)) {
    if (!schema || typeof schema !== 'object') {
      throw new Error(`Schema "${name}" must be an object`);
    }
    // Basic JSON Schema validation - just check it has a type
    if (!('type' in schema) && !('$ref' in schema) && !('allOf' in schema) && !('anyOf' in schema) && !('oneOf' in schema)) {
      throw new Error(`Schema "${name}" must have a type or composition keyword`);
    }
  }
  
  // Validate scenarios if present
  if ('scenarios' in pack && pack.scenarios) {
    if (typeof pack.scenarios !== 'object') {
      throw new Error('Pack scenarios must be an object');
    }
    
    for (const [name, scenario] of Object.entries(pack.scenarios)) {
      if (!scenario || typeof scenario !== 'object') {
        throw new Error(`Scenario "${name}" must be an object`);
      }
      if (!('id' in scenario) || !('name' in scenario)) {
        throw new Error(`Scenario "${name}" must have id and name`);
      }
    }
  }
  
  // Validate personas if present
  if ('personas' in pack && pack.personas) {
    if (typeof pack.personas !== 'object') {
      throw new Error('Pack personas must be an object');
    }
    
    for (const [name, persona] of Object.entries(pack.personas)) {
      if (!persona || typeof persona !== 'object') {
        throw new Error(`Persona "${name}" must be an object`);
      }
      if (!('id' in persona) || !('name' in persona)) {
        throw new Error(`Persona "${name}" must have id and name`);
      }
    }
  }
}