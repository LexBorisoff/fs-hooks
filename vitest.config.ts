import tsconfigPaths from 'vite-tsconfig-paths';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: [
        'src/types/**',
        '*config.js',
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
