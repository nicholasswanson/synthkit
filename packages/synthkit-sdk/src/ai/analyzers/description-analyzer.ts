import { ClaudeClient } from './claude-client';
import type { DescriptionAnalysis, AnalysisRequest, AnalysisResult } from '../types/analysis';

export class DescriptionAnalyzer {
  private claudeClient: ClaudeClient;

  constructor(apiKey?: string) {
    this.claudeClient = new ClaudeClient(apiKey);
  }

  async analyze(description: string, context?: AnalysisRequest['context']): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      // Basic validation
      if (!description || description.trim().length < 10) {
        return {
          success: false,
          error: 'Description must be at least 10 characters long',
          processingTime: Date.now() - startTime
        };
      }

      // Prepare request
      const request: AnalysisRequest = {
        description: description.trim(),
        context
      };

      // Analyze with Claude
      const analysis = await this.claudeClient.analyzeDescription(request);

      // Post-process and validate
      const validatedAnalysis = this.validateAnalysis(analysis);

      return {
        success: true,
        analysis: validatedAnalysis,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown analysis error',
        processingTime: Date.now() - startTime
      };
    }
  }

  private validateAnalysis(analysis: DescriptionAnalysis): DescriptionAnalysis {
    // Ensure confidence is between 0 and 1
    const confidence = Math.max(0, Math.min(1, analysis.confidence || 0.5));

    // Ensure we have at least basic entities
    const entities = analysis.entities?.length > 0 ? analysis.entities : [
      {
        name: 'users',
        type: 'core' as const,
        relationships: [],
        estimatedVolume: 'medium' as const
      }
    ];

    // Ensure we have at least basic user roles
    const userRoles = analysis.userRoles?.length > 0 ? analysis.userRoles : ['user', 'admin'];

    return {
      ...analysis,
      confidence,
      entities,
      userRoles,
      reasoning: analysis.reasoning || ['Basic analysis completed']
    };
  }

  /**
   * Quick analysis for simple business type detection
   */
  async quickAnalyze(description: string): Promise<{ businessType: string; confidence: number }> {
    const result = await this.analyze(description);
    
    if (!result.success || !result.analysis) {
      return { businessType: 'other', confidence: 0 };
    }

    return {
      businessType: result.analysis.businessContext.type,
      confidence: result.analysis.confidence
    };
  }
}
