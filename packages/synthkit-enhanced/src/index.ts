// Synthkit Enhanced - Main Export
export { synthkit, SynthkitCore } from './core';
export type {
  SynthkitData,
  SynthkitOptions,
  SynthkitResult,
  SynthkitStatus,
  SynthkitDebug,
  Customer,
  Charge,
  Subscription,
  Invoice,
  Plan
} from './types';

// Import for internal use
import { synthkit } from './core';

// Simple one-line API for vibe coders
export async function getData(options?: { showStatus?: boolean; debug?: boolean }) {
  return synthkit.getData(options);
}

// Legacy compatibility (if needed)
export const useSynthkitData = getData;
