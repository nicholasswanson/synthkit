import React, { useEffect, useState, createContext, useContext } from 'react';
import { 
  synthStore, 
  type SynthStore, 
  type SynthConfig
} from '@synthkit/sdk';

export interface SynthProviderProps {
  children: React.ReactNode;
  config?: SynthConfig;
  onReady?: () => void;
}

export interface SynthContextValue {
  store: SynthStore;
  isReady: boolean;
}

const SynthContext = createContext<SynthContextValue | null>(null);

export function SynthProvider({ 
  children, 
  config,
  onReady 
}: SynthProviderProps) {
  const storeState = synthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        // Set config if provided
        if (config) {
          storeState.setConfig(config);
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
  }, [config, onReady, storeState]);

  const value: SynthContextValue = {
    store: storeState,
    isReady,
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
