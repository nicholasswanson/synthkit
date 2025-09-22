// React test to verify the enhanced client works
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useSynthkit, useSynthkitData } from './dist/react.js';

function TestComponent() {
  const { data, loading, error, status, debug, customers, charges } = useSynthkit({ 
    showStatus: true, 
    debug: true 
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>🧪 Synthkit Enhanced React Test</h1>
      <div>
        <h2>Status</h2>
        <pre>{JSON.stringify(status, null, 2)}</pre>
      </div>
      <div>
        <h2>Debug</h2>
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>
      <div>
        <h2>Data Summary</h2>
        <p>Customers: {customers.length}</p>
        <p>Charges: {charges.length}</p>
        <p>Source: {data?.metadata.source}</p>
      </div>
      <div>
        <h2>Sample Customer</h2>
        <pre>{JSON.stringify(customers[0], null, 2)}</pre>
      </div>
    </div>
  );
}

function SimpleTestComponent() {
  const { data, loading, error } = useSynthkitData();

  if (loading) return <div>Loading simple data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Simple Test</h2>
      <p>Customers: {data?.customers.length}</p>
      <p>Charges: {data?.charges.length}</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <TestComponent />
      <hr />
      <SimpleTestComponent />
    </div>
  );
}

// This would be used in a real React app
console.log('React components created successfully!');
console.log('useSynthkit:', typeof useSynthkit);
console.log('useSynthkitData:', typeof useSynthkitData);
