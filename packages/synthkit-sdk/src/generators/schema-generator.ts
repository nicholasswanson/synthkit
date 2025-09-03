import jsf from 'json-schema-faker';
import type { JSONSchema7 } from 'json-schema';
import type { GeneratorOptions, ScenarioContext } from '../types';

// Configure json-schema-faker options
jsf.option('alwaysFakeOptionals', true);
jsf.option('optionalsProbability', 0.8);
jsf.option('useExamplesValue', true);
jsf.option('useDefaultValue', true);

export interface SchemaGeneratorOptions extends GeneratorOptions<any> {
  schema: JSONSchema7;
}

export class SchemaGenerator {
  private seed: number;
  private seedCounter = 0;

  constructor(private context?: ScenarioContext) {
    this.seed = context?.seed || 12345;
    // Setup seeding immediately for this instance
    this.setupSeeding();
  }

  private setupSeeding(): void {
    // Create a seeded random generator specific to this instance
    const seed = this.seed;
    let counter = 0;
    
    // json-schema-faker uses a random function for seeding
    jsf.option('random', () => {
      // Create a simple seeded random generator
      const x = Math.sin(seed + counter++) * 10000;
      return x - Math.floor(x);
    });
  }

  generate(options: SchemaGeneratorOptions): any {
    // Re-setup seeding for each generation to ensure consistency
    this.setupSeeding();
    
    try {
      const generated = jsf.generate(options.schema);
      return this.applyOverrides(generated, options.overrides);
    } catch (error) {
      console.error('Schema generation failed:', error);
      throw new Error(`Failed to generate data from schema: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  generateMany(count: number, options: SchemaGeneratorOptions): any[] {
    return Array.from({ length: count }, (_, index) => {
      // Adjust seed for each item to ensure variation
      this.seedCounter = index * 1000;
      return this.generate(options);
    });
  }

  private applyOverrides<T>(data: T, overrides?: Partial<T>): T {
    if (!overrides) return data;
    return { ...data, ...overrides };
  }

  // Utility method to generate from a simple type
  static fromType(type: string, context?: ScenarioContext): any {
    const generator = new SchemaGenerator(context);
    const schema: JSONSchema7 = { type: type as any };
    return generator.generate({ schema });
  }
}
