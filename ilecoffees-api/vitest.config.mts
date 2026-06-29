import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    globalSetup: ['tests/setup/global-setup.ts'],
    setupFiles: ['tests/setup/setup.ts'],
    fileParallelism: false,
  },
})
