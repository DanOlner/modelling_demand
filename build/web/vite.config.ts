import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The container publishes ports 8000 and 8001 to the host, and only for servers listening on
// 0.0.0.0. The dev server uses 8000 (the user's browser); the browser tests use 8001.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [svelte()],
  server: { host: '0.0.0.0', port: 8000, strictPort: true, fs: { allow: ['..'] } },
  preview: { host: '0.0.0.0', port: 8001, strictPort: true },
  // Relative paths and no preload helper, so the build can be inlined into one file.
  base: './',
  build: { outDir: 'dist', emptyOutDir: true, modulePreload: false, cssCodeSplit: false },
});
