import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 15000,
    setupFiles: ['./src/setup.ts'],
    sequence: {
      // Run tests in declaration order (important for auth token sharing)
      shuffle: false,
    },
  },
});
