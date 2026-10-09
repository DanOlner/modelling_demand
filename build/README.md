# modelling_firm_demand

A stylised flow model of where GVA is made, booked and received: a core city, a manufacturing town, a
rural area and the rest of the world. It follows model spec v1 (in the research notes). The model is
TypeScript and runs in the browser, behind interactive views.

## Running it

Needs Node 20.19 or later. `npm install` first.

| Command | What it does |
|---|---|
| `npm run dev` | Serves the views at http://localhost:8000 |
| `npm run build:web` | Builds the views as one self-contained file, `web/dist/index.html`, to open by double-clicking or share |
| `npm test` | Unit tests: the model, the spec's acceptance tests and the data behind the views |
| `npm run test:e2e` | Browser tests of every view (Playwright 1.63.0), saving screenshots to `out/screenshots/` |
| `npm run typecheck` | Type checks, including that the model uses no browser- or Node-specific code |
| `npm run calibrate` | Recalibrates the base year; rerun it whenever the base parameters change |
| `npm run experiments` | Runs every experiment and writes tidy CSV and JSON results to `out/experiments/` |

## Where things are

- `src/engine/`: the model, including the lenses (`src/engine/lenses/`).
- `src/params/`: the spec's parameters and the stored calibration.
- `src/scenarios/`: the experiments E1–E8 and their expected effects.
- `web/`: the views (Svelte).
- `tests/`, `e2e/`: unit and browser tests.
- `docs/`:
  - the build plan, the views plan and the build worklog;
  - a manifest of the research notes.
