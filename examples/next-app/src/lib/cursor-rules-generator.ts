// Cursor Rules Generator
// Creates optimized .cursorrules content for Synthkit dataset integration

import type { DatasetInfo } from './ai-integrations';

export function generateCursorRules(url: string, datasetInfo: DatasetInfo): string {
  const businessContext = datasetInfo.scenario?.category || datasetInfo.aiAnalysis?.businessType || 'business';
  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  return `# Synthkit Dataset Integration Rules
# Add this to your .cursorrules file for optimal AI assistance

## Dataset Context
Dataset URL: ${url}
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

## Integration Guidelines

### Data Fetching
When working with this dataset:
1. Always use the exact URL: ${url}
2. Implement proper error handling and loading states
3. Cache the data appropriately (it's deterministic)
4. Use TypeScript interfaces for type safety

### Data Structure
The dataset contains:
${Object.keys(datasetInfo.recordCounts).map(key => `- ${key}: Array of ${key.slice(0, -1)} objects`).join('\n')}
- businessMetrics: Object with CLV, AOV, MRR, DAU, conversion rate

### Code Patterns
Prefer these patterns:
- React hooks for data management
- Proper TypeScript typing
- Error boundaries for data fetching
- Loading skeletons for better UX
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

## AI Assistant Instructions
When helping with this project:
1. Understand this is realistic ${businessContext} data
2. Suggest appropriate UI patterns for the business domain
3. Consider the data relationships when building features
4. Recommend proper state management for the data volume
5. Focus on production-ready code patterns

## Common Tasks
- Building dashboards with business metrics
- Creating data tables with pagination
- Implementing search and filtering
- Displaying charts and visualizations
- Managing customer/payment relationships

Remember: This data is production-ready and deterministic. Same URL always returns identical data.`;
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
