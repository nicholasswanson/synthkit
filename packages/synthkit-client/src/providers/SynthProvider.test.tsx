import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SynthProvider, useSynthContext } from './SynthProvider';
import type { SynthConfig } from '@synthkit/sdk';

// Mock the SDK modules
vi.mock('@synthkit/sdk', () => ({
  synthStore: vi.fn(() => ({
    getState: () => mockStore,
    subscribe: vi.fn(),
  })),
  loadPacks: vi.fn(() => Promise.resolve(mockPacks)),
}));

// Mock MSW setup
vi.mock('../msw/setup', () => ({
  setupMSW: vi.fn(() => Promise.resolve()),
  useMSWHandlers: vi.fn(),
}));

// Mock route handlers
vi.mock('../msw/route-handlers', () => ({
  createPackHandlers: vi.fn(() => []),
}));

const mockStore = {
  config: {
    packs: ['test-pack'],
    scenarios: {},
    generators: {},
  },
  packs: new Map(),
  activeScenarios: new Set(),
  activeScenario: undefined,
  activePersona: undefined,
  activeStage: 'development',
  currentSeed: 12345,
  generatedData: new Map(),
  snapshots: new Map(),
  
  // Mock methods
  setConfig: vi.fn(),
  registerPack: vi.fn(),
  loadFromLocalStorage: vi.fn(),
};

const mockPacks = [
  {
    id: 'test-pack',
    name: 'Test Pack',
    description: 'Test pack',
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
    scenarios: {},
    personas: {},
    routes: {
      '/api/users': {
        schema: 'user',
        rest: true,
      },
    },
  },
];

describe('SynthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function TestComponent() {
    const context = useSynthContext();
    return (
      <div>
        <div data-testid="ready">{context.isReady ? 'ready' : 'loading'}</div>
        <div data-testid="msw">{context.mswEnabled ? 'enabled' : 'disabled'}</div>
        <div data-testid="packs">{context.packs.length}</div>
      </div>
    );
  }

  it('should initialize with default state', async () => {
    render(
      <SynthProvider>
        <TestComponent />
      </SynthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('msw')).toHaveTextContent('disabled');
    expect(screen.getByTestId('packs')).toHaveTextContent('0');
  });

  it('should load packs and setup MSW when config provided', async () => {
    const config: SynthConfig = {
      packs: ['test-pack'],
      scenarios: {},
      generators: {},
      msw: {
        enabled: true,
      },
    };

    const { setupMSW } = await import('../msw/setup');
    const { loadPacks } = await import('@synthkit/sdk');

    render(
      <SynthProvider config={config} enableMSW={true}>
        <TestComponent />
      </SynthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('ready');
    });

    expect(loadPacks).toHaveBeenCalledWith(['test-pack']);
    expect(setupMSW).toHaveBeenCalled();
    expect(screen.getByTestId('msw')).toHaveTextContent('enabled');
    expect(screen.getByTestId('packs')).toHaveTextContent('1');
  });

  it('should call onReady callback', async () => {
    const onReady = vi.fn();

    render(
      <SynthProvider onReady={onReady}>
        <TestComponent />
      </SynthProvider>
    );

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
    });
  });

  it('should not setup MSW when disabled', async () => {
    const config: SynthConfig = {
      packs: ['test-pack'],
      scenarios: {},
      generators: {},
      msw: {
        enabled: false,
      },
    };

    const { setupMSW } = await import('../msw/setup');

    render(
      <SynthProvider config={config} enableMSW={true}>
        <TestComponent />
      </SynthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('ready');
    });

    expect(setupMSW).not.toHaveBeenCalled();
    expect(screen.getByTestId('msw')).toHaveTextContent('disabled');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSynthContext must be used within a SynthProvider');

    consoleSpy.mockRestore();
  });
});
