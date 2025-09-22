// React integration for Synthkit Enhanced
import { useState, useEffect } from 'react';
import type { SynthkitData, SynthkitOptions, SynthkitResult } from './types';
import { synthkit } from './core';

export interface UseSynthkitOptions extends SynthkitOptions {
  // React-specific options can be added here
}

export function useSynthkit(options: UseSynthkitOptions = {}) {
  const [data, setData] = useState<SynthkitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<{ source: string; message: string; connected: boolean } | null>(null);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await synthkit.getData(options);
        
        if (mounted) {
          setData(result.data);
          setStatus(result.status || null);
          setDebug(result.debug || null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load data'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [options.showStatus, options.debug, options.cacheTimeout, options.baseUrl]);

  return {
    data,
    loading,
    error,
    status,
    debug,
    // Convenience getters
    customers: data?.customers || [],
    charges: data?.charges || [],
    subscriptions: data?.subscriptions || [],
    invoices: data?.invoices || [],
    plans: data?.plans || [],
    // Refresh function
    refresh: () => {
      setLoading(true);
      synthkit.getData(options).then(result => {
        setData(result.data);
        setStatus(result.status || null);
        setDebug(result.debug || null);
        setLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
        setLoading(false);
      });
    }
  };
}

// Simple hook for just getting data
export function useSynthkitData(options: UseSynthkitOptions = {}) {
  const { data, loading, error } = useSynthkit(options);
  return { data, loading, error };
}

// Hook for getting specific data types
export function useSynthkitCustomers(options: UseSynthkitOptions = {}) {
  const { customers, loading, error } = useSynthkit(options);
  return { customers, loading, error };
}

export function useSynthkitCharges(options: UseSynthkitOptions = {}) {
  const { charges, loading, error } = useSynthkit(options);
  return { charges, loading, error };
}
