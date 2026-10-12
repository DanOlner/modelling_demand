/**
 * Where the views are published. GitHub Pages serves the repository's docs/ folder, and each
 * live model has its own subfolder there, so several can be hosted side by side and listed on
 * docs/index.html. `npm run build:web` builds this model into docs/<MODEL_FOLDER>/index.html,
 * which is committed so that Pages can serve it. To rename the folder, change it here only.
 */
export const PAGES_DIR = 'docs';
export const MODEL_FOLDER = 'gva-flows-v1';
