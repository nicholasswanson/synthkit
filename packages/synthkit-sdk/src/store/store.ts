import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SynthStore, SynthState, Stage, Snapshot } from './types';
import type { DataPack, Category, Role } from '../types';
import type { SynthConfig } from '../config';

const STORAGE_KEY = 'synthkit-store';

const initialState: SynthState = {
  config: {
    version: '1.0.0',
    packs: [],
    scenarios: {},
  },
  packs: new Map(),
  activeCategories: new Set(),
  activeCategory: undefined,
  activeRole: undefined,
  activeStage: 'early' as Stage,
  generatedData: new Map(),
  snapshots: new Map(),
  currentGenerationId: 12345,
};

export const createSynthStore = () => create<SynthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Config actions
        setConfig: (config: SynthConfig) => set({ config }),
        
        updateConfig: (updates: Partial<SynthConfig>) => 
          set((state) => ({
            config: { ...state.config, ...updates }
          })),

        // Pack actions
        registerPack: (pack: DataPack) => 
          set((state) => {
            const packs = new Map(state.packs);
            packs.set(pack.id, pack);
            return { packs };
          }),

        unregisterPack: (packId: string) =>
          set((state) => {
            const packs = new Map(state.packs);
            packs.delete(packId);
            const activeCategories = new Set(state.activeCategories);
            activeCategories.delete(packId);
            return { packs, activeCategories };
          }),

        getPack: (packId: string) => get().packs.get(packId),

        // Category actions
        activateCategory: async (categoryId: string) => {
          set((state) => {
            const activeCategories = new Set(state.activeCategories);
            activeCategories.add(categoryId);
            return { 
              activeCategories,
              activeCategory: categoryId 
            };
          });
        },

        deactivateCategory: async (categoryId: string) => {
          set((state) => {
            const activeCategories = new Set(state.activeCategories);
            activeCategories.delete(categoryId);
            return { 
              activeCategories,
              activeCategory: state.activeCategory === categoryId ? undefined : state.activeCategory
            };
          });
        },

        isCategoryActive: (categoryId: string) => 
          get().activeCategories.has(categoryId),

        getCurrentCategory: () => {
          const state = get();
          if (!state.activeCategory) return undefined;
          
          // Find category in packs
          for (const [, pack] of state.packs) {
            if (pack.id === state.activeCategory) {
              return {
                id: pack.id,
                name: pack.name,
                description: pack.description
              } as Category;
            }
          }
          return undefined;
        },

        listCategories: () => {
          const categories: Array<{ packId: string; category: Category }> = [];
          for (const [packId, pack] of get().packs) {
            categories.push({
              packId,
              category: {
                id: pack.id,
                name: pack.name,
                description: pack.description
              } as Category
            });
          }
          return categories;
        },

        // Role actions
        activateRole: (roleId: string) => set({ activeRole: roleId }),
        
        deactivateRole: () => set({ activeRole: undefined }),
        
        getCurrentRole: () => {
          const state = get();
          if (!state.activeRole) return undefined;
          
          // Return a basic role structure
          return {
            id: state.activeRole,
            name: state.activeRole === 'admin' ? 'Administrator' : 'Support Agent',
            accessLevel: state.activeRole as 'admin' | 'support' | 'readonly'
          } as Role;
        },
        
        listRoles: () => {
          // Return standard roles available in the system
          const roles: Array<{ packId: string; role: Role }> = [
            {
              packId: 'system',
              role: {
                id: 'admin',
                name: 'Administrator',
                accessLevel: 'admin'
              }
            },
            {
              packId: 'system',
              role: {
                id: 'support',
                name: 'Support Agent',
                accessLevel: 'support'
              }
            }
          ];
          return roles;
        },

        // Stage actions
        setStage: (stage: Stage) => set({ activeStage: stage }),
        
        getCurrentStage: () => get().activeStage,
        
        getStage: () => get().activeStage,

        // Generation actions
        setGenerationId: (id: number) => set({ currentGenerationId: id }),
        
        incrementGenerationId: () => 
          set((state) => ({ currentGenerationId: state.currentGenerationId + 1 })),
        
        getCurrentGenerationId: () => get().currentGenerationId,
        
        getGenerationId: () => get().currentGenerationId,
        
        randomizeGenerationId: () => 
          set({ currentGenerationId: Math.floor(Math.random() * 100000) }),

        // Data actions
        setGeneratedData: (key: string, data: any) =>
          set((state) => {
            const generatedData = new Map(state.generatedData);
            generatedData.set(key, data);
            return { generatedData };
          }),

        getGeneratedData: (key: string) => get().generatedData.get(key),
        
        clearGeneratedData: () => set({ generatedData: new Map() }),

        // Scenario actions
        setScenario: async (scenario: any) => {
          const { category, role, stage, id } = scenario;
          set({
            activeCategory: category,
            activeRole: role,
            activeStage: stage || 'early',
            currentGenerationId: id || 12345
          });
        },
        
        getScenario: () => {
          const state = get();
          return {
            id: `scenario-${state.activeCategory}-${state.activeRole}-${state.activeStage}`,
            name: `${state.activeCategory || 'modaic'} - ${state.activeRole || 'admin'} - ${state.activeStage}`,
            description: 'Active scenario configuration',
            config: {
              seed: state.currentGenerationId,
              locale: 'en-US',
              volume: {}
            }
          };
        },

        // Persistence actions
        saveToLocalStorage: () => {
          const state = get();
          const data = {
            config: state.config,
            activeCategory: state.activeCategory,
            activeRole: state.activeRole,
            activeStage: state.activeStage,
            currentGenerationId: state.currentGenerationId,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        },
        
        loadFromLocalStorage: () => {
          const data = localStorage.getItem(STORAGE_KEY);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              set(parsed);
            } catch (e) {
              console.error('Failed to load from localStorage:', e);
            }
          }
        },

        // Snapshot actions
        createSnapshot: (name: string) => {
          const state = get();
          const snapshot: Snapshot = {
            id: `snapshot-${Date.now()}`,
            name,
            timestamp: new Date(),
            state: {
              activeCategory: state.activeCategory,
              activeRole: state.activeRole,
              activeStage: state.activeStage,
              generatedData: Object.fromEntries(state.generatedData),
              generationId: state.currentGenerationId,
            },
          };
          
          set((state) => {
            const snapshots = new Map(state.snapshots);
            snapshots.set(snapshot.id, snapshot);
            return { snapshots };
          });
          
          return snapshot.id;
        },

        restoreSnapshot: (snapshotId: string) => {
          const snapshot = get().snapshots.get(snapshotId);
          if (!snapshot) return;

          set({
            activeCategory: snapshot.state.activeCategory,
            activeRole: snapshot.state.activeRole,
            activeStage: snapshot.state.activeStage,
            generatedData: new Map(Object.entries(snapshot.state.generatedData)),
            currentGenerationId: snapshot.state.generationId,
          });
        },

        deleteSnapshot: (snapshotId: string) =>
          set((state) => {
            const snapshots = new Map(state.snapshots);
            snapshots.delete(snapshotId);
            return { snapshots };
          }),

        listSnapshots: () => Array.from(get().snapshots.values()),

        // Reset action
        reset: () => set(initialState),
      }),
      {
        name: STORAGE_KEY,
        partialize: (state) => ({
          config: state.config,
          activeCategory: state.activeCategory,
          activeRole: state.activeRole,
          activeStage: state.activeStage,
          currentGenerationId: state.currentGenerationId,
        }),
      }
    )
  )
);

export const synthStore = createSynthStore();
