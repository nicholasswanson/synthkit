'use client';

import { useState, useEffect } from 'react';

export default function SimplePage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('Simple page mounted');
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div>Loading simple page...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Simple Test Page</h1>
      <p>This is a minimal test to see if React is working.</p>
      <button 
        onClick={() => alert('Button clicked!')}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Button
      </button>
    </div>
  );
}
