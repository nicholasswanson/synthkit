import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Setup global test environment if needed
beforeAll(() => {
  // Global setup
});

afterAll(() => {
  // Global teardown
});
