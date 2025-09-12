import { useState, useCallback } from 'react';
import { useSynthContext } from '../providers/SynthProvider';

export function useScenario() {
  const { store } = useSynthContext();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const activateScenario = useCallback(async (scenarioId: string) => {
    setLoading((prev) => ({ ...prev, [scenarioId]: true }));
    
    try {
      await store.activateCategory(scenarioId);
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
      await store.deactivateCategory(scenarioId);
    } catch (error) {
      console.error(`Failed to deactivate scenario ${scenarioId}:`, error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, [scenarioId]: false }));
    }
  }, [store]);

  const toggleScenario = useCallback(async (scenarioId: string) => {
    if (store.isCategoryActive(scenarioId)) {
      await deactivateScenario(scenarioId);
    } else {
      await activateScenario(scenarioId);
    }
  }, [store, activateScenario, deactivateScenario]);

  const getScenarios = useCallback(() => {
    const categoryList = store.listCategories();
    
    return categoryList.map(({ packId, category }) => ({
      id: category.id,
      packId,
      scenario: category, // Keep as scenario for compatibility
      isActive: store.isCategoryActive(category.id),
      isLoading: loading[category.id] || false,
    }));
  }, [store, loading]);

  return {
    scenarios: getScenarios(),
    activeScenarios: Array.from(store.activeCategories),
    activateScenario,
    deactivateScenario,
    toggleScenario,
    isScenarioActive: store.isCategoryActive.bind(store),
  };
}