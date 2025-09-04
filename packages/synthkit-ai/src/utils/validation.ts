import type { DescriptionAnalysis } from '../types/analysis';
import type { BusinessType, BusinessStage } from '../types/business';

export class ValidationUtils {
  static readonly VALID_BUSINESS_TYPES: BusinessType[] = [
    'saas', 'ecommerce', 'marketplace', 'fintech', 'fitness', 
    'education', 'healthcare', 'social', 'content', 'gaming', 
    'productivity', 'other'
  ];

  static readonly VALID_BUSINESS_STAGES: BusinessStage[] = [
    'early', 'growth', 'enterprise'
  ];

  static validateBusinessType(type: string): type is BusinessType {
    return this.VALID_BUSINESS_TYPES.includes(type as BusinessType);
  }

  static validateBusinessStage(stage: string): stage is BusinessStage {
    return this.VALID_BUSINESS_STAGES.includes(stage as BusinessStage);
  }

  static validateAnalysis(analysis: any): analysis is DescriptionAnalysis {
    if (!analysis || typeof analysis !== 'object') {
      return false;
    }

    // Check business context
    if (!analysis.businessContext || typeof analysis.businessContext !== 'object') {
      return false;
    }

    const { businessContext } = analysis;
    if (!this.validateBusinessType(businessContext.type) || 
        !this.validateBusinessStage(businessContext.stage)) {
      return false;
    }

    // Check entities
    if (!Array.isArray(analysis.entities)) {
      return false;
    }

    // Check confidence
    if (typeof analysis.confidence !== 'number' || 
        analysis.confidence < 0 || 
        analysis.confidence > 1) {
      return false;
    }

    return true;
  }

  static sanitizeEntityName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  static sanitizeRoleName(role: string): string {
    return role
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
