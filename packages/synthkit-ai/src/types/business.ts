export type BusinessType = 
  | 'saas'
  | 'ecommerce' 
  | 'marketplace'
  | 'fintech'
  | 'fitness'
  | 'education'
  | 'healthcare'
  | 'social'
  | 'content'
  | 'gaming'
  | 'productivity'
  | 'other';

export type BusinessStage = 'early' | 'growth' | 'enterprise';

export interface BusinessContext {
  type: BusinessType;
  stage: BusinessStage;
  primaryFeatures: string[];
  targetAudience: string[];
  monetizationModel?: string;
}
