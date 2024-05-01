import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: ['src/constructs/', 'src/db/', 'src/stacks/', 'src/stages/'],
      include: ['src/**/*.ts'],
    },
    globals: true,
    watch: false,
  },
});
