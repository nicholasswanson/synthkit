'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Simple demo store for the Next.js example
interface DemoStore {
  activeScenario?: string;
  activePersona?: string;
  activeStage: 'development' | 'testing' | 'production';
  currentSeed: number;
  packs: any[];
}

interface SynthContextValue {
  store: DemoStore;
  isReady: boolean;
  refreshHandlers: () => void;
}

const SynthContext = createContext<SynthContextValue | null>(null);

export function SynthContextProvider({ 
  children, 
  initialStore 
}: { 
  children: React.ReactNode;
  initialStore: DemoStore;
}) {
  const [isReady, setIsReady] = useState(false);
  const [store, setStore] = useState(initialStore);

  const refreshHandlers = React.useCallback(() => {
    // Trigger a page refresh to reload MSW handlers with new configuration
    window.location.reload();
  }, []);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
    <SynthContext.Provider value={{ store, isReady, refreshHandlers }}>
      {children}
    </SynthContext.Provider>
  );
}

export function useSynthContext() {
  const context = useContext(SynthContext);
  if (!context) {
    throw new Error('useSynthContext must be used within a SynthContextProvider');
  }
  return context;
}

// Hook that provides a simple interface for the demo
export function useSynth() {
  const { store, isReady, refreshHandlers } = useSynthContext();
  
  // Mock data for scenarios and personas
  const scenarios = [
    { packId: 'example-pack', scenario: { id: 'development', name: 'Development' } },
    { packId: 'example-pack', scenario: { id: 'demo', name: 'Demo' } }
  ];
  
  const personas = [
    { packId: 'example-pack', persona: { id: 'alice', name: 'Alice (Admin)' } },
    { packId: 'example-pack', persona: { id: 'bob', name: 'Bob (User)' } }
  ];
  
  const snapshots = []; // Empty for now
  
  return {
    // State
    isReady,
    mswEnabled: true,
    packs: store.packs,
    activeScenarios: store.activeScenario ? [store.activeScenario] : [],
    activeScenario: store.activeScenario,
    activePersona: store.activePersona,
    activeStage: store.activeStage,
    currentSeed: store.currentSeed,
    
    // List functions
    listScenarios: () => scenarios,
    listPersonas: () => personas,
    listSnapshots: () => snapshots,
    
    // Actions that update local state and refresh
    activateScenario: (scenarioId: string) => {
      // Update local storage for persistence across reloads
      localStorage.setItem('synthkit-scenario', scenarioId);
      refreshHandlers();
    },
    deactivateScenario: () => {
      localStorage.removeItem('synthkit-scenario');
      refreshHandlers();
    },
    activatePersona: (personaId: string) => {
      localStorage.setItem('synthkit-persona', personaId);
      refreshHandlers();
    },
    deactivatePersona: () => {
      localStorage.removeItem('synthkit-persona');
      refreshHandlers();
    },
    setStage: (stage: 'development' | 'testing' | 'production') => {
      localStorage.setItem('synthkit-stage', stage);
      refreshHandlers();
    },
    setSeed: (seed: number) => {
      localStorage.setItem('synthkit-seed', seed.toString());
      refreshHandlers();
    },
    randomizeSeed: () => {
      const newSeed = Math.floor(Math.random() * 100000);
      localStorage.setItem('synthkit-seed', newSeed.toString());
      refreshHandlers();
    },
    
    // Snapshot actions (mock)
    createSnapshot: (name: string) => {
      console.log('Creating snapshot:', name);
    },
    restoreSnapshot: (snapshotId: string) => {
      console.log('Restoring snapshot:', snapshotId);
    },
    
    // Reset
    reset: () => {
      localStorage.removeItem('synthkit-scenario');
      localStorage.removeItem('synthkit-persona');
      localStorage.removeItem('synthkit-stage');
      localStorage.removeItem('synthkit-seed');
      refreshHandlers();
    },
    
    refreshHandlers,
  };
}
