/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts', './test/property-testing/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Property-based testing optimization
    pool: 'threads',
    isolate: false, // Safe for property tests without side effects
    fileParallelism: true, // Enable parallel test execution
    // Enhanced timeout for property-based tests
    testTimeout: 30000, // 30 seconds for intensive property tests
    // Minimal output for property testing in coding agents
    reporters: process.env.VITEST_REPORTER === 'verbose' ? ['verbose'] : ['dot'],
    silent: process.env.VITEST_VERBOSE !== 'true' ? true : false,
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        // Include property-based test coverage
        'test/property-testing/**/*.{js,jsx,ts,tsx}'
      ],
      exclude: [
        'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        'test/property-testing/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      // Enhanced coverage thresholds for property testing
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
});
