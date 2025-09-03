import React, { useState } from 'react';
import { usePersona } from '../hooks/usePersona';
import { useSynth } from '../hooks/useSynth';

export interface PersonaSwitcherProps {
  className?: string;
  onPersonaChange?: (personaId: string | null) => void;
}

export function PersonaSwitcher({ className, onPersonaChange }: PersonaSwitcherProps) {
  const { packs } = useSynth();
  const { 
    currentPersona, 
    personas, 
    createPersona, 
    switchPersona, 
    addPersona,
    removePersona,
    regeneratePersona 
  } = usePersona();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);

  const availableGenerators = React.useMemo(() => {
    const generators: Array<{ key: string; name: string; packName: string }> = [];
    
    // TODO: Update to use schemas instead of generators
    // for (const pack of packs) {
    //   for (const [name, generator] of Object.entries(pack.generators)) {
    //     generators.push({
    //       key: `${pack.id}:${name}`,
    //       name: generator.name || name,
    //       packName: pack.name,
    //     });
    //   }
    // }
    
    return generators;
  }, [packs]);

  const handleCreatePersona = () => {
    if (!newPersonaName.trim() || selectedGenerators.length === 0) return;
    
    const persona = createPersona(newPersonaName, selectedGenerators);
    addPersona(persona);
    switchPersona(persona);
    onPersonaChange?.(persona.id);
    
    // Reset form
    setIsCreating(false);
    setNewPersonaName('');
    setSelectedGenerators([]);
  };

  const handleSwitchPersona = (personaId: string | null) => {
    const persona = personaId ? personas.find((p) => p.id === personaId) || null : null;
    switchPersona(persona);
    onPersonaChange?.(personaId);
  };

  const handleRemovePersona = (personaId: string) => {
    removePersona(personaId);
    if (currentPersona?.id === personaId) {
      onPersonaChange?.(null);
    }
  };

  return (
    <div className={className}>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Persona Switcher</h3>
        
        <select 
          value={currentPersona?.id || ''} 
          onChange={(e) => handleSwitchPersona(e.target.value || null)}
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="">No Persona</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name}
            </option>
          ))}
        </select>
      </div>

      {currentPersona && (
        <div style={{ marginBottom: '1rem' }}>
          <h4>{currentPersona.name}</h4>
          <p>{currentPersona.description}</p>
          <button onClick={() => regeneratePersona(currentPersona.id)}>
            Regenerate Data
          </button>
          <button onClick={() => handleRemovePersona(currentPersona.id)}>
            Remove
          </button>
        </div>
      )}

      {!isCreating ? (
        <button onClick={() => setIsCreating(true)}>
          Create New Persona
        </button>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h4>Create New Persona</h4>
          
          <input
            type="text"
            placeholder="Persona Name"
            value={newPersonaName}
            onChange={(e) => setNewPersonaName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />

          <div style={{ marginBottom: '0.5rem' }}>
            <h5>Select Generators:</h5>
            {availableGenerators.map((gen) => (
              <label key={gen.key} style={{ display: 'block', marginBottom: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={selectedGenerators.includes(gen.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGenerators([...selectedGenerators, gen.key]);
                    } else {
                      setSelectedGenerators(selectedGenerators.filter((g) => g !== gen.key));
                    }
                  }}
                />
                {' '}{gen.name} ({gen.packName})
              </label>
            ))}
          </div>

          <button 
            onClick={handleCreatePersona}
            disabled={!newPersonaName.trim() || selectedGenerators.length === 0}
          >
            Create
          </button>
          <button onClick={() => {
            setIsCreating(false);
            setNewPersonaName('');
            setSelectedGenerators([]);
          }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
