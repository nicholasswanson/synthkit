import type { DescriptionAnalysis } from '../types/analysis';

export interface GeneratedScenario {
  id: string;
  name: string;
  description: string;
  packId: string;
  config: {
    seed: number;
    dateRange: {
      start: string;
      end: string;
    };
    volume: Record<string, number>;
    relationships: Record<string, number>;
  };
}

export interface GeneratedPersona {
  id: string;
  name: string;
  description: string;
  preferences?: {
    locale?: string;
    timezone?: string;
    currency?: string;
    [key: string]: any;
  };
  overrides: Record<string, any>;
}

export interface GeneratedPack {
  id: string;
  name: string;
  description: string;
  version: string;
  schemas: Record<string, any>;
  scenarios: Record<string, GeneratedScenario>;
  personas: Record<string, GeneratedPersona>;
  routes?: Record<string, any>;
}

export interface GenerationResult {
  success: boolean;
  pack?: GeneratedPack;
  scenario?: GeneratedScenario;
  personas?: GeneratedPersona[];
  reasoning: string[];
  suggestions: string[];
  error?: string;
}

export class ScenarioGenerator {
  constructor() {
    // No external dependencies needed for basic generation
  }

  async generateScenario(analysis: DescriptionAnalysis): Promise<GenerationResult> {
    try {
      // Generate the pack structure directly from analysis
      const generatedPack = this.createPackFromAnalysis(analysis);
      const generatedScenario = this.createScenarioFromAnalysis(analysis);
      const generatedPersonas = this.createPersonasFromAnalysis(analysis);

      return {
        success: true,
        pack: generatedPack,
        scenario: generatedScenario,
        personas: generatedPersonas,
        reasoning: [
          'Generated custom scenario based on your business description',
          `Created ${generatedPersonas.length} personas for different user types`,
          'Included appropriate data volumes and relationships',
          'Generated JSON schemas for all identified entities'
        ],
        suggestions: [
          'Review the generated schemas and adjust data types as needed',
          'Customize the data volumes based on your expected scale',
          'Add additional personas for specific user segments',
          'Consider adding custom routes for your API endpoints'
        ]
      };
    } catch (error) {
      return {
        success: false,
        reasoning: ['Error occurred during scenario generation'],
        suggestions: ['Try again or simplify your business description'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private buildGenerationPrompt(analysis: DescriptionAnalysis): string {
    return `
Generate a comprehensive data scenario for this business:

Business Type: ${analysis.businessContext.type}
Stage: ${analysis.businessContext.stage}
Primary Features: ${analysis.businessContext.primaryFeatures.join(', ')}
Target Audience: ${analysis.businessContext.targetAudience.join(', ')}
Monetization: ${analysis.businessContext.monetizationModel}

Key Features: ${analysis.keyFeatures.join(', ')}
User Roles: ${analysis.userRoles.join(', ')}

Data Entities:
${analysis.entities.map(e => `- ${e.name} (${e.type}): ${e.relationships.join(', ')}`).join('\n')}

Please provide recommendations for:
1. Data volumes appropriate for this business stage
2. Realistic relationships between entities
3. Appropriate personas for different user types
4. Suggested data patterns and constraints
`;
  }

  private createPackFromAnalysis(analysis: DescriptionAnalysis): GeneratedPack {
    const packId = this.generatePackId(analysis);
    const schemas = this.generateSchemasFromEntities(analysis.entities);
    const scenario = this.createScenarioFromAnalysis(analysis);
    const personas = this.createPersonasFromAnalysis(analysis);

    return {
      id: packId,
      name: `${this.capitalizeFirst(analysis.businessContext.type)} Pack`,
      description: `Custom pack for ${analysis.businessContext.primaryFeatures.join(', ')} business`,
      version: '1.0.0',
      schemas,
      scenarios: {
        [scenario.id]: scenario
      },
      personas: personas.reduce((acc, persona) => {
        acc[persona.id] = persona;
        return acc;
      }, {} as Record<string, GeneratedPersona>),
      routes: this.generateRoutesFromEntities(analysis.entities)
    };
  }

  private createScenarioFromAnalysis(analysis: DescriptionAnalysis): GeneratedScenario {
    const scenarioId = this.generateScenarioId(analysis);
    const volumes = this.calculateDataVolumes(analysis);
    const relationships = this.calculateRelationships(analysis);

    return {
      id: scenarioId,
      name: `${this.capitalizeFirst(analysis.businessContext.stage)} ${this.capitalizeFirst(analysis.businessContext.type)}`,
      description: `${this.capitalizeFirst(analysis.businessContext.stage)} stage ${analysis.businessContext.type} with ${analysis.businessContext.primaryFeatures.join(', ')}`,
      packId: this.generatePackId(analysis),
      config: {
        seed: Math.floor(Math.random() * 100000),
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        volume: volumes,
        relationships
      }
    };
  }

  private createPersonasFromAnalysis(analysis: DescriptionAnalysis): GeneratedPersona[] {
    const personas: GeneratedPersona[] = [];

    // Create personas based on user roles and target audience
    analysis.userRoles.forEach((role, index) => {
      const persona = this.createPersonaForRole(role, analysis, index);
      personas.push(persona);
    });

    // Add additional personas based on target audience if not covered by roles
    analysis.businessContext.targetAudience.forEach((audience, index) => {
      if (!analysis.userRoles.some(role => role.toLowerCase().includes(audience.toLowerCase()))) {
        const persona = this.createPersonaForAudience(audience, analysis, personas.length + index);
        personas.push(persona);
      }
    });

    return personas.slice(0, 5); // Limit to 5 personas
  }

  private createPersonaForRole(role: string, analysis: DescriptionAnalysis, index: number): GeneratedPersona {
    const personaId = role.toLowerCase().replace(/\s+/g, '_');
    const businessType = analysis.businessContext.type;
    const stage = analysis.businessContext.stage;
    
    // Generate more sophisticated persona descriptions
    const description = this.generatePersonaDescription(role, businessType, stage);
    const preferences = this.generatePersonaPreferences(role, businessType, analysis.businessContext.targetAudience);
    
    return {
      id: personaId,
      name: this.capitalizeFirst(role),
      description,
      preferences,
      overrides: this.generatePersonaOverrides(role, analysis)
    };
  }

  private createPersonaForAudience(audience: string, analysis: DescriptionAnalysis, index: number): GeneratedPersona {
    const personaId = audience.toLowerCase().replace(/\s+/g, '_');
    
    return {
      id: personaId,
      name: this.capitalizeFirst(audience),
      description: `${this.capitalizeFirst(audience)} persona representing target audience`,
      preferences: {
        locale: 'en-US',
        timezone: 'America/New_York',
        currency: 'USD'
      },
      overrides: this.generateAudienceOverrides(audience, analysis)
    };
  }

  private generatePersonaOverrides(role: string, analysis: DescriptionAnalysis): Record<string, any> {
    const overrides: Record<string, any> = {};
    
    // Generate role-specific overrides based on business context
    if (role.toLowerCase().includes('admin')) {
      overrides.user = {
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin']
      };
    } else if (role.toLowerCase().includes('manager')) {
      overrides.user = {
        role: 'manager',
        permissions: ['read', 'write']
      };
    } else {
      overrides.user = {
        role: 'user',
        permissions: ['read']
      };
    }

    return overrides;
  }

  private generateAudienceOverrides(audience: string, analysis: DescriptionAnalysis): Record<string, any> {
    const overrides: Record<string, any> = {};
    
    // Generate audience-specific overrides
    if (audience.toLowerCase().includes('enterprise')) {
      overrides.user = {
        accountType: 'enterprise',
        features: ['advanced_analytics', 'custom_integrations']
      };
    } else if (audience.toLowerCase().includes('small business')) {
      overrides.user = {
        accountType: 'business',
        features: ['basic_analytics', 'team_collaboration']
      };
    }

    return overrides;
  }

  private generateSchemasFromEntities(entities: any[]): Record<string, any> {
    const schemas: Record<string, any> = {};

    entities.forEach(entity => {
      schemas[entity.name] = this.generateSchemaForEntity(entity);
    });

    return schemas;
  }

  private generateSchemaForEntity(entity: any): any {
    const schema = {
      type: 'object',
      description: `${this.capitalizeFirst(entity.name)} entity`,
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: `${this.capitalizeFirst(entity.name)} identifier`
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          faker: 'date.past'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          faker: 'date.recent'
        }
      },
      required: ['id', 'createdAt']
    };

    // Add entity-specific properties based on common patterns
    if (entity.name === 'users') {
      Object.assign(schema.properties, {
        email: { type: 'string', format: 'email', faker: 'internet.email' },
        firstName: { type: 'string', faker: 'person.firstName' },
        lastName: { type: 'string', faker: 'person.lastName' },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'], default: 'active' }
      });
      schema.required.push('email', 'firstName', 'lastName');
    } else if (entity.name === 'products') {
      Object.assign(schema.properties, {
        name: { type: 'string', faker: 'commerce.productName' },
        description: { type: 'string', faker: 'commerce.productDescription' },
        price: { type: 'number', minimum: 0, faker: 'commerce.price' },
        status: { type: 'string', enum: ['active', 'inactive'], default: 'active' }
      });
      schema.required.push('name', 'price');
    } else if (entity.name === 'orders') {
      Object.assign(schema.properties, {
        orderNumber: { type: 'string', faker: 'string.alphanumeric' },
        status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered'], default: 'pending' },
        total: { type: 'number', minimum: 0, faker: 'commerce.price' }
      });
      schema.required.push('orderNumber', 'total');
    }

    return schema;
  }

  private generateRoutesFromEntities(entities: any[]): Record<string, any> {
    const routes: Record<string, any> = {};

    entities.forEach(entity => {
      routes[`/api/${entity.name}`] = {
        schema: entity.name,
        rest: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      };
    });

    return routes;
  }

  private calculateDataVolumes(analysis: DescriptionAnalysis): Record<string, number> {
    const volumes: Record<string, number> = {};
    const stageMultipliers = {
      early: 1,
      growth: 10,
      mature: 100
    };

    const multiplier = stageMultipliers[analysis.businessContext.stage as keyof typeof stageMultipliers] || 1;

    analysis.entities.forEach(entity => {
      let baseVolume = 100;
      
      // Adjust base volume based on entity type and volume hint
      if (entity.estimatedVolume === 'high') {
        baseVolume = 1000;
      } else if (entity.estimatedVolume === 'medium') {
        baseVolume = 500;
      } else if (entity.estimatedVolume === 'low') {
        baseVolume = 50;
      }

      // Apply stage multiplier
      volumes[entity.name] = Math.round(baseVolume * multiplier);
    });

    return volumes;
  }

  private calculateRelationships(analysis: DescriptionAnalysis): Record<string, number> {
    const relationships: Record<string, number> = {};

    // Add common business relationships based on type
    if (analysis.businessContext.type === 'marketplace' || analysis.businessContext.type === 'ecommerce') {
      relationships.conversionRate = 0.12;
      relationships.averageOrderValue = 75;
      relationships.returnRate = 0.08;
    } else if (analysis.businessContext.type === 'productivity' || analysis.businessContext.type === 'saas') {
      relationships.trialConversionRate = 0.25;
      relationships.churnRate = 0.05;
      relationships.upgradeRate = 0.15;
    } else if (analysis.businessContext.type === 'social') {
      relationships.engagementRate = 0.35;
      relationships.dailyActiveUsers = 0.25;
      relationships.contentCreationRate = 0.08;
    }

    return relationships;
  }

  private generatePackId(analysis: DescriptionAnalysis): string {
    const type = analysis.businessContext.type.toLowerCase();
    const features = analysis.businessContext.primaryFeatures[0]?.toLowerCase().replace(/\s+/g, '') || 'custom';
    return `${type}-${features}`.substring(0, 20);
  }

  private generateScenarioId(analysis: DescriptionAnalysis): string {
    return analysis.businessContext.stage.toLowerCase();
  }

  private generatePersonaDescription(role: string, businessType: string, stage: string): string {
    const roleDescriptions: Record<string, Record<string, string>> = {
      admin: {
        fitness: 'Gym owner or fitness platform administrator with deep knowledge of member engagement and retention strategies',
        marketplace: 'Platform administrator managing vendor relationships, transaction monitoring, and marketplace growth',
        productivity: 'System administrator focused on user onboarding, feature adoption, and subscription management',
        social: 'Community manager overseeing user safety, content moderation, and platform engagement',
        nonprofit: 'Organization director managing donor relationships, campaign effectiveness, and impact measurement',
        default: 'System administrator with full access to platform analytics and user management capabilities'
      },
      user: {
        fitness: 'Health-conscious individual tracking workouts, nutrition, and fitness goals with varying levels of tech-savviness',
        marketplace: 'Regular shopper looking for unique products, comparing prices, and reading reviews before purchasing',
        productivity: 'Professional using the platform to organize tasks, collaborate with team members, and improve workflow efficiency',
        social: 'Active community member sharing content, connecting with others, and discovering new interests',
        nonprofit: 'Supporter interested in making a positive impact through donations, volunteering, and advocacy',
        default: 'Regular platform user with standard access and typical usage patterns'
      },
      manager: {
        fitness: 'Fitness center manager or team lead coordinating schedules, tracking member progress, and managing staff',
        marketplace: 'Vendor or seller managing product listings, inventory, customer service, and sales analytics',
        productivity: 'Team manager overseeing project progress, resource allocation, and team performance metrics',
        social: 'Content moderator or community lead maintaining platform standards and fostering positive interactions',
        nonprofit: 'Program manager coordinating campaigns, managing volunteers, and tracking program outcomes',
        default: 'Mid-level manager with elevated permissions and team oversight responsibilities'
      }
    };

    const stageModifiers: Record<string, string> = {
      early: 'in a growing startup environment, adapting to rapid changes and new features',
      growth: 'in a scaling organization, balancing efficiency with expanding user base and feature complexity',
      mature: 'in an established enterprise setting, focused on optimization, compliance, and advanced workflows'
    };

    const baseDescription = roleDescriptions[role.toLowerCase()]?.[businessType] || 
                           roleDescriptions[role.toLowerCase()]?.default || 
                           `${this.capitalizeFirst(role)} with specialized knowledge of ${businessType} domain`;

    const stageModifier = stageModifiers[stage] || '';
    
    return `${baseDescription}${stageModifier ? ` ${stageModifier}` : ''}`;
  }

  private generatePersonaPreferences(role: string, businessType: string, targetAudience: string[]): Record<string, any> {
    const basePreferences = {
      locale: 'en-US',
      timezone: 'America/New_York',
      currency: 'USD'
    };

    // Business-specific preferences
    const businessPreferences: Record<string, Record<string, any>> = {
      fitness: {
        units: 'imperial', // vs metric
        workoutReminders: true,
        nutritionTracking: true,
        socialSharing: role === 'user'
      },
      marketplace: {
        paymentMethod: 'credit_card',
        shippingPreference: 'standard',
        reviewNotifications: true,
        wishlistEnabled: role === 'user'
      },
      productivity: {
        notificationFrequency: role === 'admin' ? 'high' : 'medium',
        dashboardLayout: 'compact',
        integrationPreferences: ['email', 'calendar'],
        reportingLevel: role === 'admin' ? 'detailed' : 'summary'
      },
      social: {
        privacyLevel: role === 'user' ? 'friends' : 'public',
        contentFilters: true,
        autoModeration: role === 'admin',
        engagementMetrics: role !== 'user'
      },
      nonprofit: {
        donationReminders: role === 'user',
        impactReports: true,
        volunteerNotifications: role === 'user',
        campaignUpdates: true
      }
    };

    // Role-specific preferences
    const rolePreferences: Record<string, Record<string, any>> = {
      admin: {
        analyticsAccess: 'full',
        bulkOperations: true,
        advancedFilters: true,
        systemNotifications: true
      },
      manager: {
        analyticsAccess: 'team',
        bulkOperations: true,
        advancedFilters: false,
        systemNotifications: false
      },
      user: {
        analyticsAccess: 'personal',
        bulkOperations: false,
        advancedFilters: false,
        systemNotifications: false
      }
    };

    return {
      ...basePreferences,
      ...businessPreferences[businessType] || {},
      ...rolePreferences[role.toLowerCase()] || {}
    };
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
