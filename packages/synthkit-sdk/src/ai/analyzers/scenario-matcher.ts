import type { DescriptionAnalysis } from '../types/analysis';

export interface PackInfo {
  id: string;
  name: string;
  description: string;
  businessType: string;
  scenarios: ScenarioInfo[];
}

export interface ScenarioInfo {
  id: string;
  name: string;
  description?: string;
  packId: string;
  packName: string;
  businessType: string;
  matchScore: number;
}

export interface ScenarioMatch {
  scenario: ScenarioInfo;
  reasons: string[];
  confidence: number;
}

export interface MatchingResult {
  success: boolean;
  matches: ScenarioMatch[];
  bestMatch?: ScenarioMatch;
  recommendNewScenario: boolean;
  reasoning: string[];
}

export class ScenarioMatcher {
  private packs: PackInfo[] = [];

  constructor() {
    this.initializeKnownPacks();
  }

  private initializeKnownPacks(): void {
    // Initialize with known pack information
    // In a real implementation, this would load from the actual pack registry
    this.packs = [
      {
        id: 'ecomm',
        name: 'E-commerce Pack',
        description: 'Comprehensive e-commerce platform with products, orders, payments, and marketplace features',
        businessType: 'marketplace',
        scenarios: [
          {
            id: 'boutique',
            name: 'Boutique Store',
            description: 'Small fashion retailer with curated products',
            packId: 'ecomm',
            packName: 'E-commerce Pack',
            businessType: 'marketplace',
            matchScore: 0
          },
          {
            id: 'marketplace',
            name: 'Multi-vendor Marketplace',
            description: 'Large marketplace with multiple sellers',
            packId: 'ecomm',
            packName: 'E-commerce Pack',
            businessType: 'marketplace',
            matchScore: 0
          },
          {
            id: 'enterprise',
            name: 'Enterprise E-commerce',
            description: 'Large-scale B2B/B2C platform',
            packId: 'ecomm',
            packName: 'E-commerce Pack',
            businessType: 'marketplace',
            matchScore: 0
          }
        ]
      },
      {
        id: 'saas',
        name: 'SaaS Pack',
        description: 'Comprehensive SaaS business model with subscriptions, billing, and usage analytics',
        businessType: 'productivity',
        scenarios: [
          {
            id: 'startup',
            name: 'Early Stage Startup',
            description: 'Small SaaS with growing customer base',
            packId: 'saas',
            packName: 'SaaS Pack',
            businessType: 'productivity',
            matchScore: 0
          },
          {
            id: 'growth',
            name: 'Growth Stage SaaS',
            description: 'Scaling SaaS with diverse customer segments',
            packId: 'saas',
            packName: 'SaaS Pack',
            businessType: 'productivity',
            matchScore: 0
          },
          {
            id: 'enterprise',
            name: 'Enterprise SaaS',
            description: 'Mature SaaS with enterprise customers',
            packId: 'saas',
            packName: 'SaaS Pack',
            businessType: 'productivity',
            matchScore: 0
          }
        ]
      },
      {
        id: 'brightfund',
        name: 'Brightfund Impact Platform',
        description: 'Nonprofit organization platform with donors, campaigns, and impact tracking',
        businessType: 'nonprofit',
        scenarios: [
          {
            id: 'early',
            name: 'Local Community Nonprofit',
            description: 'Small nonprofit serving local community needs',
            packId: 'brightfund',
            packName: 'Brightfund Impact Platform',
            businessType: 'nonprofit',
            matchScore: 0
          },
          {
            id: 'growth',
            name: 'Regional Nonprofit Organization',
            description: 'Growing nonprofit with multi-state presence',
            packId: 'brightfund',
            packName: 'Brightfund Impact Platform',
            businessType: 'nonprofit',
            matchScore: 0
          },
          {
            id: 'enterprise',
            name: 'International Nonprofit Network',
            description: 'Large nonprofit with global impact programs',
            packId: 'brightfund',
            packName: 'Brightfund Impact Platform',
            businessType: 'nonprofit',
            matchScore: 0
          }
        ]
      },
      {
        id: 'core',
        name: 'Core Pack',
        description: 'Basic scenarios for general applications',
        businessType: 'other',
        scenarios: [
          {
            id: 'default',
            name: 'Default Scenario',
            description: 'Basic scenario with sample data',
            packId: 'core',
            packName: 'Core Pack',
            businessType: 'other',
            matchScore: 0
          },
          {
            id: 'blogsite',
            name: 'Blog Site',
            description: 'Scenario for a blog with posts and comments',
            packId: 'core',
            packName: 'Core Pack',
            businessType: 'content',
            matchScore: 0
          }
        ]
      }
    ];
  }

  async findMatches(analysis: DescriptionAnalysis): Promise<MatchingResult> {
    const { businessContext, entities, keyFeatures, userRoles } = analysis;
    const matches: ScenarioMatch[] = [];

    // Calculate match scores for each scenario
    for (const pack of this.packs) {
      for (const scenario of pack.scenarios) {
        const matchScore = this.calculateMatchScore(
          analysis,
          pack,
          scenario
        );

        if (matchScore > 0.3) { // Only include scenarios with reasonable match
          const reasons = this.generateMatchReasons(
            analysis,
            pack,
            scenario,
            matchScore
          );

          matches.push({
            scenario: { ...scenario, matchScore },
            reasons,
            confidence: matchScore
          });
        }
      }
    }

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    // Determine if we should recommend creating a new scenario
    const bestMatch = matches[0];
    const recommendNewScenario = !bestMatch || bestMatch.confidence < 0.7;

    const reasoning = this.generateOverallReasoning(matches, recommendNewScenario, analysis);

    return {
      success: true,
      matches: matches.slice(0, 5), // Return top 5 matches
      bestMatch,
      recommendNewScenario,
      reasoning
    };
  }

  private calculateMatchScore(
    analysis: DescriptionAnalysis,
    pack: PackInfo,
    scenario: ScenarioInfo
  ): number {
    let score = 0;
    const weights = {
      businessType: 0.4,
      stage: 0.2,
      features: 0.2,
      entities: 0.1,
      description: 0.1
    };

    // Business type matching
    if (this.matchesBusinessType(analysis.businessContext.type, pack.businessType)) {
      score += weights.businessType;
    }

    // Stage matching (startup -> early, growth -> growth, etc.)
    if (this.matchesStage(analysis.businessContext.stage, scenario.id)) {
      score += weights.stage;
    }

    // Feature overlap
    const featureOverlap = this.calculateFeatureOverlap(
      analysis.keyFeatures,
      this.getScenarioFeatures(pack, scenario)
    );
    score += weights.features * featureOverlap;

    // Entity matching
    const entityOverlap = this.calculateEntityOverlap(
      analysis.entities,
      this.getScenarioEntities(pack, scenario)
    );
    score += weights.entities * entityOverlap;

    // Description similarity (basic keyword matching)
    const descriptionSimilarity = this.calculateDescriptionSimilarity(
      analysis.businessContext.primaryFeatures.join(' '),
      scenario.description || ''
    );
    score += weights.description * descriptionSimilarity;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private matchesBusinessType(analysisType: string, packType: string): boolean {
    // Map analysis business types to pack business types
    const typeMapping: Record<string, string[]> = {
      'marketplace': ['marketplace', 'ecommerce'],
      'ecommerce': ['marketplace', 'ecommerce'],
      'productivity': ['productivity', 'saas'],
      'saas': ['productivity', 'saas'],
      'nonprofit': ['nonprofit'],
      'fitness': ['fitness', 'health'],
      'health': ['fitness', 'health'],
      'social': ['social', 'content'],
      'content': ['social', 'content'],
      'other': ['other']
    };

    const mappedTypes = typeMapping[analysisType] || [analysisType];
    return mappedTypes.includes(packType);
  }

  private matchesStage(analysisStage: string, scenarioId: string): boolean {
    const stageMapping: Record<string, string[]> = {
      'early': ['startup', 'early', 'boutique'],
      'growth': ['growth', 'scaling'],
      'mature': ['enterprise', 'mature']
    };

    const mappedStages = stageMapping[analysisStage] || [];
    return mappedStages.some(stage => scenarioId.includes(stage));
  }

  private calculateFeatureOverlap(analysisFeatures: string[], scenarioFeatures: string[]): number {
    if (analysisFeatures.length === 0 || scenarioFeatures.length === 0) {
      return 0;
    }

    const overlap = analysisFeatures.filter(feature =>
      scenarioFeatures.some(sf => 
        sf.toLowerCase().includes(feature.toLowerCase()) ||
        feature.toLowerCase().includes(sf.toLowerCase())
      )
    ).length;

    return overlap / Math.max(analysisFeatures.length, scenarioFeatures.length);
  }

  private calculateEntityOverlap(analysisEntities: any[], scenarioEntities: string[]): number {
    if (analysisEntities.length === 0 || scenarioEntities.length === 0) {
      return 0;
    }

    const analysisEntityNames = analysisEntities.map(e => e.name.toLowerCase());
    const overlap = analysisEntityNames.filter(name =>
      scenarioEntities.some(se => se.toLowerCase().includes(name) || name.includes(se.toLowerCase()))
    ).length;

    return overlap / Math.max(analysisEntityNames.length, scenarioEntities.length);
  }

  private calculateDescriptionSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => 
      words2.includes(word) && word.length > 3 // Only count meaningful words
    );

    return commonWords.length / Math.max(words1.length, words2.length, 1);
  }

  private getScenarioFeatures(pack: PackInfo, scenario: ScenarioInfo): string[] {
    // In a real implementation, this would extract features from the pack schemas
    // For now, return common features based on business type
    const featureMapping: Record<string, string[]> = {
      'marketplace': ['products', 'orders', 'payments', 'shopping cart', 'inventory'],
      'productivity': ['subscriptions', 'billing', 'users', 'analytics', 'api'],
      'nonprofit': ['donations', 'campaigns', 'donors', 'programs', 'impact tracking'],
      'other': ['authentication', 'users', 'basic crud']
    };

    return featureMapping[pack.businessType] || featureMapping['other'] || [];
  }

  private getScenarioEntities(pack: PackInfo, scenario: ScenarioInfo): string[] {
    // In a real implementation, this would extract entities from the pack schemas
    const entityMapping: Record<string, string[]> = {
      'marketplace': ['products', 'orders', 'customers', 'carts', 'payments'],
      'productivity': ['subscriptions', 'invoices', 'plans', 'usage_records', 'users'],
      'nonprofit': ['donors', 'campaigns', 'donations', 'programs'],
      'other': ['users', 'posts', 'comments']
    };

    return entityMapping[pack.businessType] || entityMapping['other'] || [];
  }

  private generateMatchReasons(
    analysis: DescriptionAnalysis,
    pack: PackInfo,
    scenario: ScenarioInfo,
    score: number
  ): string[] {
    const reasons: string[] = [];

    if (this.matchesBusinessType(analysis.businessContext.type, pack.businessType)) {
      reasons.push(`Business type alignment: ${analysis.businessContext.type} matches ${pack.businessType}`);
    }

    if (this.matchesStage(analysis.businessContext.stage, scenario.id)) {
      reasons.push(`Stage compatibility: ${analysis.businessContext.stage} stage fits ${scenario.name}`);
    }

    const featureOverlap = this.calculateFeatureOverlap(
      analysis.keyFeatures,
      this.getScenarioFeatures(pack, scenario)
    );
    if (featureOverlap > 0.3) {
      reasons.push(`Feature overlap: ${Math.round(featureOverlap * 100)}% of features align`);
    }

    if (score > 0.8) {
      reasons.push('High overall compatibility score');
    } else if (score > 0.6) {
      reasons.push('Good compatibility with some customization needed');
    }

    return reasons;
  }

  private generateOverallReasoning(
    matches: ScenarioMatch[],
    recommendNewScenario: boolean,
    analysis: DescriptionAnalysis
  ): string[] {
    const reasoning: string[] = [];

    if (matches.length === 0) {
      reasoning.push('No existing scenarios found that match your business description');
      reasoning.push('Recommend creating a new custom scenario');
    } else if (recommendNewScenario) {
      reasoning.push(`Found ${matches.length} potential matches, but confidence is low`);
      reasoning.push('Your business has unique characteristics that may benefit from a custom scenario');
    } else {
      reasoning.push(`Found ${matches.length} good matches for your business type`);
      if (matches[0]) {
        reasoning.push(`Best match: ${matches[0].scenario.name} with ${Math.round(matches[0].confidence * 100)}% confidence`);
      }
    }

    // Add business-specific insights
    if (analysis.businessContext.type === 'fitness') {
      reasoning.push('Fitness apps often benefit from custom scenarios due to unique tracking requirements');
    } else if (analysis.businessContext.type === 'social') {
      reasoning.push('Social platforms typically need custom scenarios for user interaction patterns');
    }

    return reasoning;
  }
}
