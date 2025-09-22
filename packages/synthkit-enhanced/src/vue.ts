// Vue integration for Synthkit Enhanced
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { SynthkitData, SynthkitOptions, SynthkitResult } from './types';
import { synthkit } from './core';

export interface UseSynthkitOptions extends SynthkitOptions {
  // Vue-specific options can be added here
}

export function useSynthkit(options: UseSynthkitOptions = {}) {
  const data = ref<SynthkitData | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  const status = ref<{ source: string; message: string; connected: boolean } | null>(null);
  const debug = ref<any>(null);

  let mounted = true;

  const loadData = async () => {
    try {
      loading.value = true;
      error.value = null;

      const result = await synthkit.getData(options);
      
      if (mounted) {
        data.value = result.data;
        status.value = result.status || null;
        debug.value = result.debug || null;
      }
    } catch (err) {
      if (mounted) {
        error.value = err instanceof Error ? err : new Error('Failed to load data');
      }
    } finally {
      if (mounted) {
        loading.value = false;
      }
    }
  };

  const refresh = () => {
    loading.value = true;
    synthkit.getData(options).then(result => {
      data.value = result.data;
      status.value = result.status || null;
      debug.value = result.debug || null;
      loading.value = false;
    }).catch(err => {
      error.value = err instanceof Error ? err : new Error('Failed to load data');
      loading.value = false;
    });
  };

  onMounted(() => {
    loadData();
  });

  onUnmounted(() => {
    mounted = false;
  });

  return {
    data,
    loading,
    error,
    status,
    debug,
    // Convenience getters
    customers: computed(() => data.value?.customers || []),
    charges: computed(() => data.value?.charges || []),
    subscriptions: computed(() => data.value?.subscriptions || []),
    invoices: computed(() => data.value?.invoices || []),
    plans: computed(() => data.value?.plans || []),
    // Refresh function
    refresh
  };
}

// Simple composable for just getting data
export function useSynthkitData(options: UseSynthkitOptions = {}) {
  const { data, loading, error } = useSynthkit(options);
  return { data, loading, error };
}

// Composables for getting specific data types
export function useSynthkitCustomers(options: UseSynthkitOptions = {}) {
  const { customers, loading, error } = useSynthkit(options);
  return { customers, loading, error };
}

export function useSynthkitCharges(options: UseSynthkitOptions = {}) {
  const { charges, loading, error } = useSynthkit(options);
  return { charges, loading, error };
}
