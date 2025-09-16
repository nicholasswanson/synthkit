// AI exports - moved from @synthkit/ai package
export { DescriptionAnalyzer } from './analyzers/description-analyzer';
export { ClaudeClient } from './analyzers/claude-client';
export { ScenarioMatcher } from './analyzers/scenario-matcher';
export { ScenarioGenerator } from './analyzers/scenario-generator';

// Types
export type {
  DescriptionAnalysis,
  AnalysisRequest,
  AnalysisResult,
  EntityInfo
} from './types/analysis';

export type {
  BusinessType,
  BusinessStage,
  BusinessContext
} from './types/business';

// Utils
export { ValidationUtils } from './utils/validation';

// Version
export const AI_VERSION = '0.1.0';