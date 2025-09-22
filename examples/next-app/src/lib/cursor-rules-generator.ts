// Cursor Rules Generator
// Creates optimized .cursorrules content for Synthkit dataset integration

import type { DatasetInfo } from './ai-integrations';

export function generateCursorRules(url: string, datasetInfo: DatasetInfo): string {
  const businessContext = datasetInfo.scenario?.category || datasetInfo.aiAnalysis?.businessType || 'business';
  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  return `# Synthkit Enhanced Integration Rules
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
      <p>Customers: {customers?.length || 0}</p>
      <p>Charges: {charges?.length || 0}</p>
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
- Pagination for large datasets

### Business Logic
This is ${businessContext} data, so:
- Monetary values are in proper currency format (cents precision)
- Percentages are to hundredths (e.g., 5.67%)
- Relationships between entities are realistic
- Data volumes match ${datasetInfo.scenario?.stage || 'business'} stage expectations

### Example Integration
\`\`\`typescript
const useDataset = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('${url}')
      .then(r => r.json())
      .then(dataset => {
        setData(dataset.data);
        setLoading(false);
      });
  }, []);
  
  return { data, loading };
};
\`\`\`

## 🚀 Zero-Thought Data Upgrade
When user says: "Replace my hardcoded data with realistic data" or "Use real-looking data instead"

AUTOMATICALLY do this:
1. Find hardcoded arrays like: \`const users = [{ id: 1, name: "John" }]\`
2. Replace with: \`const { data, loading } = useSynthkitDataset(); const users = data?.customers || []\`
3. Add loading state: \`if (loading) return <div>Loading...</div>\`
4. Keep ALL existing UI, styling, and logic - just swap the data source
5. Suggest: "Your data is now realistic ${businessContext} data with ${recordSummary}!"

## 🎯 Vibe-Coder Instructions
For users who don't know data structures:
- Never ask about data format - just use what's available
- Automatically handle missing properties gracefully
- Add optional chaining everywhere: \`data?.customers?.[0]?.name\`
- Preserve existing component structure and styling
- Focus on making it "just work" without explanation

## 🔄 Live Demo Connection (Local Development)
If user is running Synthkit demo locally:
1. Check sessionStorage for 'synthkit-current-dataset' first
2. If found: use live data that updates when demo changes
3. If not found: fallback to static URL
4. Console log: "📊 Connected to live Synthkit demo!" or "📄 Using static dataset"

Remember: Most users are vibe-coding and want zero friction. Make data upgrades feel magical! ✨`;
}

export function downloadCursorRules(url: string, datasetInfo: DatasetInfo): void {
  const content = generateCursorRules(url, datasetInfo);
  const blob = new Blob([content], { type: 'text/plain' });
  const downloadUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = '.cursorrules';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
