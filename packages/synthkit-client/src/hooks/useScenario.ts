import { useState, useCallback } from 'react';
import { useSynthContext } from '../providers/SynthProvider';

export function useScenario() {
  const { store } = useSynthContext();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const activateScenario = useCallback(async (scenarioId: string) => {
    setLoading((prev) => ({ ...prev, [scenarioId]: true }));
    
    try {
      await store.activateScenario(scenarioId);
    } catch (error) {
      console.error(`Failed to activate scenario ${scenarioId}:`, error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, [scenarioId]: false }));
    }
  }, [store]);

  const deactivateScenario = useCallback(async (scenarioId: string) => {
    setLoading((prev) => ({ ...prev, [scenarioId]: true }));
    
    try {
      await store.deactivateScenario(scenarioId);
    } catch (error) {
      console.error(`Failed to deactivate scenario ${scenarioId}:`, error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, [scenarioId]: false }));
    }
  }, [store]);

  const toggleScenario = useCallback(async (scenarioId: string) => {
    if (store.isScenarioActive(scenarioId)) {
      await deactivateScenario(scenarioId);
    } else {
      await activateScenario(scenarioId);
    }
  }, [store, activateScenario, deactivateScenario]);

  const getScenarios = useCallback(() => {
    const scenarioList = store.listScenarios();
    
    return scenarioList.map(({ packId, scenario }) => ({
      id: scenario.id,
      packId,
      scenario,
      isActive: store.isScenarioActive(scenario.id),
      isLoading: loading[scenario.id] || false,
    }));
  }, [store, loading]);

  return {
    scenarios: getScenarios(),
    activeScenarios: Array.from(store.activeScenarios),
    activateScenario,
    deactivateScenario,
    toggleScenario,
    isScenarioActive: store.isScenarioActive,
  };
}
