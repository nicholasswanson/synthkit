// Simplified MSW setup for Synthkit
// Currently unused since demo app generates data directly in frontend

export const handlers: any[] = [];

// Simplified MSW initialization (currently disabled)
export async function startMSW() {
  // MSW disabled - demo app generates data directly without API mocking
  console.log('[MSW] Disabled - using direct data generation');
  return null;
}

// Placeholder for future MSW handler updates
export function updateHandlers(newHandlers: any[]) {
  // Currently unused - handlers not needed for direct data generation
  console.log('[MSW] Handler update skipped - direct generation mode');
}
