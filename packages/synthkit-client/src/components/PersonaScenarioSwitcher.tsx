import React, { useState, useCallback, useMemo } from 'react';
import { useSynth } from '../hooks/useSynth';
import type { Stage } from '@synthkit/sdk';

export interface PersonaScenarioSwitcherProps {
  className?: string;
  showSeed?: boolean;
  showSnapshots?: boolean;
  compact?: boolean;
}

// Import styles as a string (we'll inline them for now)
const componentStyles = `
.synthkit-switcher {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #ffffff;
}

.synthkit-switcher--compact {
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.synthkit-switcher__section {
  margin-bottom: 1.5rem;
}

.synthkit-switcher__section:last-child {
  margin-bottom: 0;
}

.synthkit-switcher__field {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.synthkit-switcher__seed-controls {
  flex: 1;
  display: flex;
  gap: 0.5rem;
}

.synthkit-switcher__actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.synthkit-switcher__info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #718096;
  font-size: 0.75rem;
}
`;

export function PersonaScenarioSwitcher({
  className = '',
  showSeed = true,
  showSnapshots = true,
  compact = false
}: PersonaScenarioSwitcherProps) {
  const synth = useSynth();
  const [snapshotName, setSnapshotName] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState('');

  // Get all scenarios across all packs
  const scenarios = useMemo(() => {
    return synth.listScenarios();
  }, [synth]);

  // Get all personas across all packs
  const personas = useMemo(() => {
    return synth.listPersonas();
  }, [synth]);

  // Get all snapshots
  const snapshots = useMemo(() => {
    return synth.listSnapshots();
  }, [synth]);

  // Handlers
  const handleScenarioChange = useCallback(async (scenarioId: string) => {
    if (scenarioId === 'none') {
      synth.deactivateScenario(synth.activeScenario || '');
    } else {
      await synth.activateScenario(scenarioId);
    }
  }, [synth]);

  const handlePersonaChange = useCallback((personaId: string) => {
    if (personaId === 'none') {
      synth.deactivatePersona();
    } else {
      synth.activatePersona(personaId);
    }
  }, [synth]);

  const handleStageChange = useCallback((stage: Stage) => {
    synth.setStage(stage);
  }, [synth]);

  const handleSeedChange = useCallback((seed: string) => {
    const seedNum = parseInt(seed, 10);
    if (!isNaN(seedNum)) {
      synth.setSeed(seedNum);
    }
  }, [synth]);

  const handleRandomizeSeed = useCallback(() => {
    synth.randomizeSeed();
  }, [synth]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all settings?')) {
      synth.reset();
      setSnapshotName('');
      setSelectedSnapshot('');
    }
  }, [synth]);

  const handleCreateSnapshot = useCallback(() => {
    if (snapshotName.trim()) {
      synth.createSnapshot(snapshotName.trim());
      setSnapshotName('');
    }
  }, [synth, snapshotName]);

  const handleRestoreSnapshot = useCallback(() => {
    if (selectedSnapshot) {
      synth.restoreSnapshot(selectedSnapshot);
      setSelectedSnapshot('');
    }
  }, [synth, selectedSnapshot]);

  const handleDeleteSnapshot = useCallback((id: string) => {
    if (window.confirm('Delete this snapshot?')) {
      // Note: deleteSnapshot not yet implemented in store
      // synth.deleteSnapshot(id);
    }
  }, []);

  if (!synth.isReady) {
    return <div className={className}>Loading...</div>;
  }

  if (compact) {
    return (
      <div className={`synthkit-switcher synthkit-switcher--compact ${className}`}>
        <select
          value={synth.activeScenario || 'none'}
          onChange={(e) => handleScenarioChange(e.target.value)}
          title="Scenario"
        >
          <option value="none">No Scenario</option>
          {scenarios.map(({ packId, scenario }) => (
            <option key={`${packId}:${scenario.id}`} value={scenario.id}>
              {scenario.name} ({packId})
            </option>
          ))}
        </select>

        <select
          value={synth.activePersona || 'none'}
          onChange={(e) => handlePersonaChange(e.target.value)}
          title="Persona"
        >
          <option value="none">No Persona</option>
          {personas.map(({ packId, persona }) => (
            <option key={`${packId}:${persona.id}`} value={persona.id}>
              {persona.name} ({packId})
            </option>
          ))}
        </select>

        <select
          value={synth.activeStage}
          onChange={(e) => handleStageChange(e.target.value as Stage)}
          title="Stage"
        >
          <option value="development">Development</option>
          <option value="testing">Testing</option>
          <option value="production">Production</option>
        </select>

        <button onClick={handleReset} title="Reset">↺</button>
      </div>
    );
  }

  return (
    <div className={`synthkit-switcher ${className}`}>
      <div className="synthkit-switcher__section">
        <h3>Configuration</h3>
        
        <div className="synthkit-switcher__field">
          <label htmlFor="scenario-select">Scenario:</label>
          <select
            id="scenario-select"
            value={synth.activeScenario || 'none'}
            onChange={(e) => handleScenarioChange(e.target.value)}
          >
            <option value="none">No Scenario</option>
            {scenarios.map(({ packId, scenario }) => (
              <option key={`${packId}:${scenario.id}`} value={scenario.id}>
                {scenario.name} ({packId})
              </option>
            ))}
          </select>
        </div>

        <div className="synthkit-switcher__field">
          <label htmlFor="persona-select">Persona:</label>
          <select
            id="persona-select"
            value={synth.activePersona || 'none'}
            onChange={(e) => handlePersonaChange(e.target.value)}
          >
            <option value="none">No Persona</option>
            {personas.map(({ packId, persona }) => (
              <option key={`${packId}:${persona.id}`} value={persona.id}>
                {persona.name} ({packId})
              </option>
            ))}
          </select>
        </div>

        <div className="synthkit-switcher__field">
          <label htmlFor="stage-select">Stage:</label>
          <select
            id="stage-select"
            value={synth.activeStage}
            onChange={(e) => handleStageChange(e.target.value as Stage)}
          >
            <option value="development">Development</option>
            <option value="testing">Testing</option>
            <option value="production">Production</option>
          </select>
        </div>

        {showSeed && (
          <div className="synthkit-switcher__field">
            <label htmlFor="seed-input">Seed:</label>
            <div className="synthkit-switcher__seed-controls">
              <input
                id="seed-input"
                type="number"
                value={synth.currentSeed}
                onChange={(e) => handleSeedChange(e.target.value)}
              />
              <button onClick={handleRandomizeSeed} title="Randomize">
                🎲
              </button>
            </div>
          </div>
        )}

        <div className="synthkit-switcher__actions">
          <button onClick={handleReset} className="synthkit-switcher__reset">
            Reset All
          </button>
        </div>
      </div>

      {showSnapshots && (
        <div className="synthkit-switcher__section">
          <h3>Snapshots</h3>
          
          <div className="synthkit-switcher__field">
            <input
              type="text"
              placeholder="Snapshot name..."
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSnapshot()}
            />
            <button 
              onClick={handleCreateSnapshot}
              disabled={!snapshotName.trim()}
            >
              Create Snapshot
            </button>
          </div>

          {snapshots.length > 0 && (
            <div className="synthkit-switcher__field">
              <select
                value={selectedSnapshot}
                onChange={(e) => setSelectedSnapshot(e.target.value)}
              >
                <option value="">Select snapshot...</option>
                {snapshots.map((snapshot) => (
                  <option key={snapshot.id} value={snapshot.id}>
                    {snapshot.name} ({new Date(snapshot.timestamp).toLocaleString()})
                  </option>
                ))}
              </select>
              <button 
                onClick={handleRestoreSnapshot}
                disabled={!selectedSnapshot}
              >
                Restore
              </button>
            </div>
          )}
        </div>
      )}

      <div className="synthkit-switcher__info">
        <small>
          MSW: {synth.mswEnabled ? 'Enabled' : 'Disabled'} | 
          Packs: {synth.packs.length} loaded
        </small>
      </div>
    </div>
  );
}
