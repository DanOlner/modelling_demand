/**
 * Turns the Vite build in docs/<model folder>/ into one self-contained file, index.html, with
 * the JavaScript (the model included) and the CSS inlined. GitHub Pages serves it from docs/ (see
 * web/pages.ts); it also opens from the file system by double-clicking, with no server. Run by
 * `npm run build:web` after `vite build`.
 */

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MODEL_FOLDER, PAGES_DIR } from '../web/pages';

const dist = fileURLToPath(new URL(`../${PAGES_DIR}/${MODEL_FOLDER}/`, import.meta.url));
let html = readFileSync(`${dist}index.html`, 'utf8');
const assets = new Set<string>();

html = html.replace(/<link rel="stylesheet"[^>]*href="\.?\/?(assets\/[^"]+\.css)"[^>]*>/g, (_, file: string) => {
  assets.add(file);
  return `<style>\n${readFileSync(dist + file, 'utf8')}</style>`;
});
html = html.replace(/<script type="module"[^>]*src="\.?\/?(assets\/[^"]+\.js)"[^>]*><\/script>/g, (_, file: string) => {
  assets.add(file);
  // A literal "</script" inside the code would end the element early.
  const code = readFileSync(dist + file, 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">\n${code}</script>`;
});
if (assets.size < 2) throw new Error(`Expected a stylesheet and a script to inline, found ${[...assets].join(', ') || 'none'}`);
writeFileSync(`${dist}index.html`, html);
rmSync(`${dist}assets`, { recursive: true, force: true });
console.log(`Wrote ${dist}index.html (${Math.round(html.length / 1024)} kB), self-contained`);
