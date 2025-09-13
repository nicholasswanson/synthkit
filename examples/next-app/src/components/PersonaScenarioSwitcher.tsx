'use client';

import React, { useState } from 'react';
import { useSynth } from '@/lib/synth-context';

type Stage = 'development' | 'testing' | 'production';

interface PersonaScenarioSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function PersonaScenarioSwitcher({
  className = '',
  compact = false
}: PersonaScenarioSwitcherProps) {
  const synth = useSynth();
  const [snapshotName, setSnapshotName] = useState('');

  // Get all scenarios and personas
  const scenarios = synth.listCategories();
  const personas = synth.listRoles();
  const snapshots = synth.listSnapshots();

  const handleScenarioChange = async (scenarioId: string) => {
    if (scenarioId === 'none') {
      if (synth.activeCategory) {
        synth.deactivateCategory();
      }
    } else {
      await synth.activateCategory(scenarioId);
    }
  };

  const handlePersonaChange = (personaId: string) => {
    if (personaId === 'none') {
      synth.deactivateRole();
    } else {
      synth.activateRole(personaId);
    }
  };

  const handleStageChange = (stage: Stage) => {
    synth.setStage(stage);
  };

  const handleSeedChange = (seed: string) => {
    const seedNum = parseInt(seed, 10);
    if (!isNaN(seedNum)) {
      synth.setGenerationId(seedNum);
    }
  };

  const handleRandomizeSeed = () => {
    synth.randomizeGenerationId();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings?')) {
      synth.reset();
      setSnapshotName('');
    }
  };

  const handleCreateSnapshot = () => {
    if (snapshotName.trim()) {
      synth.createSnapshot(snapshotName.trim());
      setSnapshotName('');
    }
  };

  if (!synth.isReady) {
    return <div className={className}>Loading...</div>;
  }

  if (compact) {
    return (
      <div className={`flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <select
          value={synth.activeCategory || 'none'}
          onChange={(e) => handleScenarioChange(e.target.value)}
          className="px-2 py-1 text-sm border rounded"
          title="Scenario"
        >
          <option value="none">No Scenario</option>
          {scenarios.map(({ packId, scenario }) => (
            <option key={`${packId}:${scenario.id}`} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>

        <select
          value={synth.activeRole || 'none'}
          onChange={(e) => handlePersonaChange(e.target.value)}
          className="px-2 py-1 text-sm border rounded"
          title="Persona"
        >
          <option value="none">No Persona</option>
          {personas.map(({ packId, persona }) => (
            <option key={`${packId}:${persona.id}`} value={persona.id}>
              {persona.name}
            </option>
          ))}
        </select>

        <select
          value={synth.activeStage}
          onChange={(e) => handleStageChange(e.target.value as Stage)}
          className="px-2 py-1 text-sm border rounded"
          title="Stage"
        >
          <option value="development">Development</option>
          <option value="testing">Testing</option>
          <option value="production">Production</option>
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={synth.currentGenerationId}
            onChange={(e) => handleSeedChange(e.target.value)}
            className="w-20 px-2 py-1 text-sm border rounded"
            title="Seed"
          />
          <button
            onClick={handleRandomizeSeed}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
            title="Randomize"
          >
            🎲
          </button>
        </div>

        <button 
          onClick={handleReset} 
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          title="Reset"
        >
          ↺
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 border rounded-lg bg-white dark:bg-gray-900 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Configuration Controls</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="scenario-select" className="block text-sm font-medium mb-1">
              Scenario:
            </label>
            <select
              id="scenario-select"
              value={synth.activeCategory || 'none'}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="none">No Scenario</option>
              {scenarios.map(({ packId, scenario }) => (
                <option key={`${packId}:${scenario.id}`} value={scenario.id}>
                  {scenario.name} ({packId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="persona-select" className="block text-sm font-medium mb-1">
              Persona:
            </label>
            <select
              id="persona-select"
              value={synth.activeRole || 'none'}
              onChange={(e) => handlePersonaChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="none">No Persona</option>
              {personas.map(({ packId, persona }) => (
                <option key={`${packId}:${persona.id}`} value={persona.id}>
                  {persona.name} ({packId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stage-select" className="block text-sm font-medium mb-1">
              Stage:
            </label>
            <select
              id="stage-select"
              value={synth.activeStage}
              onChange={(e) => handleStageChange(e.target.value as Stage)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="seed-input" className="block text-sm font-medium mb-1">
              Seed:
            </label>
            <div className="flex gap-2">
              <input
                id="seed-input"
                type="number"
                value={synth.currentGenerationId}
                onChange={(e) => handleSeedChange(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <button
                onClick={handleRandomizeSeed}
                className="px-3 py-2 border rounded-md hover:bg-gray-50"
                title="Randomize"
              >
                🎲
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="snapshot-input" className="block text-sm font-medium mb-1">
              Snapshots:
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="snapshot-input"
                type="text"
                placeholder="Snapshot name..."
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSnapshot()}
              />
              <button
                onClick={handleCreateSnapshot}
                disabled={!snapshotName.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            
            {snapshots.length > 0 && (
              <select className="w-full px-3 py-2 border rounded-md">
                <option value="">Select snapshot to restore...</option>
                {snapshots.map((snapshot) => (
                  <option key={snapshot.id} value={snapshot.id}>
                    {snapshot.name} ({new Date(snapshot.timestamp).toLocaleString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Reset All Settings
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-sm text-gray-600 dark:text-gray-400">
        <div className="grid grid-cols-2 gap-4">
          <div>MSW: {synth.mswEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
          <div>Packs: {synth.packs.length} loaded</div>
        </div>
      </div>
    </div>
  );
}
