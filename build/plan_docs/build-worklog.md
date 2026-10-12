# Build worklog

Results and departures from `/notes/model-spec-v1.md`, one entry per stage (spec §17). The newest entry is at the bottom.

On 12 October 2026 the `docs/` folder was renamed `plan_docs/`. Entries before then say `docs/` for these planning files.

## 3 October 2026: plan

- **Agreed with the user:** TypeScript throughout. The engine comes first, and the front end waits for the stage 8 design pass.
- **Wrote** `docs/build-plan.md` and `docs/notes-manifest.md`.
- **Hand-checked the spec's arithmetic before building:**
  - every cost row sums to 1;
  - the tables of jobs per unit, base markups and GVA per job follow from the cost table;
  - the display units agree;
  - the expected values in T4, T5/E2, T8, T9, E1 and E8 come out exactly (plan §6).
- **Found an inconsistency in the spec:** §1 says seven lenses and seven experiments, but §13 has 11 lenses and §15 has eight experiments. All of them will be built.
- **One question is open for the user:** housing is counted twice in the wealth lens (plan §7).
- **Later the same day,** the user accepted all the plan's recommendations, including leaving the Landlords firms out of equity wealth, and asked for the build to start.

## 3 October 2026: stage 0, set-up

- **Versions differ from the plan.**
  - The container has Node 20.20, and Vitest 5 needs Node 22, so Vitest is pinned at 4.1.11, the newest version that supports Node 20.
  - TypeScript is 7.0.2, the current release, not 5 as the plan said.
  - tsx is 4.23.15.
  - Exact versions are pinned in `package.json`, and `package-lock.json` is written.
- **Two type checks.**
  - `tsconfig.json` checks everything, with Node's types.
  - `tsconfig.engine.json` checks `src/` with neither Node's nor the browser's types, so any use of their APIs in the model fails.
  - Tested by adding a file that used `console` and `process`: the engine check rejected both.
- `out/` added to `.gitignore`.
- **Shared numerical code, with tests:**
  - `linalg`: LU solve with partial pivoting, inverse, Leontief inverse;
  - `rootfind`: Brent's method.

## 3 October 2026: stage 1, parameters and scenarios

- **The spec's parameters as data.** `src/params/spec-v1.ts` holds the §5 cost table and builds every producer from it:
  - jobs per unit = wage share ÷ wage per job;
  - base markups = 1/(inputs + wage share) − 1, computed rather than copied from the spec, so base prices come out at exactly 1.
- **Tests against the spec's tables.** These all pass:
  - every row sums to 1;
  - jobs per unit, GVA per job and base markups match the printed tables at their printed precision;
  - display units are consistent.
- **Checking parameters.** Parameters are plain JSON-compatible data. `compile()` checks them and reports every problem at once.
  - It rejects any number that isn't finite. JSON copies turn NaN into null, which arithmetic would quietly treat as 0, so this keeps the uncalibrated placeholders from slipping through.
- **Scenario format:** `{period, path, set | scale}`.
  - Unknown paths are errors.
  - A change applies from its period onwards.
  - Scenarios can't change period 0.

## 3 October 2026: stage 2, prices

- T9 passes.
- Every base price is 1 to within 10⁻¹².
- The iterative solve agrees with a direct linear solve to within 10⁻¹².
- E2's prices come out exactly: 0.91, 0.8624 and 0.99581952.

## 3 October 2026: stage 3, quantities, incomes and the time loop

- **Investment is folded into the input–output matrix.** This changes how the solve works, not what it computes.
  - §7 has investment equal depreciation at current output. Here that is built into the input coefficients, B = A + δ_j·share_i/p_i, instead of being added to final demand from the previous iteration.
  - So investment equals depreciation exactly at the solved output, and money stocks sum to zero to within rounding error, not just to within the convergence tolerance.
- **Publicly owned producers.** Any net profit they make goes to the government as "enterprise surplus".
  - Under cost pricing that profit is zero, as §8 says, so this has no effect in v1.
  - It keeps the accounts balanced if a scenario ever gives the public-service producers a price other than cost.
- **The time loop was built now.**
  - The plan put it in stage 5, but T8's dynamics need it.
  - Stage 5 will test it on the full model (T3) and check freeze-consumption mode.
- **Tests:**
  - T8 passes for the base year, for period 1 after G rises to 25, and in the long run, all to within 10⁻⁹;
  - the extra SIM check from zero money passes;
  - every identity holds to within 10⁻¹² of GDP in every period.

## 3 October 2026: stage 4, the base year

- **Calibration** converges in about one second (Brent's method at each level). The values are stored in `src/params/spec-v1.calibration.ts` with a fingerprint of the base parameters.

| Unknown | Value |
|---|---|
| Exports X | £20.43bn |
| Income tax rate θ | 0.262871 |
| City population share s_C | 0.286068 |

- **Tests:**
  - T2 passes:
    - every price is 1;
    - the current account and the government balance are zero to within 10⁻⁹ of GDP;
    - unemployment is 5% in every place;
    - in-commuters fill 15% of city jobs.
  - The T1 identities hold to within 10⁻⁹ of GDP.
  - Calibrating again from scratch reproduces the stored values to within 10⁻⁹.
- **Plausibility: all 11 checks are within the spec's ranges.**

| Base-year result | Value | Expected range |
|---|---|---|
| Income tax rate θ | 0.263 | 0.15–0.35 |
| City population share s_C | 0.286 | 0.20–0.50 |
| GDP per resident | £29,004 | £28,000–£40,000 |
| Disposable income ÷ GDP | 0.572 | 0.55–0.75 |
| Labour share of GVA | 0.538 | 0.45–0.60 |
| Exports ÷ GDP | 0.391 | 0.25–0.50 |
| Dividends to overseas owners ÷ GDP | 0.099 | 0.05–0.15 |
| Providential (PRV) share of GVA | 0.155 | 0.12–0.22 |
| Housing share of GVA | 0.123 | 0.08–0.16 |
| C.HQ share of GDP | 0.099 | 0.05–0.25 |
| GVA per job by place | C £81,598; M £53,767; R £52,762 | C > M and C > R |

- **Near the edge.** GDP per resident and disposable income ÷ GDP are both near the bottom of their ranges.
- **Other base-year results:**
  - GDP £52.21bn; GNI £47.04bn.

| | C | M | R |
|---|---|---|---|
| Residents | 514,922 | 856,719 | 428,359 |
| Jobs | 303,864 | 366,400 | 146,181 |
| Disposable income per resident | £22,929 | £14,229 | £13,698 |

- **Check-in with the user** at the end of stage 4, as the plan says. Nothing is outside a range, so the stop point wasn't triggered. The user asked to continue.

## 3 October 2026: stage 5, running over time

- **T3 passes.** With no changes, every period from 1 to 40 reproduces period 0 to within 10⁻⁹:
  - prices, output, GVA, jobs, incomes, consumption, unemployment and money stocks;
  - balances that start at zero stay at zero.

  Each period settles within three iterations.
- **Freeze-consumption mode (S15) works.**
  - On its own it changes nothing.
  - Combined with an export slump, households' quantities stay exactly at base-year levels.
- **Scenario timing:** periods before a change are untouched.
- **A new scenario operation.** Changes can now `add` to a value, as well as `set` or `scale` it, because E7 is written as additions.

## 3 October 2026: stage 6, experiments

- **The experiments as data.** `src/scenarios/experiments.ts` holds E1–E8 and the two variants the spec names:
  - E1b keeps royalties offshore (ρ_IP = 0);
  - E8b also cuts quality 10%.

  Each experiment's expectations are coded as checks comparing t = 5 and t = 40 with t = 4.
- **Tests:**
  - T4, T5 and T7 pass exactly, with consumption frozen;
  - every expectation holds, both at t = 5 and at t = 40, which covers T6;
  - the checker itself was tested: deliberately wrong claims are reported as failures.
- **Results files.** `npm run experiments` writes `out/experiments/`:
  - one CSV of tidy rows and one JSON file per run;
  - `summary.md`, with every expectation and its values.
- **Checked earlier than planned:** E3's residual income and access to services, and E5's residual income. They need only totals by place. The lens-based checks left for stage 7 are E2's head-office booking, E5's housing wealth, E7's local share of purchases, and E8's real GVA per job.
- **T6, the sign of GVA per job under austerity:** it rises in every place, so the streetlight effect appears everywhere.

| Place | Change at t = 5 | Change at t = 40 |
|---|---|---|
| City | +1.63% | +1.69% |
| Town | +1.29% | +1.33% |
| Rural area | +1.63% | +1.68% |

- **Headline results at t = 40,** against t = 4. Before the change: GDP £52.21bn, GNI £47.05bn, unemployment 5.00%, government balance 0.

| Experiment | GDP | GNI | Unemployment | Government balance |
|---|---|---|---|---|
| E1 Cupertino | −3.82% | −0.42% | 4.57% | −£0.43bn |
| E1b Cupertino, cash offshore | −5.10% | −3.34% | 6.28% | −£0.88bn |
| E2 Supermarket squeeze | −1.05% | −1.21% | 5.45% | −£0.24bn |
| E3 Austerity | −2.84% | −3.03% | 9.29% | +£0.41bn |
| E4 Overseas takeover | −1.32% | −2.98% | 6.73% | −£0.47bn |
| E5 City rents up 30% | +0.44% | +0.17% | 6.75% | +£0.09bn |
| E6 Export slump | −9.65% | −9.24% | 13.06% | −£1.75bn |
| E7 Local procurement | +0.88% | +0.87% | 4.02% | +£0.16bn |
| E8 Providential "efficiency" | −2.37% | −2.55% | 8.95% | +£0.22bn |

- **Results the spec doesn't mention,** to raise at the check-in. They follow from the spec's design and are not errors.
  - **E1: GDP falls 3.8% but unemployment falls, from 5.0% to 4.6%.**
    - Public spending is fixed, so the lost profit tax becomes a government deficit.
    - Meanwhile domestic owners receive 35% of the IP holder's dividends, so domestic spending rises.
    - With the cash kept offshore (E1b), unemployment rises instead, to 6.3%.
  - **E5: city rents up 30% raise GDP and city GVA per job while hurting residents.**
    - GDP rises 0.4% and city GVA per job 5.6%.
    - Unemployment rises to 6.8%, and city residual income falls 11%.
    - Rent takes spending away from local shops, and 30% of the landlords' gain goes overseas.
  - **The unemployment responses are large:** 13% after the export slump (E6), 9.3% after austerity (E3).
    - V1 has no supply constraints and no price responses, and nothing stabilises the economy except benefits.
    - These figures are what the spec's design implies, not a fault, but they are large.
  - **E8: cutting 10% of public-service jobs raises unemployment to 9% and cuts measured GDP 2.4%.**
    - The services are valued at cost, so cheaper provision shows up as less output.
    - Stage 7's measurement lens will show real GVA per public-service job: +11.1% under the indicator convention and +0.95% under the input convention.
- **Check-in with the user** at the end of stage 6, as the plan says. The user asked to continue with stage 7.

## 4 October 2026: stage 7, the lenses

- **All 11 lenses are built,** in `src/engine/lenses/`. Every switch variant is computed every period:
  - three ways of booking profit (S1);
  - two public-service output conventions (S2);
  - three measurement views (S3).
- **Base-year values in every record.** Each period's record now carries the base year's prices and wages per job. The measurement lens needs them to value public-service labour at base-year wages (plan §7, interpretation 4).
- **Sector groups live outside the parameters.** Lens 7's groups are in `SPEC_V1_LENSES`, so they don't change the calibration's fingerprint.
- **Lens tests:** 20, in `tests/lenses.test.ts`.
  - **Lens 1:** national GVA is identical under all three bookings. Head-office booking moves exactly the town and rural profits of RetailCo and UtilityCo to the city.
  - **Lens 2:** value capture sums to the price of every product, in the base year, E1 and E2. In E1 the IP holder takes exactly 25% of each gadget.
  - **Lens 3:** the gadget chain yields £132,238 per worker, against £300,000 per job on site. 40% of the chain's jobs are abroad.
  - **Lens 6:**
    - wealth adds up;
    - the landlords are left out of equity wealth;
    - the IP holder's profit counts in GadgetCo's equity.
  - **Lens 7:** each place's group shares add to 1.
  - **Lens 8:** retention is 1 in the minimal economy. The local share of public-service purchases is 2/3 in the city and 5/9 in the town and the rural area.
  - **Lens 9:**
    - in the base year every view equals nominal GVA;
    - E1 follows the own-price formula x(1 − Σa) − r_IP·x;
    - E5 shows the wedge that sector deflators create.
  - **Lens 10:** GNI built from the sectors' primary incomes equals GNI from GDP.
  - **Lens 11:**
    - S·Q = revenue, (S − C)·Q = GVA, and the bands sum to the margin;
    - a gadget has S £700, C £280 and bands of £140, £35 and £245;
    - under E1, C is £455 and the profit band £70;
    - the isoGVA curves reproduce the paper's Firms A and B.
- **The lens-based expectations now pass,** at t = 5 and at t = 40:
  - **E2:** head-office booking adds £2.59bn to city GVA against £2.41bn before the squeeze. The town and the rural area lose correspondingly more.
  - **E5:** city residents' housing wealth rises 21.8%, from £74.4bn to £90.6bn.
  - **E7:** the local share of public-service purchases rises from 0.667 to 0.889 in the city, and from 0.556 to 0.778 in the town and the rural area.
  - **E8:** real GVA per public-service job rises exactly 11.1% under the indicator convention and 0.95% under the input convention, in both real views.
  - **E8b (derived, not in the spec):** with quality also down 10%, the indicator convention gives −2.44%. The input convention still gives +0.95%, because it can't see quality.
- **Findings:**
  - **Wage-bill booking (S1) matches true booking** in the base year and in every experiment, E1–E8. Each multi-place firm's producers share one cost structure, so profit is already in proportion to wages. The variant only differs when places' profit-to-wage ratios diverge, which a test confirms with city retail wages raised 10%. None of the spec's experiments does that.
  - **Head-office booking moves £2.41bn of base-year GVA to the city.**

| Place | GVA per job, true booking | GVA per job, head-office booking |
|---|---|---|
| City | £81,598 | £89,536 |
| Town | £53,767 | £49,191 |
| Rural area | £52,762 | £47,731 |

  - **Other base-year lens values:**
    - Gadget value capture: city 67.7%, town 11.3%, rural area 0%, rest of the world 21.0%.
    - Local retention: city 0.546, town 0.667, rural area 0.672.

| Place | GVA per resident | GDHI per resident | Wealth per resident |
|---|---|---|---|
| City | £48,153 | £22,929 | £258,079 |
| Town | £22,995 | £14,229 | £95,055 |
| Rural area | £18,006 | £13,698 | £109,730 |

  - **E5 under sector deflators:** real housing output falls in the town and the rural area, where nothing changed. The national housing deflator rises with city rents. This is the measurement wedge the notes describe.
- **Output:** each experiment's CSV now includes the lens results, about 29,000 rows per run.
- **Next:** stage 8 starts with a design pass with the user (§17).

## 4 October 2026: stage 8, the plan for the views

- **The user asked for a plan** to build each candidate view in a logical sequence. It is in `docs/views-plan.md`.
- **The sequence:**
  - 8.0 foundations;
  - 8.1 time series;
  - 8.2 the map of places;
  - 8.3 the streetlight toggle;
  - 8.4 value capture;
  - 8.5 the rectangle and isoGVA view;
  - 8.6 an optional scenario editor;
  - 8.7 finishing.
- **Awaiting the user's decisions:**
  - the framework (Svelte 5 recommended);
  - the audience (a research explorer first, recommended);
  - when to build the scenario editor (after the five views, recommended);
  - the proposed split between the official view and the true flows.
- **How the user will see the views.** The container forwards no port to the host, so a dev server here can't be opened in the user's browser. Instead:
  - screenshots in `out/screenshots/`;
  - a single-file build, `web/dist/index.html`, to open on the host.
- **Versions checked.** Vite 8.3, `@sveltejs/vite-plugin-svelte` 7.3, Svelte 5.57 and `@playwright/test` 1.63.0 all support Node 20.19 or later. Vitest 4.1.11 accepts Vite 8.
- **Later the same day:**
  - The container now publishes ports 8000 and 8001. A test page served on `0.0.0.0:8000` opened in the user's browser at http://localhost:8000, so the views will be shown live there. The plan's section 2 is updated.
  - The user accepted all four recommendations: Svelte 5, a research explorer first, the scenario editor after the five views, and the proposed official/true split.

## 4 October 2026: stage 8, the views (steps 8.0–8.5)

- **Built in one go, at the user's request,** for a single review. Steps 8.6 (scenario editor) and 8.7 (finishing) follow that review.
- **Stack:** Svelte 5.57, Vite 8.3, d3-scale and d3-shape, `@playwright/test` 1.63.0. TypeScript moved from 7.0.2 to **6.0.3**, because `svelte-check` doesn't yet support TypeScript 7. All earlier tests still pass.
- **How to run it:** `npm run dev` serves on `0.0.0.0:8000`, which the user opens at http://localhost:8000. The browser tests use port 8001. `npm run build:web` makes `web/dist/` (gitignored).
- **New engine code:** `placeFlows`, money and people flowing between places by type, for the map. A test checks that every flow type reconciles with the accounts.
- **Data layer:** `web/src/data/` holds plain functions that shape model results for the views, tested against the engine by Vitest (8 tests).
- **The views:**
  - **Places:** a schematic map of the places; one lens at a time, with change on the baseline. In true-flows mode each card also shows the official figure when it differs. Flows of one type at a time are drawn as arrows scaled by value; labels for the six largest dodge one another.
  - **Over time:** small multiples, scenario in ink against a grey baseline, in levels or as the difference from baseline. Economy-wide measures above, the selected place's below.
  - **Value capture:** stacked bars by place, baseline above scenario, per £1 or per physical unit. Hovering lists the producers inside a segment. Whole-chain productivity is shown alongside.
  - **Producer:** the rectangle with its bands, and isoGVA in margin form and in the paper's S/C form, with the baseline drawn behind.
  - **Streetlight toggle:** a global official/true switch. The official view fixes the switches at wage-bill booking, sector deflators and indicator-measured public services. It hides flows, value capture, residual income, wealth and retention, and in the producer view shows only what surveys observe (turnover, purchases, GVA, S/C).
- **Shared:** controls in one row, state kept in the URL, a table view for every chart, light and dark themes. The palette was validated with the dataviz script: place colours are categorical slots 1–4 and the rectangle bands slots 5–7, all checks passing in both modes. Light-mode contrast warnings are met by direct labels and table views.
- **Departures from the views plan:**
  - The sector-mix lens isn't on the map cards: five groups would need a fifth colour on a small mark. It is left for 8.7, as a table or a small multiple.
  - Real GVA views book each producer's GVA where it is produced, so they ignore the booking switch. Wage-bill and true booking coincide in every experiment, so the official figures are unaffected.
- **Tests:** 19 Playwright tests open each view in its key states (both modes, dark theme), check values, fail on console errors and save screenshots to `out/screenshots/`. I reviewed every screenshot and fixed what the review found:
  - overlapping flow labels;
  - the theme menu breaking the one-row controls;
  - long product names colliding with bar labels;
  - "0.0p" for zero amounts;
  - a mislabelled C line in the rectangle;
  - isoGVA curves clamped flat at the top of their panels.
- **Something new the views show:** in the official view of E5 (city rents up 30%), real GVA per job falls in the town (−1.5%) and the rural area (−2.2%), where nothing changed. The national housing deflator rises with city rents.

## 4 October 2026: stage 8, scenario editor (8.6) and finishing pass (8.7)

- **The user reviewed 8.0–8.5** ("looking good as is for now") and asked to continue with 8.6 and 8.7.
- **Scenario editor (8.6),** a new "Scenario editor" tab.
  - **The catalogue:** every §14 switch (S4–S15), generated from the spec parameters with its base value. A test checks that every entry's path exists and compiles.
  - **Building a scenario:** add changes (set, multiply or add, from any period 1–40). Ownership shares and the commuting matrix have their own inputs. Experiments' changes can be copied in as a starting point.
  - **Applying it:** "Apply and run" runs the scenario first. It becomes the "Custom" scenario in every view only if it runs; otherwise a message explains why and nothing changes. A summary compares GDP, GNI, unemployment and the government balance with the baseline at t = 40.
  - **Sharing:** the scenario is kept in the URL, so a link reproduces it. It can also be exported and imported as JSON, in the engine's own change format.
  - **Tests:** re-entering E5's change as a custom scenario reproduces E5 exactly; a scenario with broken ownership shares is refused.
- **Finishing (8.7):**
  - **About page:** the model, the views, the official/true split, how to read the numbers, what v1 leaves out.
  - **Sector mix (lens 7),** deferred from 8.2, as small multiples under the map. There is one panel per sector group, with bars coloured by place, so colour keeps meaning place.
  - **Single-file build:** `npm run build:web` now writes one self-contained `web/dist/index.html` (197 kB, model included). A browser test opens it from disk with no server.
    - It uses a 30-line inlining script, `scripts/inline-build.ts`, not `vite-plugin-singlefile`. That plugin's file-matching dependency (`braces`) is flagged by npm audit for a denial-of-service issue, and the project now has no audit findings.
  - **README:** how to run, test and build everything.
  - **Already in place from 8.0–8.5:** dark mode, a table view for every chart, captions for each lens.
- **Not done, and left for later:**
  - an opt-in texture fill for colour-blind or print use (the dataviz method's accessibility channel);
  - keyboard access to the line-chart crosshair, whose values are reachable through the table view.
- **Tests:**
  - 100 unit tests;
  - 23 browser tests, covering the editor end to end, the About page, the sector mix and the single file from disk;
  - all type checks;
  - every experiment expectation still holds.

  I reviewed the screenshots and fixed what they showed:
  - the share-link button not enabling after a scenario was applied;
  - "1 changes";
  - right-aligned table headings on the About page.

## 12 October 2026: publishing on GitHub Pages

- **The user renamed `docs/` to `plan_docs/`,** so that `docs/` can be the GitHub Pages site, with room for several live models side by side.
- **The source stays in `web/`; the build moves into `docs/`.** Pages serves files as they are and can't build Svelte or TypeScript, so moving the source into `docs/` would have published unbuilt code.
  - `npm run build:web` now writes the self-contained single file to `docs/gva-flows-v1/index.html`. `emptyOutDir` clears only that folder.
  - The folder name is set once, in `web/pages.ts`, and read by the Vite config, the inlining script and the browser tests.
- **The site, `docs/`:**
  - `index.html`, a landing page listing the live models (one so far), in the same light and dark palette;
  - `.nojekyll`, so Pages serves the files as they are;
  - `gva-flows-v1/index.html`, the model.
- **Updated to match:**
  - **`.gitignore`:** the `web/dist/` entry is gone, and a comment says why `docs/` is committed. The old `web/dist/` build was deleted.
  - **`package.json`:** a new `preview:pages` script serves `docs/` on port 8001, as Pages would.
  - **Browser tests:** they open the built model, and the landing page's link to it, from `docs/`.
  - **README:** a GitHub Pages section.
  - **Plans:** folder references now say `plan_docs/`, and the build plan's layout lists `docs/`, `plan_docs/` and `e2e/`.
- **CLAUDE.md:** its "The model" section had disappeared, apparently overwritten when the container setup changed. It is restored, with the new paths and a note on the Pages site.

## 12 October 2026: publishing via a GitHub Actions workflow

- **The user's repository holds the whole project,** research and build, so this folder is `build/` and the site is at `build/docs/`. Pages' *Deploy from a branch* setting can serve only the repository root or a top-level `/docs`, so it can't serve the site.
- **Of the options considered, the user chose a GitHub Actions workflow.** The others were a `gh-pages` branch, publishing the whole repository from its root, and a separate site repository.
- **The workflow** is `for-repo-root/.github/workflows/publish-models.yml`. The user moves it to the repository root; the container can't see that far.
  - It runs on pushes that change `build/docs/**` or the workflow itself, and can be run by hand.
  - It checks that the landing page and every model's `index.html` exist, then publishes `build/docs` as committed, using `actions/configure-pages@v5`, `upload-pages-artifact@v3` and `deploy-pages@v4`. These versions are from my training, so the user should check them against GitHub's Pages docs.
  - **Checks:** it passes `@action-validator/cli` 0.6.0's schema check, except the path globs, which that version doesn't validate. Its site-check step was run against a mock of the repository: it passes as committed, and fails with a clear message when a model's file or the landing page is missing.
- **Notes on why:**
  - **README:** the publishing section explains it.
  - **For the repository's main README:** a section waits in `for-repo-root/README-section.md`.
  - **`for-repo-root/README.md`:** says what goes where.
  - **CLAUDE.md, `web/pages.ts`, the inlining script, the landing page's comment and the views plan:** now say how the site is published.
- **`docs/.nojekyll`** is kept. A workflow deployment doesn't run Jekyll, so it is no longer needed, but it does no harm and keeps a branch deployment possible.
