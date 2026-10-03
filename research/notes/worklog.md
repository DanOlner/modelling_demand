# Worklog

## 2026-10-03: Webber & Huaccha (2024) and outside sources

### What was done

- The paper's PDF in `sources/` was given a text copy with the project's `pdf-text` script, which the user ran.
- The whole paper was read (30 PDF pages), including Figures 1–5 from the PDF itself.
- Six strands of outside literature were researched, and seven notes were written.

### Agreed ways of working

- Published figures are for orientation: plausible ranges, which effects are big or small, and where the evidence disagrees. They are not calibration targets, and the model is not meant to forecast.
- The model will be built in JavaScript for the browser. This round covered the economics only; surveying existing browser demos was left for later.
- Notes contain prose, tables and equations, but no code (per CLAUDE.md).

### Files created

Start with `webber-huaccha-2024-rethinking-productivity.md`. It covers:

- what the paper argues about demand;
- how it frames that in numbers;
- a model-building inventory: variables with ballpark values, each of the paper's claims paired with a possible formal version, its scenarios, and what a browser model could show.

It links to six topic notes:

- **`firm-pricing-and-firm-demand.md`:** Kalecki's pricing, the Bank of England's survey of how UK firms set prices, and ways to model each firm's demand.
- **`revenue-vs-physical-productivity.md`:** mainstream evidence that measured productivity contains prices and demand, plus markup trends.
- **`demand-led-productivity-dynamics.md`:** labour hoarding, Kaldor–Verdoorn, wage-led demand, lasting damage from recessions, and UK productivity-gap figures.
- **`supply-chains-buyer-power-and-gva.md`:** supermarket and dairy margin evidence, a 2025 follow-up chapter by Webber & Tiwasing, and rural–urban figures.
- **`measuring-gva-and-productivity.md`:** official GVA definitions, inflation adjustment, and how shrinkflation is treated.
- **`agent-based-firm-demand-models.md`:** existing simulation models whose firm rules could be reused.

### What stood out

- **The paper is conceptual.** Its only formal content is GVA = (S − C) × Q (divided by workers for productivity), drawn as a rectangle, plus worked examples. Every behavioural rule a model needs has to come from elsewhere.
- **The isoGVA chart has a problem.** Firms A and B have equal GVA only when the vertical axis is the margin S − C; on the paper's S/C axis they sit on different curves. The follow-up chapter's text actually describes the curve in margin terms.
- **The paper counts utilities as part of GVA.** UK business statistics subtract all purchased goods and services, utilities included. Correcting this changes the yoghurt chain's GVA from 560 to 450.
- **The pricing rule decides the sign of the market-power story.** If a firm prices as a fixed markup on its costs, squeezing its suppliers lowers its own GVA. The paper's supermarket example only works because the supermarket passes on half of what it saves.
- **Not all the effects survive inflation adjustment.** Demand working through quantity shows up fully in official real productivity. Price redistribution and shrinkflation largely disappear from national figures but stay in firm and regional ones.
- **Strong outside support for the demand argument.** Foster, Haltiwanger & Syverson find demand varies about five times as much across plants as physical efficiency. New plants sell 41% of what established ones sell at the same price, despite being slightly more efficient.
- **The paper's UK figures are dated.** Its numbers (UK output per hour 18% below trend, France 14%, US 9%, Germany 8%) are ONS first estimates. ONS later revised the UK gap to 15.2%.
- **The follow-up chapter seems to reverse the paper's policy advice.** The paper says firms on the same isoGVA curve should "play to their strengths". The chapter appears to recommend the opposite pairing; flagged for the next stage.

### Where the sources are weak

- Kalecki's pricing equation comes from secondary summaries, not his own text.
- The dairy margin figures come from trade-press reports from 2008–11.
- The wage-to-productivity effect (about 0.4) is low confidence.
- The standard formula for estimating markups was given from memory and is flagged in the note.
- Evidence on whether margins rise or fall over the business cycle conflicts, so it is marked as a choice the model should leave switchable.

### Next

- Interrogate how to model these ideas and what the paper might be missing.
- Starting points: the "Points to check" list and the model-building inventory in `webber-huaccha-2024-rethinking-productivity.md`.

### Sources

Sources for everything in this entry are listed at the end of each note above.

## 2026-10-03 (later): the larger project, and interrogating the 2D model

### The larger project, as set out by the user

The firm-demand work is part of a larger project on how we understand:

- how GVA and productivity emerge from flows of labour, goods, capital and other inputs and outputs;
- how those flows vary geographically. For example, Apple's Cupertino campus has very high GVA on site, while its distant suppliers have very low GVA;
- how current data lenses suffer from the streetlight effect. That makes these dynamics hard to see, and with them the relationship between productivity and people's actual wealth;
- how all sectors connect, including the foundational economy.

### Files created

The main output is **`interrogating-the-2d-model.md`**. It covers:

- what to keep from the 2D model;
- eleven things it misses;
- three ways to model the ideas, with a recommendation;
- a sketch of the recommended model;
- decisions for the user;
- research still needed.

It draws on five new topic notes:

- **`flows-and-value-added.md`:** input–output accounting; productivity across a whole supply chain (vertical integration, Pasinetti); trade in value added; social accounting matrices; UK data on flows between regions.
- **`where-gva-is-recorded.md`:** value capture in the iPhone chain; how IP ownership and contract manufacturing decide where output is booked (Ireland); profit shifting; how ONS assigns GVA to regions; workplace vs residence.
- **`data-streetlight-effect.md`:** what UK data see well and what they miss.
- **`productivity-incomes-and-wealth.md`:** the chain from GVA to wages, disposable income, residual income and wealth, with UK evidence.
- **`foundational-economy-and-sector-linkages.md`:** the foundational economy, Baumol's cost disease, economic base theory, local multipliers and the Preston model.

### What stood out

- **Value capture is extreme.** In 2010, Apple's profits were 58.5% of the iPhone's sales price and Chinese labour 1.8%. The study's authors say inadequate trade data left them with "educated guesses".
- **Output can be booked far from where it's made.** Under ownership-based accounting, a company that owns the IP records the output of goods made abroad for it under contract. That is how Irish GDP can include goods made in China.
- **Regional profits follow wage bills.** In finance and insurance, ONS allocates both wages and profits of multi-region firms to regions using employees × earnings (2018 article; whether this applies in other industries is unchecked).
- **Trade between UK regions is only just measured.** ONS's first estimates, published in 2025, cover only 2019 and 2020: £1.35 trillion of trade in 2020.
- **Profits flow abroad.** 58.8% of UK quoted shares were owned overseas at the end of 2024.
- **Big parts of the picture are poorly measured.** Unpaid household work was worth £1.7 trillion (61% of GDP) in 2023, outside GVA. Wealth data, the last link to "people's actual wealth", are the weakest: the Wealth and Assets Survey's accreditation is suspended.
- **Pay and productivity.** Mean pay kept pace with UK productivity from 1981 to 2019, but median pay fell about 25 points behind.
- **The foundational economy is large and measured as low-productivity.** It covers about 40% of jobs and 30% of household spending, and it looks low-productivity by construction.

### Recommendation awaiting the user's decision

- Build a stylised, stock-flow consistent flow-network model first. It would have a few places (including a rest-of-world node), a set of sectors including foundational ones, households, owners and government.
- It would generate "official-style" statistics alongside the true flows, so the streetlight effect can be toggled on screen.
- The firm-demand work becomes the view of a single node and its first behavioural module.
- Seven decisions are listed in `interrogating-the-2d-model.md`, section 5.

### Next

- The user to decide on the section 5 questions.
- Then specify the first version of the flow-network model in prose and equations.
- Research gaps are listed in `interrogating-the-2d-model.md`, section 6.

### Sources

Sources are listed at the end of each note above.

## 2026-10-03 (end of day): decisions on the first model

The user's answers to the questions in `interrogating-the-2d-model.md`, section 5, which now records them:

1. **Stylised**, built so it can later be calibrated to, and compared with, actual data.
2. **Four places:** a core city, a manufacturing town, a rural area and a rest-of-the-world.
3. **Runs over time,** so factors can be held fixed and change observed. A single-period version may come first to test the accounting.
4. **Fixed coefficients and markup pricing** for now; agent rules later.
5. **Both measurement conventions** for public and foundational output, as a switch.
6. **No unpaid work or physical flows** in version 1, but leave room to add them.
7. **Provisionally,** the firm-demand work is the view of a single node and the first behavioural module, not the whole model.

### Where things stand

The research stage is complete. The build moves to the container next, once next steps are confirmed with the user.

## 2026-10-03 (end of day): model specification written

The user chose to have the specification written here before moving to the container.

### File created

**`model-spec-v1.md`**, the build brief for version 1, in prose, tables and equations (no code). It covers:

- scope, and units and notation;
- places and people;
- 17 domestic producers across city, town and rural area, plus rest-of-world suppliers and an offshore IP holder;
- firms and their ownership, including overseas owners;
- cost structures, giving default technology and wages;
- pricing rules (markup, cost-based, fixed);
- demand: households with essentials and discretionary spending, government, replacement investment, exports;
- incomes, taxes and benefits;
- commuting;
- money and wealth stocks over time;
- the order of calculation within a period;
- base-year calibration;
- 11 lenses, including the official-versus-true streetlight views and the single-producer 2D view;
- 15 scenario switches;
- 8 experiments, including Cupertino, the supermarket squeeze, austerity, an overseas takeover, rents and exports;
- 9 acceptance tests, with exact expected values where they can be derived;
- the build order, and room for later.

### Design choices made in writing it (for the user to check)

- **Volume units.** Internal units are "£1 of output at base-year prices", so all prices start at 1. Each producer also has a display price (for example £700 per gadget, £0.35 per litre of milk) so the single-producer view shows physical units.
- **Two new sectors** in the agreed four-place structure:
  - business and financial services in the city, sold to firms everywhere and exported;
  - "everyday goods and services" (retail, hospitality, personal services) in each place.
  - Both are needed for a plausible jobs structure.
- **Base-year calibration** solves three things together:
  - total exports, so the current account is zero;
  - the income tax rate, for 5% unemployment;
  - the city's population share, so 15% of city jobs are filled by in-commuters.
  - This makes the base year a steady state.
- **One representative household per place.** Splitting by tenure is left for later.
- **Plausibility check.** Default numbers are stylised first guesses. The build must report base-year results against plausibility ranges, not tune them silently.

### Next

- The user reviews the spec. The design choices above and the default numbers are the main things to check.
- Then move to the container and build in the order of section 17.
