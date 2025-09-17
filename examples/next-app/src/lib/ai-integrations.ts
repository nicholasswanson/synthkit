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

  // Extract dataset ID from URL
  const datasetId = url.split('/').pop()?.replace('.json', '') || 'your-dataset-id';
  
  const integrationPrompt = `I need help integrating realistic data into my React prototype.

**Dataset ID**: ${datasetId}
**Business Type**: ${businessContext.name} (${businessContext.domain})
**Data**: ${recordSummary}

**Simple Integration**:
1. Copy this hook to your project:
\`\`\`typescript
// useSynthkitData.ts
export function useSynthkitData(datasetId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(\`/api/datasets/\${datasetId}.json\`)
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [datasetId]);

  return { data, loading, error };
}
\`\`\`

2. Use it in your component:
\`\`\`typescript
function MyComponent() {
  const { data, loading, error } = useSynthkitData('${datasetId}');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Data loaded: {data?.customers?.length || 0} customers</div>;
}
\`\`\`

**That's it!** No CORS, no complex setup, just works.`;

  return {
    tool: 'Cursor',
    description: 'AI-powered code editor with context-aware assistance',
    code: integrationPrompt,
    instructions: 'Paste this prompt into Cursor AI chat to get instant integration code for your prototype',
    copyText: integrationPrompt
  };
}

// Claude Integration - Optimized for detailed development assistance
export function generateClaudeIntegration(url: string, datasetInfo: DatasetInfo): IntegrationExample {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  // Extract dataset ID from URL
  const datasetId = url.split('/').pop()?.replace('.json', '') || 'your-dataset-id';
  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const prompt = `I need help integrating realistic data into my React prototype.

**Dataset ID**: ${datasetId}
**Business Type**: ${businessContext.name} (${businessContext.domain})
**Data**: ${recordSummary}

**Simple Integration**:
1. Copy this hook to your project:
\`\`\`typescript
// useSynthkitData.ts
export function useSynthkitData(datasetId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(\`/api/datasets/\${datasetId}.json\`)
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [datasetId]);

  return { data, loading, error };
}
\`\`\`

2. Use it in your component:
\`\`\`typescript
function MyComponent() {
  const { data, loading, error } = useSynthkitData('${datasetId}');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Data loaded: {data?.customers?.length || 0} customers</div>;
}
\`\`\`

**That's it!** No CORS, no complex setup, just works.`;

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

  // Extract dataset ID from URL
  const datasetId = url.split('/').pop()?.replace('.json', '') || 'your-dataset-id';
  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const prompt = `I need help integrating realistic data into my React prototype.

**Dataset ID**: ${datasetId}
**Business Type**: ${businessContext.name} (${businessContext.domain})
**Data**: ${recordSummary}

**Simple Integration**:
1. Copy this hook to your project:
\`\`\`typescript
// useSynthkitData.ts
export function useSynthkitData(datasetId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(\`/api/datasets/\${datasetId}.json\`)
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [datasetId]);

  return { data, loading, error };
}
\`\`\`

2. Use it in your component:
\`\`\`typescript
function MyComponent() {
  const { data, loading, error } = useSynthkitData('${datasetId}');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Data loaded: {data?.customers?.length || 0} customers</div>;
}
\`\`\`

**That's it!** No CORS, no complex setup, just works.`;

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

  // Extract dataset ID from URL
  const datasetId = url.split('/').pop()?.replace('.json', '') || 'your-dataset-id';

  const prompt = `Create a modern dashboard component for a ${businessContext.name.toLowerCase()} prototype.

**Dataset ID**: ${datasetId}
**Data**: ${recordSummary}

**Simple Integration**:
1. Use this hook:
\`\`\`typescript
export function useSynthkitData(datasetId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(\`/api/datasets/\${datasetId}.json\`)
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [datasetId]);

  return { data, loading, error };
}
\`\`\`

2. Create dashboard component:
\`\`\`typescript
function Dashboard() {
  const { data, loading, error } = useSynthkitData('${datasetId}');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Customers: {data?.customers?.length || 0}</p>
      <p>Payments: {data?.payments?.length || 0}</p>
    </div>
  );
}
\`\`\`

**That's it!** No CORS, no complex setup, just works.`;

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

  // Extract dataset ID from URL
  const datasetId = url.split('/').pop()?.replace('.json', '') || 'your-dataset-id';
  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  const code = `// Simple Synthkit Data Hook
// No CORS issues, no complex setup, just works

export function useSynthkitData(datasetId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(\`/api/datasets/\${datasetId}.json\`)
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [datasetId]);

  return { data, loading, error };
}

// Usage:
// const { data, loading, error } = useSynthkitData('${datasetId}');
// Dataset: ${recordSummary}`;

  return {
    tool: 'Fetch API',
    description: 'Simple React hook for dataset integration',
    code: code,
    instructions: 'Copy this hook for React projects. No CORS, no complex setup, just works.',
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