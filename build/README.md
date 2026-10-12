# modelling_firm_demand

A stylised flow model of where GVA is made, booked and received: a core city, a manufacturing town, a
rural area and the rest of the world. It follows model spec v1 (in the research notes). The model is
TypeScript and runs in the browser, behind interactive views.

## Running it

Needs Node 20.19 or later. `npm install` first.

| Command | What it does |
|---|---|
| `npm run dev` | Serves the views at http://localhost:8000 while you work on them |
| `npm run build:web` | Builds the views as one self-contained file, `docs/gva-flows-v1/index.html`, for GitHub Pages. It also opens by double-clicking. |
| `npm run preview:pages` | Serves `docs/` at http://localhost:8001, as GitHub Pages will |
| `npm test` | Unit tests: the model, the spec's acceptance tests and the data behind the views |
| `npm run test:e2e` | Browser tests of every view (Playwright 1.63.0), saving screenshots to `out/screenshots/`. Run `npm run build:web` first: two tests check the built site. |
| `npm run typecheck` | Type checks, including that the model uses no browser- or Node-specific code |
| `npm run calibrate` | Recalibrates the base year; rerun it whenever the base parameters change |
| `npm run experiments` | Runs every experiment and writes tidy CSV and JSON results to `out/experiments/` |

## Publishing on GitHub Pages

`docs/` is the GitHub Pages site. Each live model is a single self-contained file in its own
subfolder, and `docs/index.html` lists them.

**Why a GitHub Actions workflow publishes it.** The repository holds the whole project, the
research and this build folder, so the site sits at `build/docs/`, not at the top of the
repository. GitHub Pages' simple *Deploy from a branch* setting can serve only the repository
root or a top-level `/docs` folder, so it can't point at `build/docs`. A workflow can publish any
folder, so `.github/workflows/publish-models.yml`, at the repository root, publishes `build/docs`
whenever a push changes it. It publishes the folder exactly as committed and builds nothing
itself.

- **Setting it up (once):** in the repository's settings on GitHub, under Pages, set *Source* to *GitHub Actions*. The workflow is already at the repository root, outside this build folder, which is all the build container can see.
- **Testing it:** run *Publish live models* by hand from the repository's Actions tab. A check step fails with a message if the landing page or a model's `index.html` is missing, or if `docs/` contains symbolic links.
- **After changing the model or the views:** run `npm run build:web` and commit `docs/`. Pushing it publishes it.
- **Adding another model:** build it into a new subfolder of `docs/`, and add it to the list in `docs/index.html`. This model's folder name is set in `web/pages.ts`.

## Where things are

- `src/engine/`: the model, including the lenses (`src/engine/lenses/`).
- `src/params/`: the spec's parameters and the stored calibration.
- `src/scenarios/`: the experiments E1–E8 and their expected effects.
- `web/`: the views' source (Svelte).
- `docs/`: the GitHub Pages site, with the built views, published by the workflow above.
- `for-repo-root/`, when it exists: files that belong at the repository root, waiting for the user to move them there.
- `tests/`, `e2e/`: unit and browser tests.
- `plan_docs/`:
  - the build plan, the views plan and the build worklog;
  - a manifest of the research notes.
