import { describe, it, expect } from 'vitest';
import { SchemaGenerator } from './schema-generator';
import type { JSONSchema7 } from 'json-schema';

describe('SchemaGenerator', () => {
  it('should generate data from a simple schema', () => {
    const generator = new SchemaGenerator();
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        age: { type: 'number', minimum: 0, maximum: 100 }
      },
      required: ['id', 'name', 'age']
    };

    const result = generator.generate({ schema });
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('age');
    expect(typeof result.id).toBe('string');
    expect(typeof result.name).toBe('string');
    expect(typeof result.age).toBe('number');
    expect(result.age).toBeGreaterThanOrEqual(0);
    expect(result.age).toBeLessThanOrEqual(100);
  });

  it('should apply overrides', () => {
    const generator = new SchemaGenerator();
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      }
    };

    const result = generator.generate({ 
      schema,
      overrides: { name: 'John Doe' }
    });
    
    expect(result.name).toBe('John Doe');
  });

  it('should generate consistent data with same seed', () => {
    const generator1 = new SchemaGenerator({ seed: 42 });
    const generator2 = new SchemaGenerator({ seed: 42 });
    
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        value: { type: 'string' }
      }
    };

    const result1 = generator1.generate({ schema });
    const result2 = generator2.generate({ schema });
    
    expect(result1).toEqual(result2);
  });

  it('should generate different data with different seeds', () => {
    const generator1 = new SchemaGenerator({ seed: 42 });
    const generator2 = new SchemaGenerator({ seed: 43 });
    
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        value: { type: 'string' }
      }
    };

    const result1 = generator1.generate({ schema });
    const result2 = generator2.generate({ schema });
    
    expect(result1).not.toEqual(result2);
  });

  it('should generate multiple items', () => {
    const generator = new SchemaGenerator();
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        id: { type: 'number' }
      }
    };

    const results = generator.generateMany(3, { schema });
    
    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('number');
    });
  });
});
