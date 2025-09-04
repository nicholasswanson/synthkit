import { describe, it, expect, beforeEach } from 'vitest';
import { DescriptionAnalyzer } from '../analyzers/description-analyzer';
import { ValidationUtils } from '../utils/validation';
import { TEST_DESCRIPTIONS } from './fixtures/test-descriptions';

describe('DescriptionAnalyzer', () => {
  let analyzer: DescriptionAnalyzer;

  beforeEach(() => {
    analyzer = new DescriptionAnalyzer();
  });

  it('should analyze a fitness app description', async () => {
    const { description, expectedType } = TEST_DESCRIPTIONS.fitness;
    const result = await analyzer.analyze(description);

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(result.analysis?.businessContext.type).toBe(expectedType);
    expect(result.analysis?.entities.length).toBeGreaterThan(0);
    expect(result.analysis?.confidence).toBeGreaterThan(0);
    expect(result.processingTime).toBeGreaterThan(0);
  });

  it('should analyze an ecommerce description', async () => {
    const { description, expectedType } = TEST_DESCRIPTIONS.ecommerce;
    const result = await analyzer.analyze(description);

    expect(result.success).toBe(true);
    expect(result.analysis?.businessContext.type).toBe(expectedType);
    expect(result.analysis?.entities).toContain(
      expect.objectContaining({ 
        name: expect.stringMatching(/product|user|review/) 
      })
    );
  });

  it('should analyze a SaaS description', async () => {
    const { description, expectedType } = TEST_DESCRIPTIONS.saas;
    const result = await analyzer.analyze(description);

    expect(result.success).toBe(true);
    expect(result.analysis?.businessContext.type).toBe(expectedType);
    expect(result.analysis?.userRoles).toContain('user');
  });

  it('should handle invalid descriptions', async () => {
    const { description, expectedError } = TEST_DESCRIPTIONS.invalid;
    const result = await analyzer.analyze(description);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain(expectedError);
  });

  it('should provide quick analysis', async () => {
    const { description, expectedType } = TEST_DESCRIPTIONS.saas;
    const result = await analyzer.quickAnalyze(description);
    
    expect(result.businessType).toBe(expectedType);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should validate analysis results', async () => {
    const { description } = TEST_DESCRIPTIONS.fitness;
    const result = await analyzer.analyze(description);

    expect(result.success).toBe(true);
    if (result.analysis) {
      expect(ValidationUtils.validateAnalysis(result.analysis)).toBe(true);
      expect(ValidationUtils.validateBusinessType(result.analysis.businessContext.type)).toBe(true);
      expect(ValidationUtils.validateBusinessStage(result.analysis.businessContext.stage)).toBe(true);
    }
  });

  it('should handle analysis with context', async () => {
    const { description } = TEST_DESCRIPTIONS.marketplace;
    const context = {
      existingScenarios: ['saas-early', 'ecommerce-growth'],
      preferredStage: 'growth' as const,
      targetVolume: 'medium' as const
    };

    const result = await analyzer.analyze(description, context);

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
  });

  it('should sanitize entity and role names', () => {
    expect(ValidationUtils.sanitizeEntityName('User Profile')).toBe('user_profile');
    expect(ValidationUtils.sanitizeEntityName('Product-Categories')).toBe('product_categories');
    expect(ValidationUtils.sanitizeRoleName('Super Admin')).toBe('super-admin');
    expect(ValidationUtils.sanitizeRoleName('Content_Creator')).toBe('content-creator');
  });
});
