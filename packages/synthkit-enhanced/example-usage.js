// Example: How vibe coders would use Synthkit Enhanced
import { getData, useSynthkitData } from './dist/index.js';

// Method 1: Simple one-line data fetching
async function simpleExample() {
  console.log('🚀 Simple Example:');
  const result = await getData();
  console.log(`✅ Got ${result.data.customers.length} customers and ${result.data.charges.length} charges`);
  console.log(`📊 Data source: ${result.data.metadata.source}`);
}

// Method 2: With status and debug info
async function detailedExample() {
  console.log('\n🔍 Detailed Example:');
  const result = await getData({ showStatus: true, debug: true });
  
  console.log('Status:', result.status?.message);
  console.log('Environment:', result.debug?.environment);
  console.log('Data flow:', result.debug?.dataFlow);
  console.log('Performance:', result.debug?.performance);
  console.log(`Data: ${result.data.customers.length} customers, ${result.data.charges.length} charges`);
}

// Method 3: React-style usage (if using React)
function reactExample() {
  console.log('\n⚛️  React Example:');
  console.log('// In your React component:');
  console.log(`
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
      <p>Source: {data?.metadata.source}</p>
    </div>
  );
}
  `);
}

// Method 4: Vue-style usage (if using Vue)
function vueExample() {
  console.log('\n💚 Vue Example:');
  console.log('// In your Vue component:');
  console.log(`
import { useSynthkit } from '@synthkit/enhanced/vue';

export default {
  setup() {
    const { data, loading, error, customers, charges } = useSynthkit();
    
    return { data, loading, error, customers, charges };
  },
  template: \`
    <div>
      <h1>Dashboard</h1>
      <p v-if="loading">Loading...</p>
      <p v-else-if="error">Error: {{ error.message }}</p>
      <div v-else>
        <p>Customers: {{ customers.length }}</p>
        <p>Charges: {{ charges.length }}</p>
        <p>Source: {{ data?.metadata.source }}</p>
      </div>
    </div>
  \`
}
  `);
}

// Run examples
async function runExamples() {
  await simpleExample();
  await detailedExample();
  reactExample();
  vueExample();
  
  console.log('\n🎉 All examples completed!');
  console.log('\n📦 To use in your project:');
  console.log('npm install @synthkit/enhanced');
  console.log('import { getData } from "@synthkit/enhanced";');
}

runExamples().catch(console.error);
