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
  'checkout-ecommerce': { name: 'Checkout e-commerce', domain: 'retail', complexity: 'medium' },
  'b2b-saas-subscriptions': { name: 'B2B SaaS subscriptions', domain: 'software', complexity: 'high' },
  'food-delivery-platform': { name: 'Food delivery platform', domain: 'marketplace', complexity: 'high' },
  'creator-platform': { name: 'Creator platform', domain: 'social', complexity: 'medium' },
  'consumer-fitness-app': { name: 'Consumer fitness app', domain: 'health', complexity: 'medium' },
  'b2b-invoicing': { name: 'B2B invoicing', domain: 'healthcare', complexity: 'high' },
  'donation-marketplace': { name: 'Donation marketplace', domain: 'finance', complexity: 'high' },
  'property-management-platform': { name: 'Property management platform', domain: 'real-estate', complexity: 'high' }
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

  const prompt = `Integrate this Synthkit dataset into my existing prototype by replacing mock data with realistic data.

**Dataset Information:**
- Zero Configuration: Works with \`getData()\` - no URLs needed!
- Entities: ${Object.entries(datasetInfo.recordCounts).map(([key, count]) => `${key} (${count.toLocaleString()} records)`).join(', ')}
- Business Metrics: CLV, AOV, MRR, DAU, conversion rate
- Stripe Data: Includes realistic Stripe objects (charges, subscriptions, invoices) with proper schema
- Smart Caching: Automatic data caching with invalidation

**Technical Integration:**
1. **Install Enhanced** - \`npm install @synthkit/enhanced\`
2. **Simple data access** - Use \`const result = await getData();\` for instant data
3. **React integration** - Use \`const { data, loading, error, customers, charges } = useSynthkit();\`
4. **Replace mock data** - Update components to use data from Enhanced instead of hardcoded values
5. **Preserve existing UI** - Keep all current components and styling, only change the data source
6. **Zero configuration** - No setup, no URLs, no environment variables needed

**Data Structure to Use:**
\`\`\`javascript
// Simple one-line data fetching
const result = await getData();
const { customers, charges, subscriptions, invoices, plans } = result.data;

// Or use React hook
const { data, loading, error, customers, charges, subscriptions, invoices, plans } = useSynthkit();
// Available: data.${Object.keys(datasetInfo.recordCounts).join(', data.')}, data.businessMetrics
// Stripe data: customers, charges, subscriptions, invoices, plans
\`\`\`

**Integration Steps:**
1. Install Enhanced: \`npm install @synthkit/enhanced\`
2. Import and use: \`import { getData } from '@synthkit/enhanced'\`
3. Get data: \`const result = await getData();\`
4. Access data: \`const { customers, charges, subscriptions, invoices, plans } = result.data;\`
5. For React: \`import { useSynthkit } from '@synthkit/enhanced/react'\`
6. Use hook: \`const { data, loading, error, customers, charges } = useSynthkit();\`
7. Handle states: Show loading/error UI as needed

**Stripe Integration Examples:**
- Display customers: \`customers.slice(0, 10).map(customer => ...)\`
- Show recent charges: \`charges.slice(0, 10).map(charge => ...)\`
- List active subscriptions: \`subscriptions.filter(sub => sub.status === 'active')\`
- Display recent invoices: \`invoices.slice(0, 5).map(invoice => ...)\`
- Show subscription plans: \`plans.map(plan => ...)\`
- Format amounts: \`\${(charge.amount / 100).toFixed(0)}\` (round numbers)

**Enhanced Features:**
- Zero dependencies - works everywhere
- Smart caching - automatic data caching
- Environment detection - works in browser, Node, Deno, Bun
- Always returns data - never breaks
- Universal compatibility - any JavaScript environment

Focus on **direct implementation** - show me exactly how to modify my existing components to use this dataset.`;

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

  const cursorRules = `# Synthkit Enhanced Integration Rules
# Add this to your .cursorrules file for optimal AI assistance

## Quick Start
\`\`\bash
npm install @synthkit/enhanced
\`\`\`

## Usage
\`\`\javascript
import { getData } from '@synthkit/enhanced';

// One line to get data
const result = await getData();
console.log(\`Got \${result.data.customers.length} customers!\`);
\`\`\`

## React Hook
\`\`\jsx
import { useSynthkit } from '@synthkit/enhanced/react';

function Dashboard() {
  const { data, loading, error, customers, charges } = useSynthkit();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Customers: {customers.length}</p>
      <p>Charges: {charges.length}</p>
    </div>
  );
}
\`\`\`

## Dataset Context
Zero Configuration: Works with \`getData()\` - no URLs needed!
Business Type: ${businessContext}
Data Volume: ${recordSummary}
${datasetInfo.type === 'scenario' ? `
Scenario Details:
- Category: ${datasetInfo.scenario?.category}
- Stage: ${datasetInfo.scenario?.stage}
- Role: ${datasetInfo.scenario?.role}
- ID: ${datasetInfo.scenario?.id}
` : `
AI Generated Context:
- Original Prompt: "${datasetInfo.aiAnalysis?.prompt}"
- Business Type: ${datasetInfo.aiAnalysis?.businessType}
`}

## Data Structure
- \`result.data.customers\` - Array of customer objects
- \`result.data.charges\` - Array of charge objects
- \`result.data.subscriptions\` - Array of subscription objects
- \`result.data.invoices\` - Array of invoice objects
- \`result.data.plans\` - Array of plan objects

## Features
- Zero dependencies
- Works everywhere (browser, Node, Deno, Bun)
- Always returns data (never breaks)
- Smart caching
- Environment auto-detection

// Common metrics for dashboards:
- Monthly Recurring Revenue (MRR)
- Payment Success Rate
- Active Subscribers
- Customer Lifetime Value
- Churn Rate
- Gross Payment Volume
- Failed Payment Rate
- Average Revenue Per User (ARPU)
- Net Volume
- Dispute Rate`;

  const integrationCode = `// Synthkit Enhanced Integration for ${businessContext.name}
// Install: npm install @synthkit/enhanced

import { getData } from '@synthkit/enhanced';
import { useSynthkit } from '@synthkit/enhanced/react';

// Simple one-line data fetching
export async function useSynthkitData() {
  const result = await getData();
  return {
    data: result.data,
    customers: result.data.customers,
    charges: result.data.charges,
    subscriptions: result.data.subscriptions || [],
    invoices: result.data.invoices || [],
    plans: result.data.plans || [],
    metadata: result.data.metadata,
    status: result.status,
    debug: result.debug
  };
}

// React hook version (if you prefer hooks)
export function useSynthkitDataset() {
  const { data, loading, error, customers, charges, subscriptions, invoices, plans } = useSynthkit();
  
  return { 
    data, 
    loading, 
    error, 
    customers,
    charges,
    subscriptions,
    invoices,
    plans
  };
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

  const prompt = `Integrate this Synthkit dataset into my existing prototype by replacing mock data with realistic data.

**Dataset Information:**
- Zero Configuration: Works with \`getData()\` - no URLs needed!
- Entities: ${Object.entries(datasetInfo.recordCounts).map(([key, count]) => `${key} (${count.toLocaleString()} records)`).join(', ')}
- Business Metrics: CLV, AOV, MRR, DAU, conversion rate
- Stripe Data: Includes realistic Stripe objects (charges, subscriptions, invoices) with proper schema
- Smart Caching: Automatic data caching with invalidation

**Technical Integration:**
1. **Install Enhanced** - \`npm install @synthkit/enhanced\`
2. **Simple data access** - Use \`const result = await getData();\` for instant data
3. **React integration** - Use \`const { data, loading, error, customers, charges } = useSynthkit();\`
4. **Replace mock data** - Update components to use data from Enhanced instead of hardcoded values
5. **Preserve existing UI** - Keep all current components and styling, only change the data source
6. **Zero configuration** - No setup, no URLs, no environment variables needed

**Data Structure to Use:**
\`\`\`javascript
// Simple one-line data fetching
const result = await getData();
const { customers, charges, subscriptions, invoices, plans } = result.data;

// Or use React hook
const { data, loading, error, customers, charges, subscriptions, invoices, plans } = useSynthkit();
// Available: data.${Object.keys(datasetInfo.recordCounts).join(', data.')}, data.businessMetrics
// Stripe data: customers, charges, subscriptions, invoices, plans
\`\`\`

**Integration Steps:**
1. Install Enhanced: \`npm install @synthkit/enhanced\`
2. Import and use: \`import { getData } from '@synthkit/enhanced'\`
3. Get data: \`const result = await getData();\`
4. Access data: \`const { customers, charges, subscriptions, invoices, plans } = result.data;\`
5. For React: \`import { useSynthkit } from '@synthkit/enhanced/react'\`
6. Use hook: \`const { data, loading, error, customers, charges } = useSynthkit();\`
7. Handle states: Show loading/error UI as needed

**Stripe Integration Examples:**
- Display customers: \`customers.slice(0, 10).map(customer => ...)\`
- Show recent charges: \`charges.slice(0, 10).map(charge => ...)\`
- List active subscriptions: \`subscriptions.filter(sub => sub.status === 'active')\`
- Display recent invoices: \`invoices.slice(0, 5).map(invoice => ...)\`
- Show subscription plans: \`plans.map(plan => ...)\`
- Format amounts: \`\${(charge.amount / 100).toFixed(0)}\` (round numbers)

**Enhanced Features:**
- Zero dependencies - works everywhere
- Smart caching - automatic data caching
- Environment detection - works in browser, Node, Deno, Bun
- Always returns data - never breaks
- Universal compatibility - any JavaScript environment

Focus on **direct implementation** - show me exactly how to modify my existing components to use this dataset.`;

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

  const prompt = `Integrate this Synthkit dataset into my existing prototype by replacing mock data with realistic data.

**Dataset Information:**
- Zero Configuration: Works with \`getData()\` - no URLs needed!
- Entities: ${Object.entries(datasetInfo.recordCounts).map(([key, count]) => `${key} (${count.toLocaleString()} records)`).join(', ')}
- Business Metrics: CLV, AOV, MRR, DAU, conversion rate
- Stripe Data: Includes realistic Stripe objects (charges, subscriptions, invoices) with proper schema
- Smart Caching: Automatic data caching with invalidation

**Technical Integration:**
1. **Install Enhanced** - \`npm install @synthkit/enhanced\`
2. **Simple data access** - Use \`const result = await getData();\` for instant data
3. **React integration** - Use \`const { data, loading, error, customers, charges } = useSynthkit();\`
4. **Replace mock data** - Update components to use data from Enhanced instead of hardcoded values
5. **Preserve existing UI** - Keep all current components and styling, only change the data source
6. **Zero configuration** - No setup, no URLs, no environment variables needed

**Data Structure to Use:**
\`\`\`javascript
// Simple one-line data fetching
const result = await getData();
const { customers, charges, subscriptions, invoices, plans } = result.data;

// Or use React hook
const { data, loading, error, customers, charges, subscriptions, invoices, plans } = useSynthkit();
// Available: data.${Object.keys(datasetInfo.recordCounts).join(', data.')}, data.businessMetrics
// Stripe data: customers, charges, subscriptions, invoices, plans
\`\`\`

**Integration Steps:**
1. Install Enhanced: \`npm install @synthkit/enhanced\`
2. Import and use: \`import { getData } from '@synthkit/enhanced'\`
3. Get data: \`const result = await getData();\`
4. Access data: \`const { customers, charges, subscriptions, invoices, plans } = result.data;\`
5. For React: \`import { useSynthkit } from '@synthkit/enhanced/react'\`
6. Use hook: \`const { data, loading, error, customers, charges } = useSynthkit();\`
7. Handle states: Show loading/error UI as needed

**Stripe Integration Examples:**
- Display customers: \`customers.slice(0, 10).map(customer => ...)\`
- Show recent charges: \`charges.slice(0, 10).map(charge => ...)\`
- List active subscriptions: \`subscriptions.filter(sub => sub.status === 'active')\`
- Display recent invoices: \`invoices.slice(0, 5).map(invoice => ...)\`
- Show subscription plans: \`plans.map(plan => ...)\`
- Format amounts: \`\${(charge.amount / 100).toFixed(0)}\` (round numbers)

**Enhanced Features:**
- Zero dependencies - works everywhere
- Smart caching - automatic data caching
- Environment detection - works in browser, Node, Deno, Bun
- Always returns data - never breaks
- Universal compatibility - any JavaScript environment

Focus on **direct implementation** - show me exactly how to modify my existing components to use this dataset.`;

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

  const prompt = `Create a modern dashboard component for ${businessContext.name} that displays realistic business data.

**Component Requirements:**
- Clean, modern UI with Tailwind CSS
- Responsive design that works on mobile and desktop
- Loading and error states
- Data visualization (charts, tables, cards)
- Professional styling with good UX

**Data to Display:**
- ${recordSummary}
- Business metrics: CLV, AOV, MRR, conversion rate
- Recent activity and trends
- Key performance indicators

**Technical Notes:**
- Use React hooks for state management
- Include proper TypeScript types
- Add hover effects and animations
- Make it look production-ready
- Use realistic sample data that matches the business context

**Sample Data Structure:**
\`\`\`javascript
const sampleData = {
  customers: [
    { id: 1, name: "Sarah Johnson", email: "sarah@example.com", totalSpent: 1250, status: "active" },
    { id: 2, name: "Mike Chen", email: "mike@example.com", totalSpent: 890, status: "active" }
  ],
  charges: [
    { id: 1, amount: 2500, status: "succeeded", created: "2024-01-15" },
    { id: 2, amount: 1200, status: "succeeded", created: "2024-01-14" }
  ],
  businessMetrics: {
    customerLifetimeValue: 1250,
    averageOrderValue: 89.50,
    monthlyRecurringRevenue: 45000,
    conversionRate: 3.2
  }
};
\`\`\`

**After generating this component in v0:**
1. Copy the generated code to your local project
2. Run: \`npm install @synthkit/enhanced\`
3. Replace sample data with: \`const { data, loading, error } = useSynthkit();\`
4. Add the import: \`import { useSynthkit } from '@synthkit/enhanced/react';\`

Focus on creating a **beautiful, functional component** that showcases the data effectively.`;

  return {
    tool: 'v0',
    description: 'AI component generator by Vercel',
    code: prompt,
    instructions: 'Use this prompt in v0.dev to generate a beautiful dashboard component. After generation, copy to your local project and follow the setup steps.',
    copyText: prompt
  };
}

// Fetch API Integration - Direct JavaScript implementation
export function generateFetchIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const entityKeys = Object.keys(datasetInfo.recordCounts);

  const code = `// Synthkit Enhanced Integration for ${businessContext.name}
// Install: npm install @synthkit/enhanced

import { getData } from '@synthkit/enhanced';

// Simple one-line data fetching
async function loadData() {
  const result = await getData();
  return result.data;
}

// React integration
import { useSynthkit } from '@synthkit/enhanced/react';

function MyComponent() {
  const { data, loading, error, customers, charges } = useSynthkit();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>My ${businessContext.name} Prototype</h1>
      <p>Customers: {customers?.length || 0}</p>
      <p>Charges: {charges?.length || 0}</p>
    </div>
  );
}

// Vanilla JavaScript usage
async function myPrototype() {
  const data = await loadData();
  console.log(\`Got \${data.customers.length} customers!\`);
  
  // Display entity counts
  ${entityKeys.map(key => `console.log('${key.charAt(0).toUpperCase() + key.slice(1)}:', data.${key}?.length || 0);`).join('\n  ')}
  
  // Display business metrics
  console.log('Customer Lifetime Value: $' + data.businessMetrics?.customerLifetimeValue?.toFixed(2));
  console.log('Monthly Recurring Revenue: $' + data.businessMetrics?.monthlyRecurringRevenue?.toFixed(2));
  console.log('Conversion Rate: ' + data.businessMetrics?.conversionRate?.toFixed(2) + '%');
}

// Start your prototype
myPrototype();

// Export for use in other modules
export { loadData, MyComponent };`;

    return {
    tool: 'Fetch API',
    description: 'Enhanced JavaScript integration with zero dependencies',
    code: code,
    instructions: 'Install @synthkit/enhanced and use getData() for instant data access - zero configuration needed!',
    copyText: code
  };
}

// React Integration - Optimized for React components
export function generateReactIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const code = `// Install: npm install @synthkit/enhanced

import { useSynthkit } from '@synthkit/enhanced/react';

// Simple React component with data
export function MyPrototype() {
  const { data, loading, error, customers, charges, subscriptions, invoices, plans } = useSynthkit();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>My ${businessContext.name} Prototype</h1>
      <p>Data source: {data?.metadata.source}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2>Customers ({customers?.length || 0})</h2>
          <p>Sample: {customers?.[0]?.name || 'N/A'}</p>
        </div>
        <div className="p-4 border rounded">
          <h2>Charges ({charges?.length || 0})</h2>
          <p>Sample: \${charges?.[0]?.amount || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

// Or use the simple async version:
import { getData } from '@synthkit/enhanced';

export async function MyAsyncPrototype() {
  const result = await getData();
  const { customers, charges } = result.data;
  
  return (
    <div>
      <h1>My ${businessContext.name} Prototype</h1>
      <p>Got {customers?.length || 0} customers and {charges?.length || 0} charges!</p>
    </div>
  );
}`;

  return {
    tool: 'React',
    description: 'React component with Synthkit Enhanced',
    code: code,
    instructions: 'Install @synthkit/enhanced and use the useSynthkit hook - zero configuration needed!',
    copyText: code
  };
}

// Main function to generate all integrations
export function generateAllIntegrations(url: string, datasetInfo: DatasetInfo): IntegrationExample[] {
  return [
    generateReactIntegration(url, datasetInfo),
    generateCursorPrompt(url, datasetInfo),
    generateCursorIntegration(url, datasetInfo),
    generateClaudeIntegration(url, datasetInfo),
    generateChatGPTIntegration(url, datasetInfo),
    generateV0Integration(url, datasetInfo),
    generateFetchIntegration(url, datasetInfo)
  ];
}
