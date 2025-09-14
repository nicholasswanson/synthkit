// AI Tool Integration Utilities
// Generates optimized code and prompts for different AI development tools

export interface DatasetInfo {
  type: 'scenario' | 'ai-generated';
  recordCounts: Record<string, number>;
  scenario?: {
    category: string;
    role: string;
    stage: string;
    id: number;
  };
  aiAnalysis?: {
    prompt: string;
    businessType?: string;
  };
}

export interface IntegrationExample {
  tool: string;
  description: string;
  code: string;
  instructions: string;
  copyText?: string; // Alternative text for copying (e.g., shorter version)
}

// Business context mapping for better AI understanding
const BUSINESS_CONTEXTS = {
  modaic: { name: 'Fashion E-commerce', domain: 'retail', complexity: 'medium' },
  stratus: { name: 'B2B SaaS Platform', domain: 'software', complexity: 'high' },
  forksy: { name: 'Food Delivery Marketplace', domain: 'marketplace', complexity: 'high' },
  fluxly: { name: 'Creator Economy Platform', domain: 'social', complexity: 'medium' },
  mindora: { name: 'Online Learning Platform', domain: 'education', complexity: 'medium' },
  pulseon: { name: 'Fitness & Wellness App', domain: 'health', complexity: 'medium' },
  procura: { name: 'Healthcare Supply Chain', domain: 'healthcare', complexity: 'high' },
  brightfund: { name: 'Impact Investment Platform', domain: 'finance', complexity: 'high' },
  keynest: { name: 'Real Estate Management', domain: 'real-estate', complexity: 'high' }
};

function getBusinessContext(category: string) {
  return BUSINESS_CONTEXTS[category as keyof typeof BUSINESS_CONTEXTS] || {
    name: category,
    domain: 'business',
    complexity: 'medium'
  };
}

function generateTypeScriptInterfaces(recordCounts: Record<string, number>): string {
  const interfaces = Object.keys(recordCounts).map(entityName => {
    const interfaceName = entityName.charAt(0).toUpperCase() + entityName.slice(1, -1); // Remove 's' and capitalize
    
    // Generate realistic interface based on entity type
    if (entityName === 'customers') {
      return `export interface ${interfaceName} {
  id: string;
  name: string;
  email: string;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold';
  createdAt: string;
}`;
    } else if (entityName === 'payments') {
      return `export interface ${interfaceName} {
  id: string;
  customerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  createdAt: string;
}`;
    } else {
      // Generic interface for AI-generated entities
      return `export interface ${interfaceName} {
  id: string;
  // Add properties based on your ${entityName} requirements
  createdAt: string;
}`;
    }
  }).join('\n\n');

  return `// Generated TypeScript interfaces for Synthkit dataset
${interfaces}

export interface BusinessMetrics {
  customerLifetimeValue: number;
  averageOrderValue: number;
  monthlyRecurringRevenue: number;
  dailyActiveUsers: number;
  conversionRate: number;
}

export interface Dataset {
${Object.keys(recordCounts).map(key => `  ${key}: ${key.charAt(0).toUpperCase() + key.slice(1, -1)}[];`).join('\n')}
  businessMetrics: BusinessMetrics;
}`;
}

// Cursor Integration - Optimized for AI-powered development
export function generateCursorIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const cursorRules = `// Add to your .cursorrules file:

// Synthkit Dataset Integration
// Dataset: ${businessContext.name} (${businessContext.domain})
// Contains: ${recordSummary}
// URL: ${url}

// Context for AI assistance:
${datasetInfo.scenario ? `
// Scenario: ${datasetInfo.scenario.category} ${datasetInfo.scenario.stage} stage
// Role: ${datasetInfo.scenario.role} access level
// Deterministic ID: ${datasetInfo.scenario.id}
` : `
// AI Generated from: "${datasetInfo.aiAnalysis?.prompt}"
// Business Type: ${datasetInfo.aiAnalysis?.businessType}
`}

// Integration instructions:
// 1. Use this dataset for realistic ${businessContext.domain} prototyping
// 2. Data is production-ready with proper relationships
// 3. All values are formatted correctly (currency, percentages, etc.)
// 4. Dataset is deterministic and reproducible

// Quick start:
const dataset = await fetch('${url}').then(r => r.json());
const { ${Object.keys(datasetInfo.recordCounts).join(', ')}, businessMetrics } = dataset.data;`;

  const integrationCode = `// Synthkit Dataset Integration for ${businessContext.name}
import { useState, useEffect } from 'react';

${generateTypeScriptInterfaces(datasetInfo.recordCounts)}

export function useDataset() {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('${url}')
      .then(response => {
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
        return response.json();
      })
      .then(dataset => {
        setData(dataset.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

// Usage example:
// const { data, loading, error } = useDataset();
// if (loading) return <div>Loading ${recordSummary}...</div>;
// if (error) return <div>Error: {error.message}</div>;
// return <div>Loaded {data?.customers.length} customers</div>;`;

  return {
    tool: 'Cursor',
    description: 'AI-powered code editor with context-aware assistance',
    code: integrationCode,
    instructions: 'Copy this code to get a complete React hook with TypeScript interfaces. Also add the .cursorrules content for better AI context.',
    copyText: cursorRules
  };
}

// Claude Integration - Optimized for detailed development assistance
export function generateClaudeIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const prompt = `I'm building a ${businessContext.name.toLowerCase()} application and need help integrating realistic mock data.

**Dataset Details:**
- URL: ${url}
- Type: ${datasetInfo.type === 'scenario' ? 'Scenario-based' : 'AI-generated'}
- Domain: ${businessContext.domain}
- Complexity: ${businessContext.complexity}

**Data Contents:**
${Object.entries(datasetInfo.recordCounts).map(([key, count]) => 
  `- ${key}: ${count.toLocaleString()} records`
).join('\n')}

${datasetInfo.scenario ? `
**Scenario Configuration:**
- Category: ${datasetInfo.scenario.category} (${businessContext.name})
- Business Stage: ${datasetInfo.scenario.stage}
- Access Role: ${datasetInfo.scenario.role}
- Deterministic ID: ${datasetInfo.scenario.id}
` : `
**AI-Generated Context:**
- Original Prompt: "${datasetInfo.aiAnalysis?.prompt}"
- Business Type: ${datasetInfo.aiAnalysis?.businessType}
`}

**What I need help with:**
1. Setting up a React hook to fetch and manage this data
2. Creating TypeScript interfaces for type safety
3. Implementing error handling and loading states
4. Building UI components to display the data effectively
5. Following best practices for ${businessContext.domain} applications

**Additional Context:**
- The data includes realistic business metrics (CLV, AOV, MRR, etc.)
- All monetary values are in cents (e.g., $123.45)
- All percentages are to hundredths (e.g., 5.67%)
- The dataset is production-ready with proper relationships
- Same URL always returns identical data (deterministic)

Please provide a comprehensive solution with explanations for each part.`;

  return {
    tool: 'Claude',
    description: 'AI assistant for detailed development guidance',
    code: prompt,
    instructions: 'Copy this comprehensive prompt to Claude for detailed integration help with explanations and best practices.',
    copyText: prompt
  };
}

// ChatGPT Integration - Optimized for quick, practical solutions
export function generateChatGPTIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const prompt = `Help me integrate this realistic ${businessContext.name.toLowerCase()} dataset into my React app:

Dataset: ${url}
Contains: ${Object.entries(datasetInfo.recordCounts).map(([key, count]) => `${count} ${key}`).join(', ')}

${datasetInfo.aiAnalysis ? `Business idea: "${datasetInfo.aiAnalysis.prompt}"` : ''}

I need:
1. React hook to fetch the data
2. TypeScript interfaces
3. Loading/error states
4. Basic display component

Keep it simple and production-ready. The data has realistic business metrics and proper formatting.`;

  return {
    tool: 'ChatGPT',
    description: 'AI assistant for quick coding solutions',
    code: prompt,
    instructions: 'Use this concise prompt in ChatGPT for a quick, practical integration solution.',
    copyText: prompt
  };
}

// v0 Integration - Optimized for component generation
export function generateV0Integration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const prompt = `Create a modern dashboard component for a ${businessContext.name.toLowerCase()} that fetches and displays data from: ${url}

The dataset contains: ${recordSummary}

Requirements:
- Fetch data on component mount
- Show loading state with skeleton
- Display key metrics in cards (customers, payments, revenue)
- Include a data table with pagination
- Use modern design with proper spacing
- Add error handling
- Make it responsive

The data structure includes:
- customers: array with id, name, email, loyaltyTier
- payments: array with id, amount, status, paymentMethod  
- businessMetrics: object with CLV, AOV, MRR, DAU, conversion rate

Style it professionally for a ${businessContext.domain} application.`;

  return {
    tool: 'v0',
    description: 'AI component generator by Vercel',
    code: prompt,
    instructions: 'Paste this prompt in v0.dev to generate a complete dashboard component with proper styling and functionality.',
    copyText: prompt
  };
}

// Fetch API Integration - Direct JavaScript implementation
export function generateFetchIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const code = `// ${businessContext.name} Dataset Integration
// Fetches realistic mock data for prototyping

class DatasetManager {
  constructor(datasetUrl) {
    this.url = datasetUrl;
    this.cache = null;
    this.loading = false;
  }

  async fetchData() {
    if (this.cache) return this.cache;
    if (this.loading) return null;
    
    this.loading = true;
    
    try {
      const response = await fetch(this.url);
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const dataset = await response.json();
      this.cache = dataset.data;
      
      console.log('📊 Dataset loaded:', {
        customers: dataset.data.customers?.length || 0,
        payments: dataset.data.payments?.length || 0,
        metrics: dataset.data.businessMetrics
      });
      
      return this.cache;
      
    } catch (error) {
      console.error('❌ Dataset fetch failed:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Utility methods for common operations
  getCustomerById(id) {
    return this.cache?.customers?.find(customer => customer.id === id);
  }

  getPaymentsByCustomer(customerId) {
    return this.cache?.payments?.filter(payment => payment.customerId === customerId) || [];
  }

  getMetrics() {
    return this.cache?.businessMetrics || {};
  }

  // Calculate additional insights
  getTopCustomers(limit = 10) {
    if (!this.cache?.customers || !this.cache?.payments) return [];
    
    const customerSpending = {};
    this.cache.payments.forEach(payment => {
      if (payment.status === 'completed') {
        customerSpending[payment.customerId] = 
          (customerSpending[payment.customerId] || 0) + payment.amount;
      }
    });

    return this.cache.customers
      .map(customer => ({
        ...customer,
        totalSpent: customerSpending[customer.id] || 0
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }
}

// Usage Example
const datasetManager = new DatasetManager('${url}');

// Load and use the data
datasetManager.fetchData().then(data => {
  console.log('Customers:', data.customers.length);
  console.log('Payments:', data.payments.length);
  console.log('CLV:', data.businessMetrics.customerLifetimeValue);
  
  // Get insights
  const topCustomers = datasetManager.getTopCustomers(5);
  console.log('Top customers:', topCustomers);
});

// For React/Vue/Angular, wrap in appropriate hooks/composables
export default datasetManager;`;

  return {
    tool: 'Fetch API',
    description: 'Direct JavaScript integration with utilities',
    code: code,
    instructions: 'Use this complete DatasetManager class for vanilla JavaScript or as a base for framework integration. Includes caching, error handling, and utility methods.',
    copyText: code
  };
}

// Main function to generate all integrations
export function generateAllIntegrations(url: string, datasetInfo: DatasetInfo): IntegrationExample[] {
  return [
    generateCursorIntegration(url, datasetInfo),
    generateClaudeIntegration(url, datasetInfo),
    generateChatGPTIntegration(url, datasetInfo),
    generateV0Integration(url, datasetInfo),
    generateFetchIntegration(url, datasetInfo)
  ];
}
