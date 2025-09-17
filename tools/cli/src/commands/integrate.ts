import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

interface IntegrateOptions {
  dataset: string;
  framework?: string;
  output?: string;
}

export function createIntegrateCommand(): Command {
  const command = new Command('integrate');
  
  command
    .description('Generate integration files for a Synthkit dataset')
    .option('-d, --dataset <id>', 'Dataset ID (e.g., scenario-modaic-admin-growth-12345)')
    .option('-f, --framework <type>', 'Framework type (react, vue, vanilla)', 'react')
    .option('-o, --output <dir>', 'Output directory', './synthkit-integration')
    .action(async (options: IntegrateOptions) => {
      if (!options.dataset) {
        console.error('❌ Error: Dataset ID is required');
        console.log('Usage: synthkit integrate --dataset <dataset-id>');
        process.exit(1);
      }

      try {
        await generateIntegrationFiles(options);
        console.log('✅ Integration files generated successfully!');
        console.log('📁 Files created in:', options.output);
        console.log('🚀 Next steps:');
        console.log('  1. Copy the files to your project');
        console.log('  2. Install dependencies if needed');
        console.log('  3. Start using the hook in your components');
      } catch (error) {
        console.error('❌ Error generating integration files:', error);
        process.exit(1);
      }
    });

  return command;
}

async function generateIntegrationFiles(options: IntegrateOptions) {
  const { dataset, framework, output } = options;
  
  // Create output directory
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // Generate files based on framework
  switch (framework) {
    case 'react':
      await generateReactFiles(dataset, output);
      break;
    case 'vue':
      await generateVueFiles(dataset, output);
      break;
    case 'vanilla':
      await generateVanillaFiles(dataset, output);
      break;
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }

  // Generate README
  await generateReadme(dataset, framework, output);
}

async function generateReactFiles(dataset: string, outputDir: string) {
  // Generate useSynthkitData hook
  const hookContent = `import { useState, useEffect } from 'react';

export interface SynthkitData {
  customers: any[];
  payments: any[];
  businessMetrics: {
    customerLifetimeValue: number;
    averageOrderValue: number;
    monthlyRecurringRevenue: number;
    dailyActiveUsers: number;
    conversionRate: number;
  };
  [key: string]: any; // For dynamic entities from AI generation
}

export interface SynthkitResponse {
  data: SynthkitData;
  loading: boolean;
  error: Error | null;
}

/**
 * Simple hook to fetch Synthkit dataset data
 * Uses same-origin API route to avoid CORS issues
 * 
 * @param datasetId - The dataset ID (e.g., '${dataset}')
 * @returns Object with data, loading state, and error
 */
export function useSynthkitData(datasetId: string): SynthkitResponse {
  const [data, setData] = useState<SynthkitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset states when datasetId changes
    setLoading(true);
    setError(null);
    setData(null);

    // Use same-origin API route (no CORS issues)
    fetch(\`/api/datasets/\${datasetId}.json\`)
      .then(response => {
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        return response.json();
      })
      .then(responseData => {
        // Extract the data from the response
        setData(responseData.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Synthkit Error:', err);
        setError(err);
        setLoading(false);
      });
  }, [datasetId]);

  return { data, loading, error };
}`;

  // Generate example component
  const exampleContent = `import React from 'react';
import { useSynthkitData } from './useSynthkitData';

/**
 * Example component demonstrating Synthkit data integration
 * Replace this with your actual components
 */
export function ExampleComponent() {
  const { data, loading, error } = useSynthkitData('${dataset}');
  
  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-blue-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-center text-blue-600">Loading realistic data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50">
        <h3 className="text-red-800 font-semibold mb-2">❌ Error Loading Data</h3>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50">
        <p className="text-yellow-600">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-lg bg-green-50">
      <h3 className="text-green-800 font-semibold mb-4">✅ Data Loaded Successfully!</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-green-700">Customers:</span>
          <div className="text-green-600">{data.customers?.length || 0}</div>
        </div>
        <div>
          <span className="font-medium text-green-700">Payments:</span>
          <div className="text-green-600">{data.payments?.length || 0}</div>
        </div>
        <div>
          <span className="font-medium text-green-700">CLV:</span>
          <div className="text-green-600">\${data.businessMetrics?.customerLifetimeValue?.toFixed(2) || '0.00'}</div>
        </div>
        <div>
          <span className="font-medium text-green-700">AOV:</span>
          <div className="text-green-600">\${data.businessMetrics?.averageOrderValue?.toFixed(2) || '0.00'}</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-green-600">
        <p>🎉 Integration working! No CORS issues, data loads instantly.</p>
      </div>
    </div>
  );
}`;

  // Write files
  fs.writeFileSync(path.join(outputDir, 'useSynthkitData.ts'), hookContent);
  fs.writeFileSync(path.join(outputDir, 'ExampleComponent.tsx'), exampleContent);
}

async function generateVueFiles(dataset: string, outputDir: string) {
  const composableContent = `import { ref, onMounted } from 'vue';

export interface SynthkitData {
  customers: any[];
  payments: any[];
  businessMetrics: {
    customerLifetimeValue: number;
    averageOrderValue: number;
    monthlyRecurringRevenue: number;
    dailyActiveUsers: number;
    conversionRate: number;
  };
  [key: string]: any;
}

export function useSynthkitData(datasetId: string) {
  const data = ref<SynthkitData | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const fetchData = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await fetch(\`/api/datasets/\${datasetId}.json\`);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const result = await response.json();
      data.value = result.data;
    } catch (err) {
      console.error('Synthkit Error:', err);
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchData();
  });

  return { data, loading, error, refetch: fetchData };
}`;

  fs.writeFileSync(path.join(outputDir, 'useSynthkitData.ts'), composableContent);
}

async function generateVanillaFiles(dataset: string, outputDir: string) {
  const vanillaContent = `// Simple Synthkit Data Manager
// No CORS issues, no complex setup, just works

class SynthkitDataManager {
  constructor(datasetId) {
    this.datasetId = datasetId;
    this.data = null;
    this.loading = false;
    this.error = null;
  }

  async fetchData() {
    if (this.loading) return null;
    
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch(\`/api/datasets/\${this.datasetId}.json\`);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const result = await response.json();
      this.data = result.data;
      return this.data;
    } catch (err) {
      console.error('Synthkit Error:', err);
      this.error = err;
      throw err;
    } finally {
      this.loading = false;
    }
  }

  getData() {
    return this.data;
  }

  isLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }
}

// Usage example:
// const synthkit = new SynthkitDataManager('${dataset}');
// const data = await synthkit.fetchData();
// console.log('Customers:', data?.customers?.length || 0);

export default SynthkitDataManager;`;

  fs.writeFileSync(path.join(outputDir, 'SynthkitDataManager.js'), vanillaContent);
}

async function generateReadme(dataset: string, framework: string, outputDir: string) {
  const readmeContent = `# Synthkit Integration Files

Generated for dataset: \`${dataset}\`
Framework: ${framework}

## Quick Start

### React
\`\`\`typescript
import { useSynthkitData } from './useSynthkitData';

function MyComponent() {
  const { data, loading, error } = useSynthkitData('${dataset}');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Customers: {data?.customers?.length || 0}</div>;
}
\`\`\`

### Vue
\`\`\`typescript
import { useSynthkitData } from './useSynthkitData';

export default {
  setup() {
    const { data, loading, error } = useSynthkitData('${dataset}');
    
    return { data, loading, error };
  }
}
\`\`\`

### Vanilla JavaScript
\`\`\`javascript
import SynthkitDataManager from './SynthkitDataManager.js';

const synthkit = new SynthkitDataManager('${dataset}');
const data = await synthkit.fetchData();
console.log('Customers:', data?.customers?.length || 0);
\`\`\`

## What's Included

- **useSynthkitData.ts** - React hook for data fetching
- **ExampleComponent.tsx** - Example React component
- **SynthkitDataManager.js** - Vanilla JavaScript class
- **README.md** - This file

## Features

✅ **No CORS Issues** - Uses same-origin API routes
✅ **Simple Integration** - One hook, one pattern
✅ **TypeScript Support** - Full type definitions
✅ **Error Handling** - Proper loading and error states
✅ **Zero Configuration** - Works out of the box

## Next Steps

1. Copy the files to your project
2. Import and use the hook/manager
3. Replace hardcoded data with realistic data
4. Build your prototype!

## Support

- Dataset ID: \`${dataset}\`
- API Endpoint: \`/api/datasets/${dataset}.json\`
- No authentication required
- Static, deterministic data

Happy prototyping! 🚀`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
}
