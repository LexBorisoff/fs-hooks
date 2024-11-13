import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, coverageConfigDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: ['**/types/*', ...coverageConfigDefaults.exclude],
    },
  },
});
