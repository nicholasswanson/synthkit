import React from 'react';
import { useScenario } from '../hooks/useScenario';

export interface ScenarioPanelProps {
  className?: string;
  onScenarioToggle?: (scenarioId: string, isActive: boolean) => void;
}

export function ScenarioPanel({ className, onScenarioToggle }: ScenarioPanelProps) {
  const { scenarios, toggleScenario } = useScenario();

  const handleToggle = async (scenarioId: string, currentlyActive: boolean) => {
    await toggleScenario(scenarioId);
    onScenarioToggle?.(scenarioId, !currentlyActive);
  };

  const scenariosByPack = React.useMemo(() => {
    const grouped = new Map<string, typeof scenarios>();
    
    for (const scenario of scenarios) {
      const existing = grouped.get(scenario.packId) || [];
      grouped.set(scenario.packId, [...existing, scenario]);
    }
    
    return grouped;
  }, [scenarios]);

  return (
    <div className={className}>
      <h3>Scenarios</h3>
      
      {Array.from(scenariosByPack.entries()).map(([packId, packScenarios]) => (
        <div key={packId} style={{ marginBottom: '1rem' }}>
          <h4>{packId}</h4>
          
          <div>
            {packScenarios.map((scenario) => (
              <div 
                key={scenario.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  backgroundColor: scenario.isActive ? '#e8f5e9' : 'white',
                }}
              >
                <div>
                  <strong>{scenario.scenario.name}</strong>
                  {scenario.scenario.description && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                      {scenario.scenario.description}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleToggle(scenario.id, scenario.isActive)}
                  disabled={scenario.isLoading}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: scenario.isActive ? '#f44336' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: scenario.isLoading ? 'not-allowed' : 'pointer',
                    opacity: scenario.isLoading ? 0.6 : 1,
                  }}
                >
                  {scenario.isLoading 
                    ? 'Loading...' 
                    : scenario.isActive 
                      ? 'Deactivate' 
                      : 'Activate'
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {scenarios.length === 0 && (
        <p style={{ color: '#666' }}>No scenarios available. Load some packs first.</p>
      )}
    </div>
  );
}
