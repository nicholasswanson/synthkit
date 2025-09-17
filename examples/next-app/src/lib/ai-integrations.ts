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

// Cursor Integration - Human-readable prompt for AI assistance
export function generateCursorPrompt(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const prompt = `I have an existing ${businessContext.name.toLowerCase()} prototype and need to integrate a Synthkit dataset to replace my mock data with realistic data.

**Integration Details:**
- Dataset URL: ${url}
- Contains: ${recordSummary}
- Type: ${datasetInfo.type === 'scenario' ? 'Predefined scenario' : 'AI-generated from business description'}
- Business Context: ${businessContext.name} (${businessContext.domain})

${datasetInfo.scenario ? `**Scenario Configuration:**
- Category: ${datasetInfo.scenario.category}
- Stage: ${datasetInfo.scenario.stage} (affects data volume)
- Role: ${datasetInfo.scenario.role} (affects access patterns)
- ID: ${datasetInfo.scenario.id} (ensures deterministic data)` : `**AI-Generated Context:**
- Original Prompt: "${datasetInfo.aiAnalysis?.prompt}"
- Business Type: ${datasetInfo.aiAnalysis?.businessType}
- Custom entities based on AI analysis`}

**Integration Requirements:**
1. **Use the provided React hook** - I already have a useSynthkitDataset() hook that fetches this dataset
2. **Replace existing mock data** - Update my existing components to use the dataset instead of hardcoded data
3. **Maintain existing UI** - Don't change my prototype's design, just populate it with real data
4. **Handle data structure** - The dataset has ${Object.keys(datasetInfo.recordCounts).join(', ')} with realistic relationships
5. **Preserve functionality** - Keep all existing features, just swap the data source

**Dataset characteristics:**
- Static JSON file (fast, reliable, cached)
- Deterministic (same URL = same data every time)
- Production-ready with realistic relationships
- Currency values in cents, percentages to hundredths
- No authentication required

**What I need help with:**
- How to integrate the useSynthkitDataset() hook into my existing components
- How to map the dataset structure to my current data expectations
- How to handle the data loading states in my existing UI
- How to access business metrics for my existing dashboard components
- How to ensure my existing functionality works with the new data structure

Please focus on **integration guidance** - how to connect the dataset to my existing prototype without changing the UI or core functionality.`;

  return {
    tool: 'Cursor',
    description: 'AI-powered code editor with context-aware assistance',
    code: prompt,
    instructions: 'Use this prompt in Cursor to get integration guidance for connecting the Synthkit dataset to your existing prototype without changing the UI.',
    copyText: prompt
  };
}

// Cursor Integration - Optimized for AI-powered development
export function generateCursorIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const cursorRules = `// Add to your .cursorrules file for better AI context:

// Synthkit Dataset Integration
// Dataset: ${businessContext.name} (${businessContext.domain})
// Contains: ${recordSummary}
// URL: ${url}

${datasetInfo.scenario ? `// Scenario Configuration:
// - Category: ${datasetInfo.scenario.category} (${businessContext.name})
// - Stage: ${datasetInfo.scenario.stage} (affects data volume)
// - Role: ${datasetInfo.scenario.role} (affects access patterns)
// - ID: ${datasetInfo.scenario.id} (ensures deterministic data)` : `// AI-Generated Dataset:
// - Original Prompt: "${datasetInfo.aiAnalysis?.prompt}"
// - Business Type: ${datasetInfo.aiAnalysis?.businessType}
// - Custom entities based on AI analysis`}

// Dataset Characteristics:
// - Static JSON file (cached, reliable, fast)
// - Production-ready with realistic relationships
// - Formatted values: currency in cents, percentages to hundredths
// - Deterministic: same URL = identical data every time
// - No authentication required, publicly accessible

// Integration Pattern:
// 1. Fetch once on component mount or user selection change
// 2. Cache the result for performance
// 3. Use TypeScript interfaces for type safety
// 4. Handle loading and error states properly

const dataset = await fetch('${url}').then(r => r.json());
const { ${Object.keys(datasetInfo.recordCounts).join(', ')}, businessMetrics } = dataset.data;`;

  const integrationCode = `// Synthkit Dataset Integration for ${businessContext.name}
import { useState, useEffect } from 'react';

${generateTypeScriptInterfaces(datasetInfo.recordCounts)}

export function useSynthkitDataset() {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch static dataset - only runs once per component mount
    fetch('${url}')
      .then(response => {
        if (!response.ok) {
          throw new Error(\`Failed to load dataset: HTTP \${response.status}\`);
        }
        return response.json();
      })
      .then(dataset => {
        setData(dataset.data);
        setLoading(false);
        console.log('📊 Synthkit dataset loaded:', {
          ${Object.keys(datasetInfo.recordCounts).map(key => `${key}: dataset.data.${key}?.length || 0`).join(',\n          ')}
        });
      })
      .catch(err => {
        setError(err);
        setLoading(false);
        console.error('❌ Dataset loading failed:', err);
      });
  }, []); // Empty dependency array - fetch only once

  return { data, loading, error };
}

// Usage in your component:
export function MyPrototype() {
  const { data, loading, error } = useSynthkitDataset();

  if (loading) return <div>Loading ${recordSummary}...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h1>${businessContext.name} Prototype</h1>
      ${Object.keys(datasetInfo.recordCounts).map(key => 
        `<p>{data.${key}?.length || 0} ${key}</p>`
      ).join('\n      ')}
      <p>CLV: \${data.businessMetrics.customerLifetimeValue.toFixed(2)}</p>
    </div>
  );
}`;

  return {
    tool: 'Cursor',
    description: 'AI-powered code editor with context-aware assistance',
    code: integrationCode,
    instructions: 'Copy the React hook code into your project. Add the .cursorrules content to your project root for better AI assistance context.',
    copyText: cursorRules
  };
}

// Claude Integration - Optimized for detailed development assistance
export function generateClaudeIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const prompt = `I have an existing ${businessContext.name.toLowerCase()} prototype and need to integrate a Synthkit dataset to replace my mock data with realistic data.

**Integration Information:**
- Dataset URL: ${url}
- Type: ${datasetInfo.type === 'scenario' ? 'Predefined scenario' : 'AI-generated from business description'}
- Domain: ${businessContext.domain}
- Business Context: ${businessContext.name}

**Data Structure:**
${Object.entries(datasetInfo.recordCounts).map(([key, count]) => 
  `- ${key}: ${count.toLocaleString()} records with realistic properties`
).join('\n')}
- businessMetrics: CLV, AOV, MRR, DAU, conversion rate (all properly formatted)

${datasetInfo.scenario ? `**Scenario Details:**
- Category: ${datasetInfo.scenario.category} (${businessContext.name})
- Business Stage: ${datasetInfo.scenario.stage} (affects data volume and complexity)
- User Role: ${datasetInfo.scenario.role} (affects data access patterns)
- Deterministic ID: ${datasetInfo.scenario.id} (ensures reproducible data)` : `**AI-Generated Context:**
- Original Business Description: "${datasetInfo.aiAnalysis?.prompt}"
- Detected Business Type: ${datasetInfo.aiAnalysis?.businessType}
- Custom entities generated based on the business description`}

**Dataset Characteristics:**
- Static JSON file hosted on GitHub Pages (fast, reliable, cached)
- Production-ready with realistic relationships between entities
- Properly formatted values: currency in cents ($123.45), percentages to hundredths (5.67%)
- Deterministic: same URL always returns identical data
- No authentication required, publicly accessible
- Perfect for prototyping without backend setup

**Integration Requirements:**
1. **Use existing React hook** - I already have a useSynthkitDataset() hook that fetches this dataset
2. **Replace mock data** - Update my existing components to use the dataset instead of hardcoded data
3. **Maintain existing UI** - Don't change my prototype's design, just populate it with real data
4. **Handle data mapping** - Map the dataset structure to my current data expectations
5. **Preserve functionality** - Keep all existing features, just swap the data source
6. **Handle loading states** - Integrate loading states into my existing UI components

**What I need help with:**
- How to integrate the useSynthkitDataset() hook into my existing components
- How to map the dataset structure to my current data expectations
- How to handle the data loading states in my existing UI
- How to access business metrics for my existing dashboard components
- How to ensure my existing functionality works with the new data structure
- How to handle data relationships and filtering in my existing components

**Expected Integration Pattern:**
\`\`\`javascript
const { data, loading, error } = useSynthkitDataset('${url}');
// Replace my existing mock data with: data.customers, data.payments, etc.
\`\`\`

Please focus on **integration guidance** - how to connect the dataset to my existing prototype without changing the UI or core functionality.`;

  return {
    tool: 'Claude',
    description: 'AI assistant for detailed development guidance',
    code: prompt,
    instructions: 'Use this detailed prompt in Claude for comprehensive integration guidance with explanations, best practices, and complete code examples.',
    copyText: prompt
  };
}

// ChatGPT Integration - Optimized for quick, practical solutions
export function generateChatGPTIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const prompt = `I have an existing React ${businessContext.name.toLowerCase()} prototype and need to integrate a Synthkit dataset to replace my mock data.

**Dataset URL:** ${url}
**Contains:** ${Object.entries(datasetInfo.recordCounts).map(([key, count]) => `${count.toLocaleString()} ${key}`).join(', ')}, plus business metrics

${datasetInfo.aiAnalysis ? `**Context:** AI-generated dataset from "${datasetInfo.aiAnalysis.prompt}"` : `**Context:** ${businessContext.name} scenario with ${datasetInfo.scenario?.stage} stage data`}

**Integration Requirements:**
1. **Use existing React hook** - I already have a useSynthkitDataset() hook that fetches this dataset
2. **Replace mock data** - Update my existing components to use the dataset instead of hardcoded data
3. **Maintain existing UI** - Don't change my prototype's design, just populate it with real data
4. **Handle data mapping** - Map the dataset structure to my current data expectations
5. **Preserve functionality** - Keep all existing features, just swap the data source

**Dataset characteristics:**
- Static JSON hosted on GitHub Pages
- Deterministic (same URL = same data)
- Production-ready with realistic relationships
- Currency values in cents, percentages to hundredths
- No authentication needed

**Integration pattern:**
\`\`\javascript
const { data, loading, error } = useSynthkitDataset('${url}');
// Replace my existing mock data with: data.customers, data.payments, etc.
\`\`\`

Please focus on **integration guidance** - how to connect the dataset to my existing prototype without changing the UI or core functionality.`;

  return {
    tool: 'ChatGPT',
    description: 'AI assistant for quick coding solutions',
    code: prompt,
    instructions: 'Use this focused prompt in ChatGPT for a quick, practical integration solution with all the essentials.',
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

  const entityList = Object.keys(datasetInfo.recordCounts).join(', ');

  const prompt = `Create a modern, professional dashboard component for a ${businessContext.name.toLowerCase()} prototype that integrates with a static Synthkit dataset.

**Dataset Integration:**
- URL: ${url}
- Contains: ${recordSummary}
- Static JSON file (reliable, fast, cached)
- Production-ready with realistic business relationships

**Component Requirements:**
1. **Data Fetching**: Fetch the static dataset on component mount with proper error handling
2. **Loading State**: Show skeleton loaders while data loads
3. **Metrics Cards**: Display key business metrics (CLV, AOV, MRR, DAU, conversion rate) in attractive cards
4. **Data Tables**: Show ${entityList} in clean, paginated tables (10 items per page)
5. **Responsive Design**: Works on desktop and mobile
6. **Error Handling**: Graceful error states with retry options
7. **Professional Styling**: Modern ${businessContext.domain} application aesthetic

**Data Structure to Expect:**
\`\`\`typescript
{
  data: {
    ${Object.keys(datasetInfo.recordCounts).map(key => {
      if (key === 'customers') return `${key}: Array<{id: string, name: string, email: string, loyaltyTier: string}>`;
      if (key === 'payments') return `${key}: Array<{id: string, amount: number, status: string, paymentMethod: string}>`;
      return `${key}: Array<{id: string, [key: string]: any}>`;
    }).join(',\n    ')}
    businessMetrics: {
      customerLifetimeValue: number,
      averageOrderValue: number, 
      monthlyRecurringRevenue: number,
      dailyActiveUsers: number,
      conversionRate: number
    }
  }
}
\`\`\`

**Design Guidelines:**
- Use a clean, modern card-based layout
- Implement proper spacing and typography
- Add subtle shadows and borders
- Use appropriate colors for ${businessContext.domain} (professional, trustworthy)
- Include icons for different data types
- Make tables sortable and searchable
- Format currency values properly ($123.45)
- Format percentages properly (12.34%)

**Technical Notes:**
- The dataset URL is static and deterministic (same URL = same data)
- No authentication required
- Cache the data after first fetch
- Handle network errors gracefully
- Use React hooks for state management

Generate a complete, production-ready component that I can copy-paste into my React project.`;

  return {
    tool: 'v0',
    description: 'AI component generator by Vercel',
    code: prompt,
    instructions: 'Paste this detailed prompt in v0.dev to generate a complete, professional dashboard component with proper Synthkit dataset integration.',
    copyText: prompt
  };
}

// Fetch API Integration - Direct JavaScript implementation
export function generateFetchIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const entityKeys = Object.keys(datasetInfo.recordCounts);

  const code = `// Synthkit Dataset Manager for ${businessContext.name}
// Handles static dataset fetching, caching, and utilities

class SynthkitDataset {
  constructor(datasetUrl) {
    this.url = datasetUrl;
    this.cache = null;
    this.loading = false;
    this.lastFetch = null;
  }

  async fetchData() {
    // Return cached data if available (static datasets don't change)
    if (this.cache) {
      console.log('📊 Using cached Synthkit dataset');
      return this.cache;
    }
    
    // Prevent concurrent fetches
    if (this.loading) {
      console.log('⏳ Dataset fetch already in progress...');
      return null;
    }
    
    this.loading = true;
    console.log('🔄 Fetching Synthkit dataset from:', this.url);
    
    try {
      const response = await fetch(this.url);
      
      if (!response.ok) {
        throw new Error(\`Failed to fetch dataset: HTTP \${response.status} \${response.statusText}\`);
      }
      
      const dataset = await response.json();
      
      // Validate dataset structure
      if (!dataset.data) {
        throw new Error('Invalid dataset format: missing data property');
      }
      
      this.cache = dataset.data;
      this.lastFetch = new Date();
      
      // Log dataset summary
      console.log('✅ Synthkit dataset loaded successfully:', {
        ${entityKeys.map(key => `${key}: this.cache.${key}?.length || 0`).join(',\n        ')},
        businessMetrics: !!this.cache.businessMetrics,
        fetchedAt: this.lastFetch.toISOString()
      });
      
      return this.cache;
      
    } catch (error) {
      console.error('❌ Synthkit dataset fetch failed:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Get all data entities
  getData() {
    return this.cache;
  }

  // Get specific entity by name
  getEntity(entityName) {
    return this.cache?.[entityName] || [];
  }

  // Get business metrics
  getBusinessMetrics() {
    return this.cache?.businessMetrics || {};
  }

  // Utility: Find entity by ID
  findById(entityName, id) {
    const entities = this.getEntity(entityName);
    return entities.find(item => item.id === id);
  }

  // Utility: Filter entities by property
  filterBy(entityName, property, value) {
    const entities = this.getEntity(entityName);
    return entities.filter(item => item[property] === value);
  }

  // Utility: Get entity statistics
  getEntityStats(entityName) {
    const entities = this.getEntity(entityName);
    if (!entities.length) return null;

    return {
      total: entities.length,
      sample: entities.slice(0, 3),
      properties: Object.keys(entities[0] || {})
    };
  }

  // Advanced: Calculate relationships (e.g., payments per customer)
  getRelationshipStats() {
    if (!this.cache) return null;

    const stats = {};
    
    // Example: If we have customers and payments
    if (this.cache.customers && this.cache.payments) {
      const paymentsByCustomer = {};
      this.cache.payments.forEach(payment => {
        const customerId = payment.customerId;
        if (customerId) {
          paymentsByCustomer[customerId] = (paymentsByCustomer[customerId] || 0) + 1;
        }
      });

      stats.avgPaymentsPerCustomer = Object.values(paymentsByCustomer).reduce((a, b) => a + b, 0) / this.cache.customers.length;
      stats.customersWithPayments = Object.keys(paymentsByCustomer).length;
    }

    return stats;
  }

  // Clear cache (useful for development/testing)
  clearCache() {
    this.cache = null;
    this.lastFetch = null;
    console.log('🗑️ Synthkit dataset cache cleared');
  }

  // Get dataset info
  getInfo() {
    return {
      url: this.url,
      cached: !!this.cache,
      lastFetch: this.lastFetch,
      entities: this.cache ? Object.keys(this.cache).filter(key => Array.isArray(this.cache[key])) : []
    };
  }
}

// Usage Examples for ${businessContext.name} Prototype

// 1. Basic Setup
const synthkit = new SynthkitDataset('${url}');

// 2. Load and display data
async function loadPrototypeData() {
  try {
    const data = await synthkit.fetchData();
    
    // Display entity counts
    ${entityKeys.map(key => `console.log('${key.charAt(0).toUpperCase() + key.slice(1)}:', data.${key}?.length || 0);`).join('\n    ')}
    
    // Display business metrics
    const metrics = synthkit.getBusinessMetrics();
    console.log('Customer Lifetime Value: $' + metrics.customerLifetimeValue?.toFixed(2));
    console.log('Monthly Recurring Revenue: $' + metrics.monthlyRecurringRevenue?.toFixed(2));
    console.log('Conversion Rate: ' + metrics.conversionRate?.toFixed(2) + '%');
    
    // Get relationship insights
    const relationships = synthkit.getRelationshipStats();
    console.log('Relationship Stats:', relationships);
    
  } catch (error) {
    console.error('Failed to load prototype data:', error);
  }
}

// 3. React Integration Example
function useReactIntegration() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    synthkit.fetchData()
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

// 4. Start your prototype
loadPrototypeData();

// Export for use in other modules
export default synthkit;`;

  return {
    tool: 'Fetch API',
    description: 'Complete JavaScript class for static dataset integration',
    code: code,
    instructions: 'Copy this SynthkitDataset class for vanilla JavaScript projects or as a foundation for framework integration. Includes caching, utilities, and React example.',
    copyText: code
  };
}

// Main function to generate all integrations
export function generateAllIntegrations(url: string, datasetInfo: DatasetInfo): IntegrationExample[] {
  return [
    generateCursorPrompt(url, datasetInfo),
    generateClaudeIntegration(url, datasetInfo),
    generateChatGPTIntegration(url, datasetInfo),
    generateV0Integration(url, datasetInfo),
    generateFetchIntegration(url, datasetInfo)
  ];
}
