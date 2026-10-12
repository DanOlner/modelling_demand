/**
 * Where the views are published. docs/ (build/docs in the repository) is the GitHub Pages site,
 * published by the workflow .github/workflows/publish-models.yml at the repository root. Each
 * live model has its own subfolder there, so several can be hosted side by side and listed on
 * docs/index.html. `npm run build:web` builds this model into docs/<MODEL_FOLDER>/index.html,
 * which is committed so that Pages can serve it. To rename the folder, change it here only.
 */
export const PAGES_DIR = 'docs';
export const MODEL_FOLDER = 'gva-flows-v1';
