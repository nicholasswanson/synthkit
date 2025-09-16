import { useSynthContext } from '../providers/SynthProvider';

export function useSynth() {
  const { store, isReady } = useSynthContext();
  
  return {
    isReady,
    config: store.config,
    activeCategories: Array.from(store.activeCategories),
    activeCategory: store.activeCategory,
    activeRole: store.activeRole,
    activeStage: store.activeStage,
    currentGenerationId: store.currentGenerationId,
    
    // Config actions
    setConfig: store.setConfig,
    updateConfig: store.updateConfig,
    
    // Category actions (formerly scenarios)
    activateCategory: store.activateCategory,
    deactivateCategory: store.deactivateCategory,
    listCategories: store.listCategories,
    
    // Role actions (formerly personas)
    activateRole: store.activateRole,
    deactivateRole: store.deactivateRole,
    listRoles: store.listRoles,
    
    // Stage actions
    setStage: store.setStage,
    getStage: store.getStage,
    
    // Generation ID actions (formerly seed)
    setGenerationId: store.setGenerationId,
    randomizeGenerationId: store.randomizeGenerationId,
    
    // Scenario actions (combined configuration)
    setScenario: store.setScenario,
    getScenario: store.getScenario,
    
    // Snapshot actions
    createSnapshot: store.createSnapshot,
    restoreSnapshot: store.restoreSnapshot,
    listSnapshots: store.listSnapshots,
    deleteSnapshot: store.deleteSnapshot,
    
    // Data actions
    setGeneratedData: store.setGeneratedData,
    getGeneratedData: store.getGeneratedData,
    clearGeneratedData: store.clearGeneratedData,
    
    // Persistence actions
    saveToLocalStorage: store.saveToLocalStorage,
    loadFromLocalStorage: store.loadFromLocalStorage,
    
    // Utility actions
    reset: store.reset,
  };
}