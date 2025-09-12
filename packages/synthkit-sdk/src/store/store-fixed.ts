import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SynthStore, SynthState, Stage, Snapshot } from './types';
import type { DataPack, SynthConfig, Category, Role } from '../types';

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

        // Stage actions
        setStage: (stage: Stage) => set({ activeStage: stage }),
        
        getCurrentStage: () => get().activeStage,

        // Generation actions
        setGenerationId: (id: number) => set({ currentGenerationId: id }),
        
        incrementGenerationId: () => 
          set((state) => ({ currentGenerationId: state.currentGenerationId + 1 })),
        
        getCurrentGenerationId: () => get().currentGenerationId,

        // Data actions
        setGeneratedData: (key: string, data: any) =>
          set((state) => {
            const generatedData = new Map(state.generatedData);
            generatedData.set(key, data);
            return { generatedData };
          }),

        getGeneratedData: (key: string) => get().generatedData.get(key),
        
        clearGeneratedData: () => set({ generatedData: new Map() }),

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
          if (!snapshot) return false;

          set({
            activeCategory: snapshot.state.activeCategory,
            activeRole: snapshot.state.activeRole,
            activeStage: snapshot.state.activeStage,
            generatedData: new Map(Object.entries(snapshot.state.generatedData)),
            currentGenerationId: snapshot.state.generationId,
          });

          return true;
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
