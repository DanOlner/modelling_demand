# Plan for stage 8: the browser views

*Written for the design pass, 4 October 2026. Steps 8.0–8.7 were built that day; see the build worklog.*

- **The brief:** spec §17.8 lists five candidate views:
  - a map of the four places with switchable lenses;
  - the value-capture chart per product;
  - the rectangle and isoGVA view for any producer;
  - time series for scenarios;
  - a toggle between the "streetlight" (official) view and the true flows.
- **The engine is ready for them.** It runs in the browser unchanged, so the views run the model live: picking a scenario or flipping a switch recomputes everything in well under a second.
- **Chart design follows the `dataviz` skill's method:**
  1. choose the form by the data's job;
  2. assign colour by role;
  3. validate the palette with its script;
  4. use thin marks, hover readouts and a table view for every chart;
  5. screenshot and look before calling anything done.

## 1. Decisions

The user accepted all four recommendations on 4 October 2026:

1. **Front-end framework: Svelte 5.** A component is ordinary HTML, TypeScript and CSS in one file. It draws SVG directly, with D3 used only for scales and shapes.
2. **Audience: a research explorer for the user and colleagues first.** Every switch is exposed, and each lens gets a short caption. A guided "story" for a general audience can come later, built from the same views.
3. **Scenario editor: after the five views (step 8.6).** The first round uses the baseline and the experiments E1–E8.
4. **The official/true split** for the streetlight toggle is as proposed in step 8.3.

## 2. How the user will see the views

- **A live server.** The container publishes ports 8000 and 8001 (listed in `$PUBLISH_PORTS`). The app's dev server listens on `0.0.0.0:8000`, and the user opens **http://localhost:8000** in their own browser. Changes appear as they are made. Port 8001 is spare, for example for `vite preview` of a production build.
  - Tested on 4 October 2026: a page served on `0.0.0.0:8000` opened in the user's browser.
  - The server must listen on `0.0.0.0`, not `localhost`, or the host can't reach it.
- **Screenshots** from the Playwright tests still go to `out/screenshots/`, as a record of each check-in and for my own visual review.
- **A single-file build.** `npm run build:web` still makes one self-contained `web/dist/index.html`, for sharing the views with people who don't run the container.

## 3. The sequence and why

| Step | What | Why at this point |
|---|---|---|
| 8.0 | Foundations: app shell, shared state, model runner, design tokens, test harness | Every view depends on them. |
| 8.1 | Time series for scenarios | The simplest standard chart. It builds the scenario picker and period cursor that every later view uses. |
| 8.2 | Map of the four places, with switchable lenses and flows | The home view. It fixes each place's colour and position, and selecting a place here scopes the other views. |
| 8.3 | Streetlight toggle: official view or true flows | A global mode. Defined once the time series and map exist, so the remaining views are built aware of it rather than retrofitted. |
| 8.4 | Value capture per product, with whole-chain productivity | Uses the place colours from 8.2. Mostly hidden in the official view, so it needs 8.3's rules. |
| 8.5 | Rectangle and isoGVA view for any producer | The most bespoke graphic. It is reached from the map and the value-capture chains, and benefits from settled conventions. |
| 8.6 | Scenario editor (optional) | Builds on the views to make any §14 change explorable. |
| 8.7 | Finish: dark mode, table views, captions, accessibility, the single-file build | A pass over everything once the views exist. |

**Check-in:** one, after 8.5. At the user's request (4 October 2026), steps 8.0–8.5 are built in one go and reviewed together, live at http://localhost:8000. Screenshots are kept as a record. Steps 8.6 and 8.7 follow that review.

The rectangle view (8.5) depends only on 8.0. It can move earlier if the firm-demand work needs it sooner.

## 4. Foundations (8.0)

- **App layout.** A Vite app in `web/`, importing the engine from `src/` directly, so the views and the tests use the same model code.
- **Shared state**, kept in the URL so any view can be bookmarked or shared (for example "E5, t = 40, head-office booking, official view"):
  - the scenario;
  - the period t;
  - S1 booking, S2 public-service convention and S3 measurement view;
  - the streetlight mode;
  - the selected place;
  - the selected product.
- **Model runner.**
  - It runs the baseline once, and the chosen scenario whenever it changes, taking about 50 ms per 40-period run.
  - It computes lenses on demand for the periods a view needs.
  - It caches runs by scenario.
- **Controls in one row above the views,** scoping every view below them, as the `dataviz` skill's interaction rules require:
  - scenario;
  - period slider;
  - official/true toggle;
  - a "Measurement" menu holding S1–S3.
- **Design tokens**, from the skill's validated palette:
  - **Place colours,** fixed everywhere: city slot 1 (blue), town slot 2 (orange), rural area slot 3 (aqua), rest of the world slot 4 (yellow).
    - Four series means direct labels are mandatory.
    - The places are always stacked in that order, so yellow never sits next to orange.
  - **Validation:** the palette is checked with the skill's script, in light and dark mode.
  - **Scenario against baseline:** an emphasis form. The scenario is drawn in the accent colour and the baseline in grey.
- **Shared chart parts:**
  - a frame with title, subtitle, legend and source note;
  - a "show as table" switch;
  - the tooltip;
  - number formats (£bn, £k, %, index).
- **Data shaping in plain functions** (`web/src/data/`), outside the components, so Vitest can check every number a view shows against the engine.
- **Tests:**
  - Playwright, with `@playwright/test` pinned to 1.63.0, renders each view in key states against `vite preview`;
  - screenshots are saved to `out/screenshots/`;
  - the tests fail on console errors.
- **Done when:**
  - the shell loads;
  - changing the scenario re-runs the model;
  - a debug table of headline numbers matches `out/experiments`.

## 5. The views

### 8.1 Time series for scenarios

- **Form:** small multiples, one chart per measure, each with its own axis (never two scales on one chart).
  - Default set: GDP, GNI, unemployment rate, government balance.
  - The scenario line is in the accent colour and the baseline in grey.
  - A marker shows the period of the change (t = 5).
- **Switches:**
  - **Levels or difference from baseline:** differences are indexed or in £, so experiments compare at a glance.
  - **Place-level series:** disposable income, residual income and GVA per job, for the place selected on the map.
- **Hover:** a crosshair snaps to t and lists every series. Clicking sets the shared period.

```
 GDP (£bn)              Unemployment rate          Government balance (£bn)
 52 ┤━━━━━┓             9% ┤     ┏━━━━━━━━━         0 ┤━━━━━┓
    │     ┗━━━━━━ E3       │     ┃                    │     ┗━━━━━━━━━ E3
 50 ┤─ ─ ─ ─ ─ baseline 5% ┤━━━━━┛─ ─ ─ baseline -1 ┤
    └┬────┬───────────┬    └┬────┬──────────┬        └┬────┬──────────┬
     0    5          40     0    5         40         0    5         40
```

- **Done when:** the plotted values equal the engine's, a test checks a sample of points, and the screenshots for E3 and E6 have been reviewed.

### 8.2 Map of the four places

- **Form:** schematic, not geographic, since the places are stylised.
  - The city is in the middle, the town and the rural area on either side, and the rest of the world along the top edge.
  - Each place is a card showing the chosen lens's value, with its change against the baseline.
  - Magnitude is shown with a single sequential hue, never with the place colours. The place colour appears only as an identity mark on the card.
- **Lens picker,** one lens at a time:
  - GVA per job, under the chosen S1 booking;
  - GVA per resident;
  - GDHI per resident;
  - residual income per resident;
  - wealth per resident;
  - local retention;
  - unemployment;
  - sector mix (lens 7), as a small stacked bar in each card.
- **Flows,** one type at a time, as arrows between places, scaled by value:
  - commuters;
  - wages;
  - dividends, including those to overseas owners;
  - trade between places, exports and imports;
  - royalties to the offshore IP holder;
  - taxes and benefits, with the government as a small node of its own.
- **Selection:** clicking a place selects it for the other views.
- **New engine work:** `placeFlows(record)` gives money flows between places by type. Each flow type's total must equal its total in the accounts, which a test will check.

```
                    ┌────────────────────┐
                    │ Rest of the world  │
                    └─────────▲──────────┘
                              │ dividends £5.2bn
  ┌──────────────┐     ┌──────┴───────┐     ┌──────────────┐
  │ Town         │◄────┤ City         ├────►│ Rural area   │
  │ £53.8k / job │     │ £81.6k / job │     │ £52.8k / job │
  └──────────────┘     └──────────────┘     └──────────────┘
   Lens [GVA per job ▾]   Flows [Dividends ▾]   Booking [True ▾]
```

- **Done when:** card values equal the lens values, flow totals reconcile, and the screenshots for E1, E4 and E5 have been reviewed.

### 8.3 The streetlight toggle

- **What it is:** a global switch. Each view either shows only what official statistics would show, or reveals the true flows.
- **What each mode shows:** the proposal below follows `data-streetlight-effect.md`, which lists what UK data measure well and what they miss.

| | Official view: what the lamp shows | True flows: what is there |
|---|---|---|
| Where GVA is booked | Workplace GVA, with ONS-style wage-bill allocation (stylised: ONS documents it only for finance and insurance) | All three bookings, including true and head-office |
| Real output | Sector deflators; public services by output indicators, as in UK statistics since the Atkinson Review | Own base prices, close to physical output; both public-service conventions |
| Incomes | GDHI per resident, by residence | Residual income after essentials; wealth |
| Between places | Not shown | Commuting, wages, dividends, trade, royalties |
| Products | Not shown | Value capture and whole-chain productivity |
| Economy | GDP, GNI, unemployment, government balance, current account | Money stocks, and who holds them |

- **The gaps are the findings.** In true-flows mode, each place card also shows the gap between the official figure and the true one. For example, city GVA per job is £81.6k under true booking. It is the same under wage-bill allocation in the base year, and £89.5k under head-office booking.
- **Done when:**
  - both modes work on the time series and the map;
  - official mode hides everything in the right-hand column;
  - screenshots of both modes have been reviewed.

### 8.4 Value capture per product

- **Form:** horizontal stacked bars (part-to-whole), one bar per final product, segments by place in the fixed order city, town, rural area, rest of the world.
  - Each segment is direct-labelled.
  - Hovering on the rest of the world splits it into imported goods, contract assembly and the IP holder.
- **Products:**
  - the gadget;
  - a basket in each place;
  - an hour of public services in each place;
  - any other producer, from a picker.
- **Units:** per £1 of final price, or per physical unit. For the gadget, "who gets the £700" reproduces the iPhone chart in `where-gva-is-recorded.md`.
- **Comparison:** baseline and scenario bars sit one above the other. Under E1 the IP holder's 25% slice appears.
- **Lens 3 alongside:**
  - value per worker along the whole chain against on-site GVA per job (£132k against £300k for the gadget);
  - the chain's jobs by place, foreign jobs included.

```
 Who gets each £1 of …          City         Town   RoW
 Gadget, baseline      [████████████████████|████|███████]  68p · 11p · 21p
 Gadget, E1 Cupertino  [██████████████|████|█████████████]  … IP holder 25p
 Whole chain £132k per worker   ·   on site £300k per job
```

- **Done when:** segments sum to the price (shown in the table view), and the screenshots for E1 and E2 have been reviewed.

### 8.5 The rectangle and isoGVA view

- **Form:** three panels for the selected producer, in physical units.
  1. **The rectangle.**
     - Width Q and height S.
     - Bought-in cost C is the grey floor.
     - The margin above it is split into wages, depreciation and net profit.
     - S, C, Q, jobs and GVA per job are labelled on it.
  2. **isoGVA, margin form (the main panel).** The curve margin = GVA/Q runs through the producer's point and through its base-year point.
  3. **isoGVA, the paper's S/C form.** Labelled with the C it holds fixed, since the curve depends on C.
- **Scenario comparison:** the base-year rectangle is drawn as an outline behind the scenario's, with the move in (Q, margin) shown as an arrow.
- **Caption:** in v1 demand moves only Q, because prices don't respond to quantities.
- **Reference curve:** Firms A and B from the paper, on request.

```
 £ per gadget                 margin S − C (£)            S/C (C held at £280)
 700 ┤━━━━━━━━━━━━━━┓ S       420 ┤╲                      2.5 ┤╲
     │ net profit    ┃            │ ╲ isoGVA                  │ ╲
     │ depreciation  ┃            │  ● C.HQ                   │  ●
     │ wages         ┃            │   ╲____                   │   ╲____
 280 ┤━━━━━━━━━━━━━━┫ C           └──────────── Q              └──────────── Q
     │ bought in     ┃
   0 └──────────────┸── Q = 12.3m gadgets
```

- **Done when:** the table view confirms S·Q = revenue and (S − C)·Q = GVA, and the screenshots for C.HQ under E1, R.AGR under E2 and C.PRV under E8 have been reviewed.

### 8.6 Scenario editor (optional)

- **What it does:** change any §14 switch from the baseline or an experiment, as a list of changes with their periods.
- **Behaviour:** the model runs live as changes are made.
- **Saving and sharing:** scenarios are saved as JSON or shared by URL. The format is the engine's own, `{period, path, set | scale | add}`.

### 8.7 Finish

- **Dark mode,** with the palette validated against the dark surface.
- **A table view for every chart.**
- **Text:** captions for each lens and an "about the model" panel.
- **Accessibility:** a keyboard and contrast pass.
- **Deliverable:** the single-file build.
- **Done when:** the whole screenshot set has been reviewed in both modes.

## 6. Tests at every step

- **Vitest:** every data-shaping function the views use is checked against the engine's numbers.
- **Playwright:**
  - each view renders in its key states with no console errors;
  - the expected values appear;
  - screenshots go to `out/screenshots/`.
- **Visual review:** every screenshot is looked at, for label collisions, overflow and geometry, before a step is called done. The palette validator checks colour; it doesn't check layout.
