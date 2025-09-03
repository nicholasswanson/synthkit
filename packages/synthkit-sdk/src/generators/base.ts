import { faker } from '@faker-js/faker';
import type { GeneratorOptions, ScenarioContext } from '../types';

/**
 * @deprecated Use SchemaGenerator instead for JSON Schema-based generation
 */
export abstract class BaseGenerator<T> {
  protected faker: typeof faker;

  constructor(protected context?: ScenarioContext) {
    this.faker = faker;
    this.setupFaker();
  }

  private setupFaker(): void {
    if (this.context?.seed !== undefined) {
      this.faker.seed(this.context.seed);
    }
    // Note: Locale setting is handled at faker initialization, not runtime
  }

  abstract generate(options?: GeneratorOptions<T>): T;

  generateMany(count: number, options?: GeneratorOptions<T>): T[] {
    return Array.from({ length: count }, (_, index) => {
      if (this.context?.seed !== undefined) {
        this.faker.seed(this.context.seed + index);
      }
      return this.generate(options);
    });
  }

  protected applyOverrides(data: T, overrides?: Partial<T>): T {
    if (!overrides) return data;
    return { ...data, ...overrides };
  }
}
