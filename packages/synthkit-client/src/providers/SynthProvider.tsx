import React, { useEffect, useState, createContext, useContext } from 'react';
import { 
  synthStore, 
  type SynthStore, 
  type SynthConfig
} from '@synthkit/sdk';
import { setupMSW, useMSWHandlers } from '../msw/setup';
import type { HttpHandler } from 'msw';

export interface SynthProviderProps {
  children: React.ReactNode;
  config?: SynthConfig;
  enableMSW?: boolean;
  onReady?: () => void;
}

export interface SynthContextValue {
  store: SynthStore;
  isReady: boolean;
  mswEnabled: boolean;
  refreshHandlers: () => Promise<void>;
}

const SynthContext = createContext<SynthContextValue | null>(null);

export function SynthProvider({ 
  children, 
  config,
  enableMSW = true,
  onReady 
}: SynthProviderProps) {
  const storeState = synthStore();
  const [isReady, setIsReady] = useState(false);
  const [mswEnabled, setMswEnabled] = useState(false);

  const refreshHandlers = async () => {
    if (!mswEnabled) return;
    
    // Simple MSW setup without pack loading
    const handlers: HttpHandler[] = [];
    useMSWHandlers(handlers);
  };

  useEffect(() => {
    async function initialize() {
      try {
        // Set config if provided
        if (config) {
          storeState.setConfig(config);
        }

        // Setup MSW if enabled
        if (enableMSW) {
          await setupMSW([]);
          setMswEnabled(true);
        }

        // Load from localStorage if available
        storeState.loadFromLocalStorage();

        setIsReady(true);
        onReady?.();
      } catch (error) {
        console.error('Failed to initialize SynthProvider:', error);
        setIsReady(true); // Set ready even on error to avoid blocking
      }
    }

    initialize();
  }, [config, enableMSW, onReady, storeState]);

  const value: SynthContextValue = {
    store: storeState,
    isReady,
    mswEnabled,
    refreshHandlers,
  };

  return (
    <SynthContext.Provider value={value}>
      {children}
    </SynthContext.Provider>
  );
}

export function useSynthContext(): SynthContextValue {
  const context = useContext(SynthContext);
  if (!context) {
    throw new Error('useSynthContext must be used within a SynthProvider');
  }
  return context;
}
