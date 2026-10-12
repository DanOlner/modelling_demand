# Build plan for model spec v1

*Draft for review, 3 October 2026.*

- **The brief:** `/notes/model-spec-v1.md` (read-only). Section numbers below (§) refer to it.
- **Build worklog:** `plan_docs/build-worklog.md`, for results and any departures from the spec.
- **Background notes:** indexed in `plan_docs/notes-manifest.md`.
- **Folders:** this folder was `docs/` until 12 October 2026. `docs/` is now the GitHub Pages site.

## 1. Decisions

- **TypeScript throughout.** Agreed with the user on 3 October 2026. The research worklog also says the model is to be "built in JavaScript for the browser".
- **Engine first, front end at stage 8.**
  - The engine is a plain TypeScript library with no file, DOM or Node-specific code.
  - The same code runs under Node for the tests and batch runs, and in the browser for the views.
- **Build order follows §17**, with a set-up stage added at the start. A stage is done when its tests pass and the worklog has an entry for it.
- **The spec's design choices are taken as accepted.** The research worklog put some of them to the user to check:
  - units of £1 of base-year output, with display prices;
  - the two added sectors;
  - the steady-state base year;
  - one household per place;
  - plausibility reporting.

  The user has asked for v1 to be built, so the plan follows them.
- **Check-ins with the user:**
  - end of stage 4 (base year and plausibility);
  - end of stage 6 (experiment results);
  - start of stage 8 (design pass).

## 2. Tooling

| Need | Choice |
|---|---|
| Runtime | Node 20.20, as installed in the container |
| Language | TypeScript 7 in strict mode |
| Tests | Vitest 4.1, the newest version that supports Node 20 |
| Batch scripts | `tsx` |
| Linear algebra | A small module of our own: matrix–vector products and an LU solve with partial pivoting. The matrices are about 20 × 20, so no library is needed. |
| Stage 8 only | Vite for the front end; `@playwright/test` pinned to 1.63.0 |

- **npm scripts:** `test`, `typecheck`, `calibrate`, `experiments`.
- **Versions:** pinned, with `package-lock.json` committed.

## 3. Layout

```
package.json, package-lock.json
tsconfig.json          type check for everything
tsconfig.engine.json   type check for src/ without Node or DOM types
src/
  engine/      the model: pure functions, with no file, DOM or Node access
  params/      spec-v1 defaults, the stored calibration, the T8 minimal economy
  scenarios/   experiments E1–E8
scripts/       Node-only runners: calibrate; run experiments and write results to out/
tests/         Vitest, roughly one file per stage
e2e/           Playwright browser tests of the views
plan_docs/     build-plan.md, views-plan.md, build-worklog.md, notes-manifest.md
out/           generated results (gitignored)
web/           stage 8: the views' source (Svelte)
docs/          the GitHub Pages site: one built, self-contained model per subfolder (committed)
```

Engine modules follow the spec's sections:

| Module | Covers |
|---|---|
| `prices` | §6 |
| `demand` | §7 |
| `incomes` | §8 |
| `commuting` | §9 |
| `period` | §11 |
| `calibrate` | §12 |
| `run` | §10, the time loop and stocks |
| `scenario` | §14 |
| `checks` | T1 identities, flags and plausibility |
| `lenses/` | §13 |
| `linalg` | shared linear algebra |

## 4. Engine design

- **The economy is data.** Places, producers, firms, ownership and coefficients all come from a parameter set.
  - The spec economy and the T8 minimal economy (one place, two producers, no rest of world) are two configurations of the same engine.
  - T8 and T9 need this, and it makes small test economies cheap to set up.
- **Pure functions.** A period solve takes the parameters and last period's state and returns the results and the next state. Parameters are never mutated.
- **IDs outside, indices inside.** Producers keep the spec's names (`C.HQ`, `M.RET`, …), and results are keyed by them. Internally, arrays use a fixed index order.
- **Tolerances as in §2:**
  - solves converge to a relative change below 10⁻¹²;
  - identities hold to 10⁻⁶ of GDP;
  - scenario tests hold to 10⁻⁹ relative.
- **Separate code names where spec symbols clash:**

| Spec symbol | Its meanings in the spec | Code names |
|---|---|---|
| $E_r$ | essential spending (§7); employed residents (§9) | `essentialSpend`, `employedResidents` |
| $S_r$ | household saving (§8); surplus residents (§9) | `saving`, `surplusResidents` |
| C | the city; consumption $C_r$; unit cost in the rectangle (§13.11) | place `C`, `consumption`, `unitCost` |
| R | the rural area; the royalty | place `R`, `royalty` |
| M | the town; money stocks; imports | place `M`, `money`, `imports` |
| W | the rest of the world; wage bills $W_j$ | place `W`, `wageBill` |

- **Checks run inside every period, not only in tests.** These are the T1 identities and the rule that money stocks sum to zero. A run that breaks one stops with an error.
- **Flags are recorded, not raised:** "essentials exceed planned consumption", "labour shortage", and out-of-range plausibility results.
- **Reporting switches don't change the solution.**
  - S1 (booking), S2 (public-service output convention) and S3 (measurement view) only change what is reported.
  - Every variant is computed every period, so the views can flip between them without re-running the model.
- **Scenario format.** A scenario is a list of `{period, parameter, value}` changes, as in §14. A change can set a value or scale it, since E3, E5, E6 and E8 are written as percentage changes.
- **Stored calibration.**
  - The solved X, θ and s_C are stored in a committed file, with a fingerprint of the base parameters.
  - If the base parameters change, loading fails with a message to rerun `npm run calibrate` (§12).
- **Room for §18.**
  - Households are a list per place, so household types can be added later.
  - Each producer's pricing rule is one of a set of tagged options, so behavioural rules can be added.
  - Household spending is allocated by a single function, so logit-type demand can replace the fixed shares.

## 5. Stages

### Stage 0. Set up
**Work:**
- Create `package.json`, `tsconfig.json` and the Vitest config.
- Add `out/` to `.gitignore`.
- Write `linalg`, with tests: the LU solve against known inverses, and a Leontief inverse L that satisfies L(I − A) = I.

### Stage 1. Parameters and scenario format (§3–§5, §14)
**Work:**
- One parameter set holding every default in the spec.
- The T8 minimal economy.
- The scenario format and the code that applies it.

**Done when:**
- every cost row sums to 1;
- jobs per unit, base markups and base GVA per job reproduce the spec's tables at their printed precision;
- the display units agree: £140 of components and £56 of assembly per £700 gadget, and each dwelling-year equals rent per resident × 2.3 persons per dwelling.

### Stage 2. Price solve (§6)
**Done when:**
- T9 passes;
- every base price is 1 to 10⁻¹²;
- the iterative solve the spec describes agrees with a direct linear solve.

### Stage 3. Quantities and incomes on the minimal economy (§7, §8, §10, §11)
**Work:** the fixed point of §11: final demand, then outputs, incomes and disposable income, with money stocks carried between periods.

**Done when:**
- T8 passes: the base year, the t = 1 values and the long-run limits;
- an extra check passes: the same economy started with zero money follows the Godley–Lavoie SIM path (`agent-based-firm-demand-models.md`). This needs an option to start from given money stocks.

### Stage 4. Full model, base year (§9, §12)
**Work:**
- The commuting rule.
- Calibration of X, θ and s_C. The spec suggests nested bisection and allows any robust method. I'll use Brent's method at each level: it keeps a bracket, so it is as safe as bisection, and it is much faster.
- Initial stocks set as in §12.

**Done when:**
- T2 and T1 pass;
- the plausibility table is reported.

**Stop point.** If any plausibility result is out of range, report to the user before going further. The spec forbids tuning anything except the three unknowns.

### Stage 5. Running over time (§10, §11)
**Work:**
- The time loop to t = 40.
- Scenario changes applied at their periods.
- Freeze-consumption mode (S15).

**Done when:**
- T3 passes: periods 1–40 reproduce period 0, to 10⁻⁹;
- money stocks sum to zero every period.

### Stage 6. Experiments E1–E8 (§15) and tests T4–T7
**Done when:**
- T4, T5 and T7 pass exactly, with consumption frozen;
- T6 and the other experiments' expected signs are checked and tabulated.

An expected sign that fails is a finding to report, not something to tune. Some expectations need a lens, so they are checked in stage 7:
- E2's head-office booking;
- E5's housing wealth;
- E7's local share of purchases;
- E8's real GVA per public-service job.

E3's residual income and access to services, and E5's residual income, need only totals by place, so they were checked in stage 6.

A batch script writes each experiment's results to `out/` as CSV and JSON.

### Stage 7. Lenses and the single-producer view (§13)
**Work:** all 11 lenses, in every switch variant.

**Done when:**
- **Lens 1:** national GVA, and wages and depreciation by place, are the same under all three booking variants.
- **Lens 2:** the value captured per final product sums to that product's price $p_k$.
- **Lens 9:** in the base year, all three measurement views equal nominal GVA, and E8's percentages come out under each public-service convention.
- **Lens 10:** the GNI identity holds.
- **Lens 11:** S × Q = revenue, (S − C) × Q = GVA, and the bands sum to S − C.
- The lens-based expectations deferred from stage 6 are checked.

### Stage 8. Browser views
The detailed plan, from the design pass, is in `plan_docs/views-plan.md`.

**Work:**
- **Design pass with the user first.** §17 lists the candidates:
  - a map of the four places with switchable lenses;
  - value capture per product;
  - the rectangle and isoGVA view;
  - scenario time series;
  - a "streetlight" toggle between the official view and the true flows.
- **Then build:**
  - a Vite app in `web/` that imports the engine and runs it live;
  - Playwright tests with screenshots;
  - the `dataviz` skill for chart design.

## 6. Expected test values, checked by hand on 3 October 2026

Tests compare with these exact values to 10⁻⁹. The spec prints some of them rounded.

| Test | Exact values |
|---|---|
| T9 | $p_F = 2$, $p_S = 1.625$ |
| T8, base year | S = 100, F = 50, wages 55, profits 45, taxes 20, YD = 80, $M^h_0 = 80$. Households spend everything on S, which is what these values imply. |
| T8, after G rises to 25 | $S_1 = 57/0.52 = 109.615385$, $F_1 = 54.807692$, $YD_1 = 87.692308$, $C_1 = 84.615385$, $M^h_1 = 83.076923$. Long run: S = 125, YD = 100, $M^h = 100$. |
| Extra: the T8 economy from zero money, G = 20 | $S_1 = 38.461538$, $S_2 = 47.928994$, $S_3 = 55.939918$ (the SIM path) |
| T5 / E2 prices | $p_{AGR} = 0.91$, $p_{FOD} = 0.8624$, $p_{RET} = 1.28 \times 0.777984 = 0.99581952$ |
| T5 / E2 GVA per unit | AGR 0.65 → 0.56 (−13.85%); FOD 0.40 → 0.2984 (−25.40%); RET 0.60 → 0.61783552 (+2.973%) |
| E1 | C.HQ GVA per job £300,000 → £175,000 |
| T4 | $\Delta V_C = \Delta GDP = -R$; $\Delta T^\pi = -0.25R$; domestic owners' dividends $+0.0875R$; $\Delta GNI = -0.1625R$; $\Delta RB = +0.1625R$; $\Delta GB = -0.25R + 0.0875\,\theta R$ |
| E8, real GVA per PRV job | indicator convention: 1/0.9 − 1 = +11.111%; input convention: (0.745/0.9)/0.82 − 1 = +0.9485% |

**Why E2 raises RET's markup.** If RET's markup stayed at 0.25, Kaleckian pricing would pass the cheaper input straight through. RET's price would fall to 0.97248 and its GVA per unit would fall 0.92%. The research notes flag this sign question; the spec's markup rise is what reproduces the paper's squeeze. The stage 8 views should explain this.

## 7. Points of interpretation

The user accepted all of these on 3 October 2026.

1. **Housing counted twice in the wealth lens (§10).**
   - Housing wealth capitalises rents.
   - Equity wealth capitalises every firm's after-tax profit, including the three Landlords firms.
   - Counting both counts housing twice.

   Decision: leave the Landlords firms out of equity wealth.

2. **Scope counts.** §1 says seven lenses and seven experiments, but §13 has 11 lenses and §15 has eight experiments. All of them get built.
3. **Sector deflators (lens 9).**
   - **Output:** a sector's output deflator is its output-weighted average price across places, using current quantities: Σp·x / Σx. Base prices are all 1, so this is a Paasche index.
   - **Inputs:** one national deflator covers all intermediate purchases, royalties included. ONS deflates inputs by industry at product level (`measuring-gva-and-productivity.md`). The spec's single national deflator is a simplification, kept as written.
4. **"Inputs at base prices" in the input-based public-service convention** count labour as jobs × base-year wage per job. This reproduces E8's +0.95%.
5. **W.IP in equity wealth.** W.IP's profit counts as part of GadgetCo's, since GadgetCo's owners receive its dividends.
6. **The wage-bill booking variant is labelled as stylised.** ONS documents that rule only for finance and insurance (`where-gva-is-recorded.md`).
7. **The S/C isoGVA panel states which C it holds fixed,** because the curve depends on C. The margin panel is the main one, as the spec says.
8. **In v1, demand doesn't reach the price S.** Prices don't depend on quantities (§6), so in the single-producer view, demand shocks such as E3 and E6 move only Q. That is by design, and the views should say so.

## 8. Risks

- **Plausibility.** The defaults are first guesses, and some base-year results may fall outside the §12 ranges. This is the stage 4 stop point.
- **Calibration brackets.** If a target can't be reached inside the spec's search ranges (s_C in 0.05–0.80, θ in 0–0.8), report it rather than silently widening the range.
- **Fixed-point convergence.** Each round of spending loses some to taxes, imports and payments to overseas owners, so the iteration should converge. It gets an iteration cap and a clear error if it doesn't.

## 9. After v1

The list in §18 stands. Under decision 7, the first behavioural module is firm demand, drawing on `firm-pricing-and-firm-demand.md` and `agent-based-firm-demand-models.md`. The manifest flags a sign error in the K+S formula as that note writes it.
