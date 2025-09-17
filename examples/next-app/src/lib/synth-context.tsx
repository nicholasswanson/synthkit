'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Simple demo store for the Next.js example
interface DemoStore {
  activeCategory?: string;
  activeRole?: string;
  activeStage: 'development' | 'testing' | 'production';
  currentGenerationId: number;
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
  
  const snapshots: any[] = []; // Empty for now
  
  return {
    // State
    isReady,
    mswEnabled: true,
    packs: store.packs,
    activeCategories: store.activeCategory ? [store.activeCategory] : [],
    activeCategory: store.activeCategory,
    activeRole: store.activeRole,
    activeStage: store.activeStage,
    currentGenerationId: store.currentGenerationId,
    
    // List functions
    listCategories: () => scenarios,
    listRoles: () => personas,
    listSnapshots: () => snapshots,
    
    // Actions that update local state and refresh
    activateCategory: (categoryId: string) => {
      // Update local storage for persistence across reloads
      localStorage.setItem('synthkit-category', categoryId);
      refreshHandlers();
    },
    deactivateCategory: () => {
      localStorage.removeItem('synthkit-category');
      refreshHandlers();
    },
    activateRole: (roleId: string) => {
      localStorage.setItem('synthkit-role', roleId);
      refreshHandlers();
    },
    deactivateRole: () => {
      localStorage.removeItem('synthkit-role');
      refreshHandlers();
    },
    setStage: (stage: 'development' | 'testing' | 'production') => {
      localStorage.setItem('synthkit-stage', stage);
      refreshHandlers();
    },
    setGenerationId: (id: number) => {
      localStorage.setItem('synthkit-generation-id', id.toString());
      refreshHandlers();
    },
    randomizeGenerationId: () => {
      const newId = Math.floor(Math.random() * 100000);
      localStorage.setItem('synthkit-generation-id', newId.toString());
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
      localStorage.removeItem('synthkit-category');
      localStorage.removeItem('synthkit-role');
      localStorage.removeItem('synthkit-stage');
      localStorage.removeItem('synthkit-generation-id');
      refreshHandlers();
    },
    
    refreshHandlers,
  };
}
