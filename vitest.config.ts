// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // it is recommended to define a name when using inline configs
    environment: 'jsdom',
    projects: ['packages/*', 'packages/cloudflare-workers/*'],
  },
});
