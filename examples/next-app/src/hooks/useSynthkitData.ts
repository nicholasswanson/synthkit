import { useState, useEffect } from 'react';

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
  data: SynthkitData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Simple hook to fetch Synthkit dataset data
 * Uses same-origin API route to avoid CORS issues
 * 
 * @param datasetId - The dataset ID (e.g., 'scenario-modaic-admin-growth-12345')
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
    fetch(`/api/datasets/${datasetId}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
}
