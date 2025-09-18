// Stripe Products Analyzer for Synthkit Personas
// Analyzes which Stripe products each persona would use based on business characteristics

// Stripe products mapping based on business characteristics and Stripe Data Schema
const STRIPE_PRODUCTS = {
  // Core payment processing
  payments: {
    name: 'Payments',
    description: 'Accept payments online and in person',
    priority: 'essential',
    dataObjects: ['charges', 'payment_intents', 'payment_methods'],
    schemaTables: ['charges', 'payment_intents', 'payment_methods'],
    triggers: ['payment', 'transaction', 'checkout', 'e-commerce', 'retail']
  },
  
  // Subscription management
  billing: {
    name: 'Billing',
    description: 'Subscription and recurring billing management',
    priority: 'essential',
    dataObjects: ['subscriptions', 'invoices', 'customers', 'plans', 'subscription_items'],
    schemaTables: ['subscriptions', 'invoices', 'customers', 'plans', 'subscription_items'],
    triggers: ['subscription', 'recurring', 'membership', 'saas', 'billing']
  },
  
  // Marketplace payments
  connect: {
    name: 'Connect',
    description: 'Platform payments and marketplace functionality',
    priority: 'essential',
    dataObjects: ['accounts', 'transfers', 'application_fees', 'charges'],
    schemaTables: ['accounts', 'transfers', 'application_fees', 'charges'],
    triggers: ['marketplace', 'platform', 'payouts', 'commission', 'multi-party', 'connect']
  },
  
  // Tax calculation
  tax: {
    name: 'Tax',
    description: 'Automated tax calculation and reporting',
    priority: 'recommended',
    dataObjects: ['tax_rates', 'tax_transactions', 'tax_calculations'],
    schemaTables: ['tax_rates', 'tax_transactions', 'tax_calculations'],
    triggers: ['e-commerce', 'retail', 'physical goods', 'tax compliance', 'sales tax']
  },
  
  // Fraud prevention
  radar: {
    name: 'Radar',
    description: 'Machine learning fraud prevention',
    priority: 'recommended',
    dataObjects: ['disputes', 'review_events', 'early_fraud_warnings'],
    schemaTables: ['disputes', 'review_events', 'early_fraud_warnings'],
    triggers: ['high-value', 'fraud risk', 'chargebacks', 'marketplace', 'b2b', 'security']
  },
  
  // Identity verification
  identity: {
    name: 'Identity',
    description: 'Identity verification and KYC',
    priority: 'recommended',
    dataObjects: ['verification_sessions', 'verification_reports', 'identity_verification_sessions'],
    schemaTables: ['verification_sessions', 'verification_reports', 'identity_verification_sessions'],
    triggers: ['financial services', 'age-restricted', 'kyc', 'compliance', 'high-risk', 'identity']
  },
  
  // Terminal for in-person payments
  terminal: {
    name: 'Terminal',
    description: 'In-person payment processing',
    priority: 'optional',
    dataObjects: ['terminal_locations', 'terminal_readers', 'terminal_connection_tokens'],
    schemaTables: ['terminal_locations', 'terminal_readers', 'terminal_connection_tokens'],
    triggers: ['retail', 'physical location', 'pos', 'in-person', 'brick-and-mortar', 'terminal']
  },
  
  // Financial data
  financial_connections: {
    name: 'Financial Connections',
    description: 'Connect to customer bank accounts',
    priority: 'optional',
    dataObjects: ['financial_connections_accounts', 'financial_connections_sessions'],
    schemaTables: ['financial_connections_accounts', 'financial_connections_sessions'],
    triggers: ['banking', 'account verification', 'financial data', 'p2p', 'lending', 'bank account']
  },
  
  // Issuing for cards
  issuing: {
    name: 'Issuing',
    description: 'Create and manage physical and virtual cards',
    priority: 'optional',
    dataObjects: ['issuing_cards', 'issuing_authorizations', 'issuing_cardholders'],
    schemaTables: ['issuing_cards', 'issuing_authorizations', 'issuing_cardholders'],
    triggers: ['corporate', 'expense management', 'prepaid', 'virtual cards', 'b2b', 'card']
  },
  
  // Treasury for banking
  treasury: {
    name: 'Treasury',
    description: 'Banking-as-a-Service and financial infrastructure',
    priority: 'optional',
    dataObjects: ['treasury_financial_accounts', 'treasury_transactions', 'treasury_received_credits'],
    schemaTables: ['treasury_financial_accounts', 'treasury_transactions', 'treasury_received_credits'],
    triggers: ['banking', 'financial services', 'neobank', 'fintech', 'treasury', 'banking infrastructure']
  }
};

export interface StripeProduct {
  name: string;
  description: string;
  priority: 'essential' | 'recommended' | 'optional';
  dataObjects: string[];
  schemaTables: string[];
  triggers: string[];
}

export interface StripeAnalysisResult {
  recommendedProducts: StripeProduct[];
  allDataObjects: string[];
  allSchemaTables: string[];
  businessType: string;
  analysisText: string;
}

// Function to analyze which Stripe products a persona would use
export function analyzeStripeProducts(persona: any): StripeAnalysisResult {
  const businessContext = persona.businessContext || {};
  const keyFeatures = persona.keyFeatures || [];
  const entities = persona.entities || [];
  const monetizationModel = businessContext.monetizationModel || '';
  const businessType = businessContext.type || '';
  const stage = businessContext.stage || '';
  
  // Combine all text for analysis
  const analysisText = [
    businessType,
    monetizationModel,
    stage,
    ...keyFeatures,
    ...entities.map((e: any) => e.name),
    ...entities.flatMap((e: any) => e.properties?.map((p: any) => p.description) || [])
  ].join(' ').toLowerCase();
  
  const recommendedProducts: StripeProduct[] = [];
  
  // Always include Payments as essential
  recommendedProducts.push({
    name: STRIPE_PRODUCTS.payments.name,
    description: STRIPE_PRODUCTS.payments.description,
    priority: 'essential',
    dataObjects: STRIPE_PRODUCTS.payments.dataObjects,
    schemaTables: STRIPE_PRODUCTS.payments.schemaTables,
    triggers: STRIPE_PRODUCTS.payments.triggers
  });
  
  // Analyze each Stripe product based on persona-specific requirements
  Object.entries(STRIPE_PRODUCTS).forEach(([key, product]) => {
    if (key === 'payments') return; // Already added
    
    let shouldInclude = false;
    let priority: 'essential' | 'recommended' | 'optional' = 'optional';
    
    // Persona-specific analysis
    if (persona.name === 'Checkout e-commerce') {
      // E-commerce: payments + tax + radar
      if (key === 'tax') {
        shouldInclude = true;
        priority = 'recommended';
      } else if (key === 'radar') {
        shouldInclude = true;
        priority = 'recommended';
      }
    } else if (persona.name === 'B2B SaaS subscriptions') {
      // B2B SaaS: payments + billing + radar
      if (key === 'billing') {
        shouldInclude = true;
        priority = 'essential';
      } else if (key === 'radar') {
        shouldInclude = true;
        priority = 'recommended';
      }
    } else if (persona.name === 'Food delivery platform') {
      // Marketplace: payments + connect + tax
      if (key === 'connect') {
        shouldInclude = true;
        priority = 'essential';
      } else if (key === 'tax') {
        shouldInclude = true;
        priority = 'recommended';
      }
    } else if (persona.name === 'Consumer fitness app') {
      // Consumer app: payments + billing + tax + elements
      if (key === 'billing') {
        shouldInclude = true;
        priority = 'essential';
      } else if (key === 'tax') {
        shouldInclude = true;
        priority = 'recommended';
      } else if (key === 'elements') {
        shouldInclude = true;
        priority = 'recommended';
      }
    } else if (persona.name === 'B2B invoicing') {
      // B2B invoicing: payments + billing + tax
      if (key === 'billing') {
        shouldInclude = true;
        priority = 'essential';
      } else if (key === 'tax') {
        shouldInclude = true;
        priority = 'recommended';
      }
    } else if (persona.name === 'Property management platform') {
      // Property management: payments + billing + tax
      if (key === 'billing') {
        shouldInclude = true;
        priority = 'essential';
      } else if (key === 'tax') {
        shouldInclude = true;
        priority = 'recommended';
      }
    } else if (persona.name === 'Creator platform') {
      // Creator platform: payments + connect + billing
      if (key === 'connect') {
        shouldInclude = true;
        priority = 'essential';
      } else if (key === 'billing') {
        shouldInclude = true;
        priority = 'recommended';
      }
    } else if (persona.name === 'Donation marketplace') {
      // Nonprofit: payments + connect + tax
      if (key === 'connect') {
        shouldInclude = true;
        priority = 'essential';
      } else if (key === 'tax') {
        shouldInclude = true;
        priority = 'recommended';
      }
    }
    
    if (shouldInclude) {
      recommendedProducts.push({
        name: product.name,
        description: product.description,
        priority,
        dataObjects: product.dataObjects,
        schemaTables: product.schemaTables,
        triggers: product.triggers
      });
    }
  });
  
  // Sort by priority
  const priorityOrder = { essential: 0, recommended: 1, optional: 2 };
  recommendedProducts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  // Collect all data objects and schema tables
  const allDataObjects = Array.from(new Set(recommendedProducts.flatMap(p => p.dataObjects)));
  const allSchemaTables = Array.from(new Set(recommendedProducts.flatMap(p => p.schemaTables)));
  
  return {
    recommendedProducts,
    allDataObjects,
    allSchemaTables,
    businessType,
    analysisText
  };
}

// Function to get Stripe product details by key
export function getStripeProductDetails(productKey: string): StripeProduct | null {
  const product = STRIPE_PRODUCTS[productKey as keyof typeof STRIPE_PRODUCTS];
  if (!product) return null;
  
  return {
    ...product,
    priority: product.priority as 'essential' | 'recommended' | 'optional'
  };
}

// Function to get all Stripe products
export function getAllStripeProducts(): typeof STRIPE_PRODUCTS {
  return STRIPE_PRODUCTS;
}

// Function to generate Stripe integration recommendations
export function generateStripeIntegrationRecommendations(persona: any): string {
  const analysis = analyzeStripeProducts(persona);
  
  let recommendations = `# Stripe Integration Recommendations for ${analysis.businessType}\n\n`;
  
  recommendations += `## Essential Products\n`;
  const essential = analysis.recommendedProducts.filter(p => p.priority === 'essential');
  essential.forEach(product => {
    recommendations += `- **${product.name}**: ${product.description}\n`;
    recommendations += `  - Data Objects: ${product.dataObjects.join(', ')}\n`;
  });
  
  if (analysis.recommendedProducts.filter(p => p.priority === 'recommended').length > 0) {
    recommendations += `\n## Recommended Products\n`;
    const recommended = analysis.recommendedProducts.filter(p => p.priority === 'recommended');
    recommended.forEach(product => {
      recommendations += `- **${product.name}**: ${product.description}\n`;
      recommendations += `  - Data Objects: ${product.dataObjects.join(', ')}\n`;
    });
  }
  
  if (analysis.recommendedProducts.filter(p => p.priority === 'optional').length > 0) {
    recommendations += `\n## Optional Products\n`;
    const optional = analysis.recommendedProducts.filter(p => p.priority === 'optional');
    optional.forEach(product => {
      recommendations += `- **${product.name}**: ${product.description}\n`;
      recommendations += `  - Data Objects: ${product.dataObjects.join(', ')}\n`;
    });
  }
  
  recommendations += `\n## Implementation Priority\n`;
  recommendations += `1. Start with essential products for core functionality\n`;
  recommendations += `2. Add recommended products as you scale\n`;
  recommendations += `3. Consider optional products for advanced features\n`;
  
  return recommendations;
}
