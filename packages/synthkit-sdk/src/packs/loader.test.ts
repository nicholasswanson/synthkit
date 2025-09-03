import { describe, it, expect } from 'vitest';
import { loadPack, loadPacks } from './loader';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Pack Loader', () => {
  const testPackPath = join(__dirname, 'test-fixtures', 'test-pack');

  describe('loadPack', () => {
    it('should load a valid pack from a relative path', async () => {
      const pack = await loadPack(testPackPath);
      
      expect(pack.id).toBe('test-pack');
      expect(pack.name).toBe('Test Pack');
      expect(pack.description).toBe('A test pack for unit tests');
      expect(pack.version).toBe('1.0.0');
      
      // Check schemas
      expect(pack.schemas).toHaveProperty('user');
      expect(pack.schemas).toHaveProperty('product');
      expect(pack.schemas.user.type).toBe('object');
      
      // Check scenarios
      expect(pack.scenarios).toHaveProperty('default');
      expect(pack.scenarios.default.config.seed).toBe(12345);
      
      // Check personas
      expect(pack.personas).toHaveProperty('developer');
      expect(pack.personas.developer.preferences?.locale).toBe('en-US');
      
      // Check routes
      expect(pack.routes).toHaveProperty('/api/users');
      expect(pack.routes!['/api/users'].schema).toBe('user');
    });

    it('should throw error for non-existent pack', async () => {
      await expect(loadPack('./non-existent-pack')).rejects.toThrow('Failed to load pack');
    });

    it('should validate pack structure', async () => {
      // This would need a malformed pack fixture
      // For now, we'll test that validation runs without errors on valid pack
      const pack = await loadPack(testPackPath, { validate: true });
      expect(pack).toBeDefined();
    });
  });

  describe('loadPacks', () => {
    it('should load multiple packs', async () => {
      const packs = await loadPacks([testPackPath]);
      
      expect(packs).toHaveLength(1);
      expect(packs[0].id).toBe('test-pack');
    });

    it('should detect duplicate pack IDs', async () => {
      await expect(loadPacks([testPackPath, testPackPath])).rejects.toThrow('Duplicate pack ID found: test-pack');
    });
  });
});
