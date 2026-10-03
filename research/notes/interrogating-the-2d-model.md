# Interrogating the 2D GVA model: what it misses, and how to model it for the larger project

This note does three things:

- sets out what Webber & Huaccha's (2024) 2D model misses, judged against the larger project;
- lays out three ways to model the ideas, with a recommendation;
- lists the decisions that are yours to make.

It draws on all the other notes in this folder.

## The larger project

The user set out these aims on 3 October 2026. The project is about how we understand:

- how GVA and productivity emerge from flows of labour, goods, capital and other inputs and outputs;
- how those flows vary geographically. For example, Apple's Cupertino campus shows very high GVA on site, while its distant suppliers show very little;
- how current data lenses suffer from a streetlight effect, which makes these dynamics hard to see, and with them the relationship between productivity and people's actual wealth;
- how all sectors connect, including the foundational economy.

The 2D firm-demand work becomes one part of this: the view of a single node in a larger web of flows.

## 1. What to keep from the 2D model

- **GVA as a residual.** GVA is revenue minus bought-in costs, $(S - C)\,Q$. It is not a measure of efficiency in itself. This carries straight into a flows model.
- **Demand enters through both S and Q.** Demand affects GVA through prices as well as quantities, at every node, not just the one facing consumers.
- **Market power moves GVA along chains.** The paper's supermarket–dairy example and its rural–urban prediction are special cases of a general point, developed below.
- **One number hides too much.** A single GVA-per-worker figure conceals all of this. The larger project's "streetlight" critique is the same argument applied to data systems as a whole.
- **Fixes needed first.** The main note's "Points to check" apply:
  - draw the isoGVA curve with the margin S − C, not S/C;
  - put utilities in C, not inside GVA;
  - handle nominal vs real explicitly;
  - remember that standard data reveal GVA and S/C but not Q.

## 2. What the 2D model misses

Each gap below covers what is missing, why it matters for the larger project, and how a model could represent it.

**1. The network.**

- *What's missing.* The paper looks at firms one at a time, plus one three-firm chain.
- *Why it matters.* In a flows view, every S is someone else's C, and every Q is partly demand from other firms. Summed over the economy, GVA equals final demand minus imports.
- *How to model it.* A matrix of flows between establishments, input–output style (`flows-and-value-added.md`).

**2. Where value is captured and booked, versus where it is created.**

- *What's missing.* The paper's chain example hints at this but has no mechanism for intellectual property (IP), transfer pricing, tax structures or statistical allocation rules.
- *Why it matters.* This is the Cupertino problem.
  - Apple's profits were 58.5% of the iPhone's 2010 sales price; Chinese labour was 1.8%.
  - Under ownership-based accounting, Irish GDP can include goods made in China.
  - About 36% of multinational profits are shifted to tax havens.
  - ONS spreads a multi-region firm's profits by wage bill, at least in finance and insurance.
- *How to model it.* Booking rules as switches, plus a chain-wide (vertically integrated) productivity lens (`where-gva-is-recorded.md`).

**3. Where GVA goes.**

- *What's missing.* The paper's bands (profit, labour, depreciation, other) are never followed to people.
- *Why it matters.* GVA is not income, and income is not wealth. Wages go to commuters' homes; profits go to owners, and 58.8% of UK quoted shares are owned overseas; taxes and benefits redistribute; essential costs and house prices decide residual income and wealth.
- *How to model it.* Commuting and ownership matrices, a simple tax and benefit system, essential costs, and wealth accounts (`productivity-incomes-and-wealth.md`).

**4. Capital and ownership.**

- *What's missing.* The paper rejects aggregate production functions on capital-controversy grounds, but has no capital stocks, investment or ownership of its own.
- *Why it matters.* The depreciation band is a capital flow. Who owns capital decides where profit income and wealth build up. And the choice of technique decides L for a given GVA (footnote 16).
- *How to model it.* Capital stocks and investment flows in a stock-flow consistent frame; an ownership matrix; techniques chosen by comparing costs.

**5. Labour flows.**

- *What's missing.* Where workers live, hours worked, migration, and labour hoarding.
- *Why it matters.* L is the denominator of productivity, and workplace and residence geographies differ. ONS itself warns that GVA per head is distorted by commuting.
- *How to model it.* A commuting matrix and employment rules (`demand-led-productivity-dynamics.md`).

**6. Foundational and non-market sectors.**

- *What's missing.* The 2D lens fits market firms that set their own prices. Much of the foundational economy has administered prices, or output measured by indicators.
- *Why it matters.*
  - The foundational economy is about 40% of jobs and about 30% of household spending.
  - Public services are about 20% of GDP.
  - Baumol's cost disease means these sectors show low measured productivity growth, yet they decide liveability.
- *How to model it.* A sector typology; switchable conventions for measuring output; a liveability lens (`foundational-economy-and-sector-linkages.md`).

**7. Unpaid household work.**

- *What's missing.* It is entirely outside GVA.
- *Why it matters.* It was worth £1.7 trillion, about 61% of GDP, in 2023, mostly care.
- *How to model it.* An optional household-production sector.

**8. Prices and deflation.**

- *What's missing.* The paper's argument is in current prices only.
- *Why it matters.* Price-redistribution effects fade in national real figures but persist in firm and regional statistics.
- *How to model it.* A measurement layer with nominal, industry-deflated and physical views (`measuring-gva-and-productivity.md`, section 6).

**9. Demand closure and time.**

- *What's missing.* Aggregate demand is invoked but never modelled.
- *Why it matters.* Austerity, wage-led growth and hysteresis claims need it.
- *How to model it.* A Kaleckian or Godley–Lavoie closure plus Kaldor–Verdoorn dynamics (`demand-led-productivity-dynamics.md`).

**10. Physical flows** (if "other in/outs" includes them).

- *What's missing.* Energy, materials and emissions.
- *Why it matters.* They link productivity to environmental limits.
- *How to model it.* Environmentally extended input–output tables, as a later extension.

**11. Data.**

- *What's missing.* The paper asks for S, C and Q data.
- *Why it matters.* That is one corner of a much larger blind spot: flows between firms and regions, ownership, profit destinations, non-market output, wealth.
- *How to model it.* Generate the streetlight statistics from a fully known model economy (`data-streetlight-effect.md`).

## 3. Three ways to model it

**Option A: a population of firms.** This extends the ladder in `agent-based-firm-demand-models.md`.

- *Strengths:* demand, pricing and markups; firm heterogeneity; the isoGVA cloud; labour hoarding.
- *Weaknesses:* no flows between places or through to households. It can't show the Cupertino gap or the gap between productivity and wealth, which are central to the larger project.

**Option B: a flow-network model.** A stylised, stock-flow consistent economy of places, sectors and establishments, with households, owners, government and a rest of the world. Each establishment's 2D rectangle is the view of a single node.

- *Strengths:*
  - It shows where GVA is booked against where incomes and wealth end up.
  - Sector links, foundational ones included, are explicit.
  - Statistics are generated as an official observer would see them, so the streetlight can be toggled.
  - Its accounting can be checked every step.
  - It can start with fixed coefficients and simple rules.
- *Weaknesses:* more structure to design up front; behaviour starts simple.

**Option C: a full agent-based flow model.** Option B plus the agent rules from the earlier notes: pricing rules, demand allocation, hiring and firing, customer networks.

- *Strengths:* emergent dynamics, cycles, tipping points.
- *Weaknesses:* harder to explain and to keep transparent. Better as a later stage.

**Recommendation: Option B first, designed so that Option A's behaviours and Option C's agents can be plugged in later.**

- The project's core questions are about accounting and distribution: where value is booked, where incomes and wealth land, and what statistics can see. Simple behaviour is enough to show these.
- The "true flows versus streetlight" showcase needs an economy whose flows are all known.
- A small network of places and sectors is light enough for a browser.
- The firm-demand work then becomes the behavioural module for each node: pricing rules, demand allocation and the 2D view.

## 4. A sketch of Option B, for discussion

### Things in the model

- **Places**, for example four:
  - a core city with head offices, IP and high-end services;
  - a manufacturing town;
  - a rural area with primary production and foundational services;
  - the rest of the world, with offshore assembly, overseas owners and low-tax jurisdictions.
- **Sectors:**
  - primary (for example dairy);
  - manufacturing and assembly;
  - IP and head-office services;
  - distribution and retail;
  - material foundational (utilities, transport);
  - providential foundational (health, education, care, partly public);
  - housing.
- **Establishments:** a sector in a place, each belonging to a firm. Firms can span several places.
- **Households,** by place of residence; tenure and skill can be added later.
- **Owners:** local households, pension funds, overseas investors.
- **Government:** taxes, benefits and public foundational services.

### Flows each period

- Purchases between establishments, following input–output coefficients, at transfer prices.
- Final demand: household consumption by place of residence (including essentials), government provision, investment and exports.
- Wages, from establishments to households through the commuting matrix.
- Profits, from firms to owners through the ownership matrix. A booking rule decides which place records them.
- Taxes, benefits, rents, depreciation and investment.
- Optionally later: unpaid household production and physical flows.

### Accounting rules the model must always satisfy

- **For each establishment:** revenue − purchases = GVA = wages + booked profit + depreciation + taxes on production.
- **For each household:** income − taxes + benefits − consumption = saving, which adds to wealth along with any revaluation of assets.
- **For the whole economy:** every flow has a payer and a payee, so the accounts balance (the stock-flow consistency check), and total GVA = final demand − imports.

### Lenses: statistics the model generates

1. Official-style workplace GVA per job by place, using ONS-like booking and allocation rules.
2. Productivity of the whole chain behind each final product (vertically integrated).
3. Disposable household income (GDHI) per resident by place.
4. Residual income after essentials.
5. Wealth by place and tenure.
6. Foundational vs tradable shares, local multipliers and how much spending stays local.
7. The 2D rectangle (S, C, Q and GVA bands) at any node.

### First experiments

1. **Cupertino.** Move IP ownership or transfer prices. Regional GVA per job swings, while production, jobs and wages stay put.
2. **Supermarket squeeze.** GVA moves to the city, and rural incomes fall.
3. **Austerity in providential services.** Lower local demand and multiplier losses. Watch measured productivity against liveability.
4. **Local vs overseas ownership.** Same GVA, different local incomes and wealth.
5. **Commuting and house prices.** GVA per head against disposable income and residual income.
6. **Demand shocks, as in the paper's mechanisms.** S and Q change at every node through the network.
7. **Localising anchor-institution procurement** (Preston). More spending stays local.

## 5. Decisions (made by the user, 3 October 2026)

1. **Stylised or UK-calibrated?** Decided: stylised. Build it so it can later be calibrated to, and compared with, actual data such as ONS input–output tables, regional accounts and the trade-between-regions estimates.
2. **Places and a global node?** Decided: four places, namely a core city, a manufacturing town, a rural area and a rest-of-the-world.
3. **Snapshot or over time?** Decided: the model runs over time, so factors can be held fixed and change observed. A single-period version may be built first to test the accounting.
4. **Behavioural depth?** Decided: fixed coefficients and markup pricing for now. Agent rules come later.
5. **Public and foundational output?** Decided: offer both measurement conventions, input-based and quality-indicator, as a switch.
6. **Unpaid work and physical flows?** Decided: both left out of the first version, with room to add them later.
7. **Where the firm-demand work sits?** Decided, provisionally: as the view of a single node and the first behavioural module, not the whole model.

## 6. Research still needed

- ONS's regional allocation rules for multi-region firms outside finance and insurance.
- How producer price indices treat size and quality changes.
- The Foundational Economy Collective's material/providential definitions and residual-income figures, from the primary texts.
- Whether the UK multi-regional input–output and SAM datasets are usable.
- How ownership of unquoted businesses varies by region.
- Optional: Apple's own value added per employee and where it is booked (annual reports; the EU state aid case), for a worked Cupertino example.

## Sources

This note synthesises the other notes in this folder; see their source lists. The project framing is the user's statement of 3 October 2026, recorded in `worklog.md`.
