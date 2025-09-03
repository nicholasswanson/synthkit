import React, { useEffect, useState, createContext, useContext } from 'react';
import { 
  synthStore, 
  loadPacks,
  type SynthStore, 
  type SynthConfig,
  type ScenarioPack 
} from '@synthkit/sdk';
import { setupMSW, useMSWHandlers } from '../msw/setup';
import { createPackHandlers } from '../msw/route-handlers';
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
  packs: ScenarioPack[];
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
  const [packs, setPacks] = useState<ScenarioPack[]>([]);

  const generateHandlers = (loadedPacks: ScenarioPack[]): HttpHandler[] => {
    const handlers: HttpHandler[] = [];
    
    // Get current seed and locale from store
    const seed = storeState.currentSeed;
    const locale = storeState.config.generators?.locale;
    
    // Generate handlers for each pack
    for (const pack of loadedPacks) {
      handlers.push(...createPackHandlers(pack, { seed, locale }));
    }
    
    return handlers;
  };

  const refreshHandlers = async () => {
    if (!mswEnabled || packs.length === 0) return;
    
    const handlers = generateHandlers(packs);
    useMSWHandlers(handlers);
  };

  useEffect(() => {
    async function initialize() {
      try {
        // Set config if provided
        if (config) {
          storeState.setConfig(config);
        }

        // Load packs
        if (config?.packs && config.packs.length > 0) {
          const loadedPacks = await loadPacks(config.packs);
          setPacks(loadedPacks);
          
          // Register packs in storeState
          for (const pack of loadedPacks) {
            storeState.registerPack(pack);
          }
          
          // Setup MSW if enabled
          if (enableMSW && config?.msw?.enabled !== false) {
            const handlers = generateHandlers(loadedPacks);
            await setupMSW(handlers);
            setMswEnabled(true);
          }
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
  }, [config, enableMSW, onReady, storeState]); // Add storeState to deps

  // Update handlers when seed or locale changes
  useEffect(() => {
    if (!isReady || !mswEnabled) return;
    refreshHandlers();
  }, [isReady, mswEnabled, refreshHandlers]);

  const value: SynthContextValue = {
    store: storeState,
    isReady,
    mswEnabled,
    packs,
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
