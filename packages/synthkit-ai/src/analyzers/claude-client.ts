import type { DescriptionAnalysis, AnalysisRequest } from '../types/analysis';

// Dynamic import to handle optional dependency
let Anthropic: any;

export class ClaudeClient {
  private client: any;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('No Anthropic API key provided. Set ANTHROPIC_API_KEY environment variable or pass apiKey parameter.');
    }
  }

  private async initializeClient(): Promise<void> {
    if (!this.client) {
      try {
        // Try to dynamically import Anthropic SDK
        const anthropicModule = await eval('import("@anthropic-ai/sdk")');
        Anthropic = anthropicModule.default;
        this.client = new Anthropic({
          apiKey: this.apiKey
        });
      } catch (error) {
        // For now, use a mock client for development
        console.warn('Anthropic SDK not available, using mock client');
        this.client = this.createMockClient();
      }
    }
  }

  private createMockClient() {
    return {
      messages: {
        create: async (params: any) => {
          // Mock response for development/testing
          const mockAnalysis = {
            businessContext: {
              type: 'other',
              stage: 'early',
              primaryFeatures: ['basic functionality'],
              targetAudience: ['general users'],
              monetizationModel: 'other'
            },
            entities: [
              {
                name: 'users',
                type: 'core',
                relationships: [],
                estimatedVolume: 'medium'
              }
            ],
            userRoles: ['user', 'admin'],
            keyFeatures: ['authentication', 'basic crud'],
            confidence: 0.5,
            reasoning: ['Mock analysis - Anthropic SDK not available']
          };

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(mockAnalysis)
            }]
          };
        }
      }
    };
  }

  async analyzeDescription(request: AnalysisRequest): Promise<DescriptionAnalysis> {
    await this.initializeClient();
    
    const prompt = this.buildAnalysisPrompt(request);
    
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        temperature: 0.1,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseClaudeResponse(content.text);
    } catch (error) {
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(request: AnalysisRequest): string {
    return `You are an expert at analyzing software product descriptions and categorizing them for mock data generation.

Analyze this product description and return a JSON response with the following structure:

{
  "businessContext": {
    "type": "saas|ecommerce|marketplace|fintech|fitness|education|healthcare|social|content|gaming|productivity|other",
    "stage": "early|growth|enterprise",
    "primaryFeatures": ["feature1", "feature2"],
    "targetAudience": ["audience1", "audience2"],
    "monetizationModel": "subscription|transaction|advertising|freemium|other"
  },
  "entities": [
    {
      "name": "users",
      "type": "core|supporting|transactional",
      "relationships": ["orders", "profiles"],
      "estimatedVolume": "low|medium|high"
    }
  ],
  "userRoles": ["admin", "user", "moderator"],
  "keyFeatures": ["authentication", "payments", "messaging"],
  "confidence": 0.85,
  "reasoning": ["Identified as SaaS due to subscription model", "Fitness context from workout tracking"]
}

Business Type Guidelines:
- saas: Software as a Service, subscription-based tools
- ecommerce: Online stores, product sales
- marketplace: Multi-vendor platforms
- fintech: Financial services, payments, banking
- fitness: Health, exercise, wellness apps
- education: Learning platforms, courses
- healthcare: Medical, health tracking
- social: Social networks, community platforms
- content: Media, publishing, content creation
- gaming: Games, entertainment
- productivity: Tools, utilities, workflow

Entity Types:
- core: Primary business objects (users, products)
- supporting: Configuration/reference data (categories, settings)
- transactional: Activity records (orders, messages, logs)

Description to analyze: "${request.description}"

${request.context?.existingScenarios ? `
Existing scenarios to consider: ${request.context.existingScenarios.join(', ')}
` : ''}

Return only valid JSON, no additional text.`;
  }

  private parseClaudeResponse(response: string): DescriptionAnalysis {
    try {
      // Clean up the response - remove any markdown formatting
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanResponse);
      
      // Validate the response structure
      if (!parsed.businessContext || !parsed.entities || !Array.isArray(parsed.entities)) {
        throw new Error('Invalid response structure from Claude');
      }

      return parsed as DescriptionAnalysis;
    } catch (error) {
      throw new Error(`Failed to parse Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
