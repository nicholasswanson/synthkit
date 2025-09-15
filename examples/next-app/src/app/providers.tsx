'use client';

import { useEffect, useState } from 'react';
import { SynthContextProvider } from '@/lib/synth-context';
import { logger } from '@/lib/logger';

// MSW setup removed - demo app uses direct data generation instead of API mocking

export function Providers({ children }: { children: React.ReactNode }) {
  // MSW initialization removed - demo app uses direct data generation
  // No need to wait for MSW setup since we're not using API mocking

  // Create a simple store for the demo
  const demoStore = {
    activeCategory: typeof window !== 'undefined' ? localStorage.getItem('synthkit-category') || undefined : undefined,
    activeRole: typeof window !== 'undefined' ? localStorage.getItem('synthkit-role') || undefined : undefined,
    activeStage: (typeof window !== 'undefined' ? localStorage.getItem('synthkit-stage') : 'development') as 'development' | 'testing' | 'production',
    currentGenerationId: typeof window !== 'undefined' ? parseInt(localStorage.getItem('synthkit-generation-id') || '12345', 10) : 12345
  };

  return (
    <SynthContextProvider initialStore={demoStore}>
      {children}
    </SynthContextProvider>
  );
}