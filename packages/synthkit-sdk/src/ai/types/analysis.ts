import type { BusinessType, BusinessStage, BusinessContext } from './business';

export interface DescriptionAnalysis {
  businessContext: BusinessContext;
  entities: EntityInfo[];
  userRoles: string[];
  keyFeatures: string[];
  confidence: number;
  reasoning: string[];
}

export interface EntityInfo {
  name: string;
  type: 'core' | 'supporting' | 'transactional';
  relationships: string[];
  estimatedVolume: 'low' | 'medium' | 'high';
}

export interface AnalysisRequest {
  description: string;
  context?: {
    existingScenarios?: string[];
    preferredStage?: BusinessStage;
    targetVolume?: 'small' | 'medium' | 'large';
  };
}

export interface AnalysisResult {
  success: boolean;
  analysis?: DescriptionAnalysis;
  error?: string;
  processingTime: number;
}
