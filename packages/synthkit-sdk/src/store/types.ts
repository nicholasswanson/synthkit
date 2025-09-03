import type { DataPack, Category, SynthConfig, Role, Scenario } from '../types';

export type Stage = 'early' | 'growth' | 'enterprise';

export interface Snapshot {
  id: string;
  name: string;
  timestamp: Date;
  state: {
    activeCategory?: string;
    activeRole?: string;
    activeStage: Stage;
    generatedData: Record<string, any>;
    generationId: number;
  };
}

export interface SynthState {
  config: SynthConfig;
  packs: Map<string, DataPack>;
  activeCategories: Set<string>;
  activeCategory?: string;
  activeRole?: string;
  activeStage: Stage;
  generatedData: Map<string, any>;
  snapshots: Map<string, Snapshot>;
  currentGenerationId: number;
}

export interface SynthStore extends SynthState {
  // Config actions
  setConfig: (config: SynthConfig) => void;
  updateConfig: (updates: Partial<SynthConfig>) => void;
  
  // Pack actions
  registerPack: (pack: DataPack) => void;
  unregisterPack: (packId: string) => void;
  getPack: (packId: string) => DataPack | undefined;
  
  // Category actions (business contexts)
  activateCategory: (categoryId: string) => Promise<void>;
  deactivateCategory: (categoryId: string) => Promise<void>;
  isCategoryActive: (categoryId: string) => boolean;
  getCurrentCategory: () => Category | undefined;
  listCategories: () => Array<{ packId: string; category: Category }>;
  
  // Role actions (access levels)
  activateRole: (roleId: string) => void;
  deactivateRole: () => void;
  getCurrentRole: () => Role | undefined;
  listRoles: () => Array<{ packId: string; role: Role }>;
  
  // Stage actions (business maturity)
  setStage: (stage: Stage) => void;
  getStage: () => Stage;
  
  // Generation ID actions (deterministic generation)
  setGenerationId: (id: number) => void;
  getGenerationId: () => number;
  randomizeGenerationId: () => void;
  
  // Scenario actions (combined configuration)
  setScenario: (scenario: Scenario) => Promise<void>;
  getScenario: () => Scenario;
  
  // Data actions
  setGeneratedData: (key: string, data: any) => void;
  getGeneratedData: <T = any>(key: string) => T | undefined;
  clearGeneratedData: () => void;
  
  // Snapshot actions
  createSnapshot: (name: string) => string;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  listSnapshots: () => Snapshot[];
  
  // Persistence actions
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  
  // Utility actions
  reset: () => void;
}

// Legacy type aliases for backward compatibility
/** @deprecated Use activeCategory instead */
export type ActiveScenario = string;

/** @deprecated Use activeRole instead */
export type ActivePersona = string;

/** @deprecated Use currentGenerationId instead */
export type CurrentSeed = number;