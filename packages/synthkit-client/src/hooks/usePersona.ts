import { useState, useCallback } from 'react';
import { useSynthContext } from '../providers/SynthProvider';
import type { Generator } from '@synthkit/sdk';

export interface Persona {
  id: string;
  name: string;
  description?: string;
  data: Record<string, any>;
  generators: string[];
}

export function usePersona() {
  const { store } = useSynthContext();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const createPersona = useCallback((name: string, generatorKeys: string[]): Persona => {
    const data: Record<string, any> = {};
    const generators: string[] = [];

    // Generate data for each requested generator
    for (const key of generatorKeys) {
      const [packId, generatorName] = key.split(':');
      const pack = store.getPack(packId);
      
      // TODO: Update to use new schema-based generation
      // if (pack && pack.generators[generatorName]) {
      //   const generator = pack.generators[generatorName];
      //   data[key] = generator.generate();
      //   generators.push(key);
      // }
    }

    const persona: Persona = {
      id: `persona-${Date.now()}`,
      name,
      data,
      generators,
    };

    // Store the generated data
    store.setGeneratedData(persona.id, data);
    
    return persona;
  }, [store]);

  const switchPersona = useCallback((persona: Persona | null) => {
    setCurrentPersona(persona);
    
    if (persona) {
      // Update store with persona data
      for (const [key, value] of Object.entries(persona.data)) {
        store.setGeneratedData(key, value);
      }
    }
  }, [store]);

  const addPersona = useCallback((persona: Persona) => {
    setPersonas((prev) => [...prev, persona]);
  }, []);

  const removePersona = useCallback((personaId: string) => {
    setPersonas((prev) => prev.filter((p) => p.id !== personaId));
    if (currentPersona?.id === personaId) {
      setCurrentPersona(null);
    }
  }, [currentPersona]);

  const regeneratePersona = useCallback((personaId: string) => {
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return;

    const newData: Record<string, any> = {};
    
    // Regenerate data for each generator
    for (const key of persona.generators) {
      const [packId, generatorName] = key.split(':');
      const pack = store.getPack(packId);
      
      // TODO: Update to use new schema-based generation
      // if (pack && pack.generators[generatorName]) {
      //   const generator = pack.generators[generatorName];
      //   newData[key] = generator.generate();
      // }
    }

    const updatedPersona = { ...persona, data: newData };
    
    setPersonas((prev) => 
      prev.map((p) => p.id === personaId ? updatedPersona : p)
    );
    
    if (currentPersona?.id === personaId) {
      setCurrentPersona(updatedPersona);
      // Update store with new data
      for (const [key, value] of Object.entries(newData)) {
        store.setGeneratedData(key, value);
      }
    }
  }, [personas, currentPersona, store]);

  return {
    currentPersona,
    personas,
    createPersona,
    switchPersona,
    addPersona,
    removePersona,
    regeneratePersona,
  };
}
