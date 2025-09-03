import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSynthStore } from './store';
import type { ScenarioPack } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// @ts-ignore
global.localStorage = localStorageMock;

describe('SynthStore', () => {
  let store: ReturnType<typeof createSynthStore>;

  beforeEach(() => {
    localStorageMock.clear();
    store = createSynthStore();
  });

  const testPack: ScenarioPack = {
    id: 'test-pack',
    name: 'Test Pack',
    description: 'Test pack for unit tests',
    version: '1.0.0',
    schemas: {
      user: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
    scenarios: {
      'test-scenario': {
        id: 'test-scenario',
        name: 'Test Scenario',
        config: {
          seed: 54321,
          locale: 'en-US',
        },
      },
    },
    personas: {
      'test-persona': {
        id: 'test-persona',
        name: 'Test Persona',
        preferences: {
          locale: 'en-GB',
        },
      },
    },
  };

  describe('Pack Management', () => {
    it('should register and retrieve packs', () => {
      store.getState().registerPack(testPack);
      
      const pack = store.getState().getPack('test-pack');
      expect(pack).toEqual(testPack);
    });

    it('should unregister packs', () => {
      store.getState().registerPack(testPack);
      store.getState().unregisterPack('test-pack');
      
      const pack = store.getState().getPack('test-pack');
      expect(pack).toBeUndefined();
    });
  });

  describe('Scenario Management', () => {
    beforeEach(() => {
      store.getState().registerPack(testPack);
    });

    it('should activate a scenario', async () => {
      await store.getState().activateScenario('test-scenario');
      
      const state = store.getState();
      expect(state.activeScenario).toBe('test-scenario');
      expect(state.isScenarioActive('test-scenario')).toBe(true);
      expect(state.currentSeed).toBe(54321);
    });

    it('should get current scenario', async () => {
      await store.getState().activateScenario('test-scenario');
      
      const current = store.getState().getCurrentScenario();
      expect(current).toEqual(testPack.scenarios['test-scenario']);
    });

    it('should list all scenarios', () => {
      const scenarios = store.getState().listScenarios();
      
      expect(scenarios).toHaveLength(1);
      expect(scenarios[0]).toEqual({
        packId: 'test-pack',
        scenario: testPack.scenarios['test-scenario'],
      });
    });

    it('should deactivate a scenario', async () => {
      await store.getState().activateScenario('test-scenario');
      await store.getState().deactivateScenario('test-scenario');
      
      expect(store.getState().activeScenario).toBeUndefined();
      expect(store.getState().isScenarioActive('test-scenario')).toBe(false);
    });
  });

  describe('Persona Management', () => {
    beforeEach(() => {
      store.getState().registerPack(testPack);
    });

    it('should activate a persona', () => {
      store.getState().activatePersona('test-persona');
      
      const state = store.getState();
      expect(state.activePersona).toBe('test-persona');
    });

    it('should get current persona', () => {
      store.getState().activatePersona('test-persona');
      
      const current = store.getState().getCurrentPersona();
      expect(current).toEqual(testPack.personas['test-persona']);
    });

    it('should list all personas', () => {
      const personas = store.getState().listPersonas();
      
      expect(personas).toHaveLength(1);
      expect(personas[0]).toEqual({
        packId: 'test-pack',
        persona: testPack.personas['test-persona'],
      });
    });

    it('should deactivate a persona', () => {
      store.getState().activatePersona('test-persona');
      store.getState().deactivatePersona();
      
      expect(store.getState().activePersona).toBeUndefined();
    });
  });

  describe('Stage Management', () => {
    it('should set and get stage', () => {
      expect(store.getState().getStage()).toBe('development');
      
      store.getState().setStage('testing');
      expect(store.getState().getStage()).toBe('testing');
      
      store.getState().setStage('production');
      expect(store.getState().getStage()).toBe('production');
    });
  });

  describe('Seed Management', () => {
    it('should set and get seed', () => {
      expect(store.getState().getSeed()).toBe(12345);
      
      store.getState().setSeed(99999);
      expect(store.getState().getSeed()).toBe(99999);
    });

    it('should randomize seed', () => {
      const originalSeed = store.getState().getSeed();
      store.getState().randomizeSeed();
      
      expect(store.getState().getSeed()).not.toBe(originalSeed);
      expect(store.getState().getSeed()).toBeGreaterThan(0);
      expect(store.getState().getSeed()).toBeLessThan(1000000);
    });
  });

  describe('Data Management', () => {
    it('should set and get generated data', () => {
      const testData = { id: '123', name: 'Test' };
      store.getState().setGeneratedData('user:1', testData);
      
      const retrieved = store.getState().getGeneratedData<typeof testData>('user:1');
      expect(retrieved).toEqual(testData);
    });

    it('should clear generated data', () => {
      store.getState().setGeneratedData('user:1', { id: '123' });
      store.getState().setGeneratedData('user:2', { id: '456' });
      
      store.getState().clearGeneratedData();
      
      expect(store.getState().getGeneratedData('user:1')).toBeUndefined();
      expect(store.getState().getGeneratedData('user:2')).toBeUndefined();
    });
  });

  describe('Snapshot Management', () => {
    beforeEach(() => {
      store.getState().registerPack(testPack);
    });

    it('should create a snapshot', async () => {
      await store.getState().activateScenario('test-scenario');
      store.getState().activatePersona('test-persona');
      store.getState().setGeneratedData('test', { value: 42 });
      
      const snapshotId = store.getState().createSnapshot('Test Snapshot');
      
      expect(snapshotId).toMatch(/^snapshot-\d+$/);
      
      const snapshots = store.getState().listSnapshots();
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].name).toBe('Test Snapshot');
      expect(snapshots[0].state.activeScenario).toBe('test-scenario');
      expect(snapshots[0].state.activePersona).toBe('test-persona');
      expect(snapshots[0].state.generatedData).toEqual({ test: { value: 42 } });
    });

    it('should restore from snapshot', async () => {
      await store.getState().activateScenario('test-scenario');
      store.getState().setGeneratedData('test', { value: 42 });
      
      const snapshotId = store.getState().createSnapshot('Test Snapshot');
      
      // Change state
      store.getState().deactivateScenario('test-scenario');
      store.getState().clearGeneratedData();
      
      let state = store.getState();
      expect(state.activeScenario).toBeUndefined();
      expect(state.getGeneratedData('test')).toBeUndefined();
      
      // Restore
      store.getState().restoreSnapshot(snapshotId);
      
      state = store.getState();
      expect(state.activeScenario).toBe('test-scenario');
      expect(state.getGeneratedData('test')).toEqual({ value: 42 });
    });

    it('should delete a snapshot', () => {
      const snapshotId = store.getState().createSnapshot('Test Snapshot');
      
      expect(store.getState().listSnapshots()).toHaveLength(1);
      
      store.getState().deleteSnapshot(snapshotId);
      
      expect(store.getState().listSnapshots()).toHaveLength(0);
    });
  });

  describe('Persistence', () => {
    it('should save to localStorage', () => {
      store.getState().setSeed(99999);
      store.getState().setStage('testing');
      store.getState().setGeneratedData('test', { value: 42 });
      
      store.getState().saveToLocalStorage();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'synthkit-store',
        expect.stringContaining('"currentSeed":99999')
      );
    });

    it('should load from localStorage', () => {
      const stored = {
        activeScenario: 'stored-scenario',
        activePersona: 'stored-persona',
        activeStage: 'production',
        currentSeed: 77777,
        generatedData: { test: { value: 42 } },
        snapshots: {},
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(stored));
      
      store.getState().loadFromLocalStorage();
      
      const state = store.getState();
      expect(state.activeScenario).toBe('stored-scenario');
      expect(state.activePersona).toBe('stored-persona');
      expect(state.activeStage).toBe('production');
      expect(state.currentSeed).toBe(77777);
      expect(state.getGeneratedData('test')).toEqual({ value: 42 });
    });
  });

  describe('Reset', () => {
    it('should reset to initial store.getState()', async () => {
      store.getState().registerPack(testPack);
      await store.getState().activateScenario('test-scenario');
      store.getState().activatePersona('test-persona');
      store.getState().setGeneratedData('test', { value: 42 });
      
      store.getState().reset();
      
      expect(store.getState().activeScenario).toBeUndefined();
      expect(store.getState().activePersona).toBeUndefined();
      expect(store.getState().activeStage).toBe('development');
      expect(store.getState().currentSeed).toBe(12345);
      expect(store.getState().getGeneratedData('test')).toBeUndefined();
      expect(store.getState().packs.size).toBe(0);
    });
  });
});
