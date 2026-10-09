import { defineConfig } from '@playwright/test';

// Browser tests against the dev server on port 8001, so they don't clash with the server the
// user has open on 8000. Chromium comes preinstalled in the container (version pinned to 1.63.0).
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:8001', viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: 'npx vite --config web/vite.config.ts --port 8001',
    url: 'http://127.0.0.1:8001',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
