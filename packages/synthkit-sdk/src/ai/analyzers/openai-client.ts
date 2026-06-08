import type { DescriptionAnalysis, AnalysisRequest } from '../types/analysis';

export class OpenAIClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = model || process.env.OPENAI_MODEL || 'gpt-4.1-mini';

    if (!this.apiKey) {
      console.warn('No OpenAI API key provided. Set OPENAI_API_KEY environment variable or pass apiKey parameter.');
    }
  }

  async analyzeDescription(request: AnalysisRequest): Promise<DescriptionAnalysis> {
    const prompt = this.buildAnalysisPrompt(request);

    if (!this.apiKey) {
      return this.createMockAnalysis();
    }

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_output_tokens: 1500,
          input: [
            {
              role: 'system',
              content: 'You analyze software product descriptions for mock data generation. Return only valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
      }

      const data = await response.json();
      const text = this.extractResponseText(data);

      return this.parseOpenAIResponse(text);
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createMockAnalysis(): DescriptionAnalysis {
    return {
      businessContext: {
        type: 'other',
        stage: 'early',
        primaryFeatures: ['basic functionality'],
        targetAudience: ['general users'],
        monetizationModel: 'other',
      },
      entities: [
        {
          name: 'users',
          type: 'core',
          relationships: [],
          estimatedVolume: 'medium',
        },
      ],
      userRoles: ['user', 'admin'],
      keyFeatures: ['authentication', 'basic crud'],
      confidence: 0.5,
      reasoning: ['Mock analysis - OPENAI_API_KEY is not configured'],
    };
  }

  private buildAnalysisPrompt(request: AnalysisRequest): string {
    return `Analyze this product description and return a JSON response with the following structure:

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

Return only valid JSON, no markdown or additional text.`;
  }

  private extractResponseText(response: any): string {
    if (typeof response.output_text === 'string') {
      return response.output_text;
    }

    const textParts = response.output
      ?.flatMap((item: any) => item.content || [])
      ?.map((content: any) => content.text)
      ?.filter((text: any) => typeof text === 'string');

    if (textParts?.length) {
      return textParts.join('\n');
    }

    throw new Error('OpenAI response did not include text output');
  }

  private parseOpenAIResponse(response: string): DescriptionAnalysis {
    try {
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanResponse);

      if (!parsed.businessContext || !parsed.entities || !Array.isArray(parsed.entities)) {
        throw new Error('Invalid response structure from OpenAI');
      }

      return parsed as DescriptionAnalysis;
    } catch (error) {
      throw new Error(`Failed to parse OpenAI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
