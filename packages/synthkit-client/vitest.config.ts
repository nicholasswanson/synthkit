import { createBrowserTestConfig } from '../../vitest.shared';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(
  createBrowserTestConfig(),
  {
    test: {
      setupFiles: ['./test/setup.ts'],
    },
  }
);
