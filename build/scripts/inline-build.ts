/**
 * Turns the Vite build in web/dist/ into one self-contained file, web/dist/index.html, with the
 * JavaScript (the model included) and the CSS inlined. It opens from the file system by
 * double-clicking, with no server, so the views can be shared with people who don't run the
 * container. Run by `npm run build:web` after `vite build`.
 */

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../web/dist/', import.meta.url));
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
