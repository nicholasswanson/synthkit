'use client';

import { useState } from 'react';
import type { DatasetCreateRequest } from '@/lib/dataset-storage';

interface UseDatasetCreationResult {
  createDataset: (request: DatasetCreateRequest) => Promise<string | null>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useDatasetCreation(): UseDatasetCreationResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDataset = async (request: DatasetCreateRequest): Promise<string | null> => {
    setIsCreating(true);
    setError(null);

    try {
      // Debug logging
      console.log('🔍 Dataset creation request:', {
        type: request.type,
        dataKeys: Object.keys(request.data || {}),
        recordCounts: Object.fromEntries(
          Object.entries(request.data || {}).map(([key, value]) => [
            key, 
            Array.isArray(value) ? value.length : typeof value
          ])
        ),
        hasMetadata: !!request.metadata,
        metadataKeys: request.metadata ? Object.keys(request.metadata) : [],
        fullRequest: request // Log the entire request for debugging
      });
      
      console.log('🔍 Full request JSON:', JSON.stringify(request, null, 2));

      const response = await fetch('/api/dataset/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Dataset creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: result
        });
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create dataset');
      }

      return result.url;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Dataset creation failed:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createDataset,
    isCreating,
    error,
    clearError
  };
}
