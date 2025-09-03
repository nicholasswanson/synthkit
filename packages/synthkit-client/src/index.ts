// Provider exports
export { SynthProvider } from './providers/SynthProvider';
export type { SynthProviderProps } from './providers/SynthProvider';

// Component exports
export { PersonaSwitcher } from './components/PersonaSwitcher';
export { PersonaScenarioSwitcher } from './components/PersonaScenarioSwitcher';
export type { PersonaScenarioSwitcherProps } from './components/PersonaScenarioSwitcher';
export { ScenarioPanel } from './components/ScenarioPanel';

// Next.js integration
export { withSynth } from './nextjs/withSynth';
export type { SynthConfig } from './nextjs/withSynth';

// Hook exports
export { useSynth } from './hooks/useSynth';
export { usePersona } from './hooks/usePersona';
export { useScenario } from './hooks/useScenario';

// MSW exports
export { setupMSW, startMSW, stopMSW, resetMSWHandlers, useMSWHandlers } from './msw/setup';
export { createMockHandler, createRESTHandlers } from './msw/handlers';
export { createRouteHandlers, createPackHandlers } from './msw/route-handlers';
