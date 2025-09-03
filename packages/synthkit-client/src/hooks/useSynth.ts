import { useSynthContext } from '../providers/SynthProvider';

export function useSynth() {
  const { store, isReady, mswEnabled, packs, refreshHandlers } = useSynthContext();
  
  return {
    isReady,
    mswEnabled,
    config: store.config,
    packs,
    activeScenarios: Array.from(store.activeScenarios),
    activeScenario: store.activeScenario,
    activePersona: store.activePersona,
    activeStage: store.activeStage,
    currentSeed: store.currentSeed,
    
    // Config actions
    setConfig: store.setConfig,
    updateConfig: store.updateConfig,
    
    // Scenario actions
    activateScenario: store.activateScenario,
    deactivateScenario: store.deactivateScenario,
    listScenarios: store.listScenarios,
    
    // Persona actions
    activatePersona: store.activatePersona,
    deactivatePersona: store.deactivatePersona,
    listPersonas: store.listPersonas,
    
    // Stage actions
    setStage: store.setStage,
    
    // Seed actions
    setSeed: store.setSeed,
    randomizeSeed: store.randomizeSeed,
    
    // Snapshot actions
    createSnapshot: store.createSnapshot,
    restoreSnapshot: store.restoreSnapshot,
    listSnapshots: store.listSnapshots,
    
    // Utility actions
    reset: store.reset,
    refreshHandlers,
  };
}
