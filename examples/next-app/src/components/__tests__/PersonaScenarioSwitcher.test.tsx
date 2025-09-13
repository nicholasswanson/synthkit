import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonaScenarioSwitcher } from '../PersonaScenarioSwitcher';

// Mock the useSynth hook
vi.mock('@/lib/synth-context', () => ({
  useSynth: () => ({
    listCategories: () => [
      { packId: 'test', scenario: { id: 'dev', name: 'Development' } },
      { packId: 'test', scenario: { id: 'prod', name: 'Production' } }
    ],
    listRoles: () => [
      { packId: 'test', persona: { id: 'admin', name: 'Admin' } },
      { packId: 'test', persona: { id: 'user', name: 'User' } }
    ],
    listSnapshots: () => [],
    activeCategory: 'dev',
    activeRole: 'admin',
    activeStage: 'early',
    currentGenerationId: 12345,
    activateCategory: vi.fn(),
    deactivateCategory: vi.fn(),
    activateRole: vi.fn(),
    deactivateRole: vi.fn(),
    setStage: vi.fn(),
    setGenerationId: vi.fn(),
    randomizeGenerationId: vi.fn(),
    createSnapshot: vi.fn(),
    restoreSnapshot: vi.fn(),
    reset: vi.fn()
  })
}));

describe('PersonaScenarioSwitcher', () => {
  it('should render in compact mode', () => {
    render(<PersonaScenarioSwitcher compact={true} />);
    
    // Should show select elements
    expect(screen.getByTitle('Scenario')).toBeInTheDocument();
    expect(screen.getByTitle('Persona')).toBeInTheDocument();
    expect(screen.getByTitle('Stage')).toBeInTheDocument();
  });

  it('should render in expanded mode', () => {
    render(<PersonaScenarioSwitcher compact={false} />);
    
    // Should show labels
    expect(screen.getByText('Scenario Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText('Scenario')).toBeInTheDocument();
    expect(screen.getByLabelText('Persona')).toBeInTheDocument();
    expect(screen.getByLabelText('Stage')).toBeInTheDocument();
  });

  it('should display current selections', () => {
    render(<PersonaScenarioSwitcher compact={false} />);
    
    const scenarioSelect = screen.getByLabelText('Scenario') as HTMLSelectElement;
    const personaSelect = screen.getByLabelText('Persona') as HTMLSelectElement;
    const stageSelect = screen.getByLabelText('Stage') as HTMLSelectElement;
    
    expect(scenarioSelect.value).toBe('dev');
    expect(personaSelect.value).toBe('admin');
    expect(stageSelect.value).toBe('early');
  });

  it('should call activateCategory when scenario changes', async () => {
    const { useSynth } = vi.mocked(await import('@/lib/synth-context'));
    const mockSynth = useSynth();
    
    render(<PersonaScenarioSwitcher compact={false} />);
    
    const scenarioSelect = screen.getByLabelText('Scenario');
    fireEvent.change(scenarioSelect, { target: { value: 'prod' } });
    
    expect(mockSynth.activateCategory).toHaveBeenCalledWith('prod');
  });

  it('should show seed/generation ID input', () => {
    render(<PersonaScenarioSwitcher compact={false} />);
    
    const seedInput = screen.getByLabelText('Seed/Generation ID') as HTMLInputElement;
    expect(seedInput).toBeInTheDocument();
    expect(seedInput.value).toBe('12345');
  });

  it('should have reset button', () => {
    render(<PersonaScenarioSwitcher compact={false} />);
    
    const resetButton = screen.getByText('Reset All');
    expect(resetButton).toBeInTheDocument();
  });

  it('should handle reset with confirmation', async () => {
    const { useSynth } = vi.mocked(await import('@/lib/synth-context'));
    const mockSynth = useSynth();
    
    // Mock window.confirm
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<PersonaScenarioSwitcher compact={false} />);
    
    const resetButton = screen.getByText('Reset All');
    fireEvent.click(resetButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to reset all settings?');
    expect(mockSynth.reset).toHaveBeenCalled();
    
    mockConfirm.mockRestore();
  });
});
