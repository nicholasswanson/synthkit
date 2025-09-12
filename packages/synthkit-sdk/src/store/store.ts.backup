import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SynthStore, SynthState, Stage, Snapshot } from './types';
import type { ScenarioPack, SynthConfig, Scenario, Persona } from '../types';

const STORAGE_KEY = 'synthkit-store';

const initialState: SynthState = {
  config: {
    packs: [],
    scenarios: {},
    generators: {},
  },
  packs: new Map(),
  activeScenarios: new Set(),
  activeScenario: undefined,
  activePersona: undefined,
  activeStage: 'development',
  generatedData: new Map(),
  snapshots: new Map(),
  currentSeed: 12345,
};

export const createSynthStore = () => create<SynthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Config actions
      setConfig: (config) => set({ config }),
      
      updateConfig: (updates) => set((state) => ({
        config: { ...state.config, ...updates },
      })),

      // Pack actions
      registerPack: (pack) => set((state) => {
        const packs = new Map(state.packs);
        packs.set(pack.id, pack);
        return { packs };
      }),

      unregisterPack: (packId) => set((state) => {
        const packs = new Map(state.packs);
        packs.delete(packId);
        return { packs };
      }),

      getPack: (packId) => get().packs.get(packId),

      // Scenario actions
      activateScenario: async (scenarioId) => {
        const state = get();
        
        // Find scenario in packs
        let scenario: Scenario | undefined;
        let foundPackId: string | undefined;
        
        for (const pack of state.packs.values()) {
          if (pack.scenarios[scenarioId]) {
            scenario = pack.scenarios[scenarioId];
            foundPackId = pack.id;
            break;
          }
        }

        if (!scenario) {
          throw new Error(`Scenario '${scenarioId}' not found`);
        }

        // Update state with scenario config
        set((state) => {
          const activeScenarios = new Set(state.activeScenarios);
          activeScenarios.add(scenarioId);
          
          // Apply scenario config to store
          const updates: Partial<SynthState> = { 
            activeScenarios,
            activeScenario: scenarioId,
          };
          
          // Apply seed if specified
          if (scenario.config.seed !== undefined) {
            updates.currentSeed = scenario.config.seed;
          }
          
          // Apply locale if specified
          if (scenario.config.locale !== undefined) {
            updates.config = {
              ...state.config,
              generators: {
                ...state.config.generators,
                locale: scenario.config.locale
              }
            };
          }
          
          return updates;
        });
      },

      deactivateScenario: async (scenarioId) => {
        set((state) => {
          const activeScenarios = new Set(state.activeScenarios);
          activeScenarios.delete(scenarioId);
          return { 
            activeScenarios,
            activeScenario: state.activeScenario === scenarioId ? undefined : state.activeScenario
          };
        });
      },

      isScenarioActive: (scenarioId) => get().activeScenarios.has(scenarioId),
      
      getCurrentScenario: () => {
        const state = get();
        if (!state.activeScenario) return undefined;
        
        for (const pack of state.packs.values()) {
          if (pack.scenarios[state.activeScenario]) {
            return pack.scenarios[state.activeScenario];
          }
        }
        return undefined;
      },
      
      listScenarios: () => {
        const state = get();
        const scenarios: Array<{ packId: string; scenario: Scenario }> = [];
        
        for (const pack of state.packs.values()) {
          for (const scenario of Object.values(pack.scenarios)) {
            scenarios.push({ packId: pack.id, scenario });
          }
        }
        
        return scenarios;
      },

      // Persona actions
      activatePersona: (personaId) => {
        const state = get();
        
        // Find persona in packs
        let persona: Persona | undefined;
        for (const pack of state.packs.values()) {
          if (pack.personas[personaId]) {
            persona = pack.personas[personaId];
            break;
          }
        }
        
        if (!persona) {
          throw new Error(`Persona '${personaId}' not found`);
        }
        
        set({ activePersona: personaId });
      },
      
      deactivatePersona: () => set({ activePersona: undefined }),
      
      getCurrentPersona: () => {
        const state = get();
        if (!state.activePersona) return undefined;
        
        for (const pack of state.packs.values()) {
          if (pack.personas[state.activePersona]) {
            return pack.personas[state.activePersona];
          }
        }
        return undefined;
      },
      
      listPersonas: () => {
        const state = get();
        const personas: Array<{ packId: string; persona: Persona }> = [];
        
        for (const pack of state.packs.values()) {
          for (const persona of Object.values(pack.personas)) {
            personas.push({ packId: pack.id, persona });
          }
        }
        
        return personas;
      },
      
      // Stage actions
      setStage: (stage) => set({ activeStage: stage }),
      getStage: () => get().activeStage,
      
      // Seed actions
      setSeed: (seed) => set({ currentSeed: seed }),
      getSeed: () => get().currentSeed,
      randomizeSeed: () => set({ currentSeed: Math.floor(Math.random() * 1000000) }),
      
      // Data actions
      setGeneratedData: (key, data) => set((state) => {
        const generatedData = new Map(state.generatedData);
        generatedData.set(key, data);
        return { generatedData };
      }),

      getGeneratedData: (key) => get().generatedData.get(key),

      clearGeneratedData: () => set({ generatedData: new Map() }),
      
      // Snapshot actions
      createSnapshot: (name) => {
        const state = get();
        const snapshotId = `snapshot-${Date.now()}`;
        const snapshot: Snapshot = {
          id: snapshotId,
          name,
          timestamp: new Date(),
          state: {
            activeScenario: state.activeScenario,
            activePersona: state.activePersona,
            activeStage: state.activeStage,
            generatedData: Object.fromEntries(state.generatedData),
            seed: state.currentSeed,
          },
        };
        
        set((state) => {
          const snapshots = new Map(state.snapshots);
          snapshots.set(snapshotId, snapshot);
          return { snapshots };
        });
        
        return snapshotId;
      },
      
      restoreSnapshot: (snapshotId) => {
        const state = get();
        const snapshot = state.snapshots.get(snapshotId);
        
        if (!snapshot) {
          throw new Error(`Snapshot '${snapshotId}' not found`);
        }
        
        set({
          activeScenario: snapshot.state.activeScenario,
          activePersona: snapshot.state.activePersona,
          activeStage: snapshot.state.activeStage,
          generatedData: new Map(Object.entries(snapshot.state.generatedData)),
          currentSeed: snapshot.state.seed,
        });
      },
      
      deleteSnapshot: (snapshotId) => set((state) => {
        const snapshots = new Map(state.snapshots);
        snapshots.delete(snapshotId);
        return { snapshots };
      }),
      
      listSnapshots: () => {
        const state = get();
        return Array.from(state.snapshots.values()).sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      },
      
      // Persistence actions
      saveToLocalStorage: () => {
        const state = get();
        const serialized = {
          activeScenario: state.activeScenario,
          activePersona: state.activePersona,
          activeStage: state.activeStage,
          currentSeed: state.currentSeed,
          generatedData: Object.fromEntries(state.generatedData),
          snapshots: Object.fromEntries(
            Array.from(state.snapshots.entries()).map(([id, snapshot]) => [
              id,
              {
                ...snapshot,
                timestamp: snapshot.timestamp.toISOString(),
              },
            ])
          ),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      },
      
      loadFromLocalStorage: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        
        try {
          const parsed = JSON.parse(stored);
          set({
            activeScenario: parsed.activeScenario,
            activePersona: parsed.activePersona,
            activeStage: parsed.activeStage || 'development',
            currentSeed: parsed.currentSeed || 12345,
            generatedData: new Map(Object.entries(parsed.generatedData || {})),
            snapshots: new Map(
              Object.entries(parsed.snapshots || {}).map(([id, snapshot]: [string, any]) => [
                id,
                {
                  ...snapshot,
                  timestamp: new Date(snapshot.timestamp),
                },
              ])
            ),
          });
        } catch (error) {
          console.error('Failed to load from localStorage:', error);
        }
      },

      // Utility actions
      reset: () => set(initialState),
    }),
    {
      name: 'synthkit-store',
    }
  )
);

// Default store instance
export const synthStore = createSynthStore();
