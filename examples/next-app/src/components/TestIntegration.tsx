'use client';

import { useSynthkitData } from '@/hooks/useSynthkitData';

/**
 * Test component to verify useSynthkitData hook works
 * This demonstrates the simple integration pattern
 */
export function TestIntegration() {
  const { data, loading, error } = useSynthkitData('scenario-modaic-admin-growth-12345');
  
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
          <div className="text-green-600">${data.businessMetrics?.customerLifetimeValue?.toFixed(2) || '0.00'}</div>
        </div>
        <div>
          <span className="font-medium text-green-700">AOV:</span>
          <div className="text-green-600">${data.businessMetrics?.averageOrderValue?.toFixed(2) || '0.00'}</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-green-600">
        <p>🎉 Integration working! No CORS issues, data loads instantly.</p>
      </div>
    </div>
  );
}
