import { faker } from '@faker-js/faker';
import type { ScenarioContext } from '../types';

export function withSeed<T>(seed: number, fn: () => T): T {
  const previousSeed = faker.seed();
  faker.seed(seed);
  const result = fn();
  faker.seed(previousSeed);
  return result;
}

export function createSeededFaker(context?: ScenarioContext): typeof faker {
  const seededFaker = faker;
  
  if (context?.seed !== undefined) {
    seededFaker.seed(context.seed);
  }
  
  // Note: Locale setting is handled at faker initialization, not runtime
  
  return seededFaker;
}

export function pickRandom<T>(array: T[], seed?: number): T {
  if (seed !== undefined) {
    return withSeed(seed, () => faker.helpers.arrayElement(array));
  }
  return faker.helpers.arrayElement(array);
}

export function pickMultiple<T>(array: T[], count: number, seed?: number): T[] {
  if (seed !== undefined) {
    return withSeed(seed, () => faker.helpers.arrayElements(array, count));
  }
  return faker.helpers.arrayElements(array, count);
}
