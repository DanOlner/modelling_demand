# Existing computational models with firm-demand rules we could reuse

Webber & Huaccha (2024) give an identity, not a model. Several agent-based (AB) and stock-flow consistent (SFC) macro models already contain firm-level rules for prices, quantities, markups and how customers choose firms. These rules could be borrowed to build the paper's ideas into a simulation.

This note describes their rules in maths and prose (no code) as templates for exploring the model space. Parameter values are the authors' baselines, for orientation only. The note covers economics only; browser-based demos were left out of scope this round.

## 1. Godley & Lavoie model SIM: the simplest stock-flow consistent macro closure

**What it is.** The simplest model with government money, from Godley & Lavoie (2007, *Monetary Economics*, ch. 3). Households earn wages, pay tax, consume and hold money. Government spends and taxes.

**Equations** (as given in the MacroStat documentation of the model):

- consumption $C_t = \alpha_1 YD_t + \alpha_2 H_{h,t-1}$;
- disposable income $YD_t = W N_t - T_t$;
- taxes $T_t = \theta W N_t$;
- national income $Y_t = C_t + G_t$;
- household money $H_{h,t} = H_{h,t-1} + YD_t - C_t$;
- government money issued $H_{s,t} = H_{s,t-1} + G_t - T_t$;
- employment $N_t = Y_t / W$.

**Typical parameter values** are $\alpha_1 = 0.6$, $\alpha_2 = 0.4$, $\theta = 0.2$, $G = 20$, $W = 1$. These are the values usually reproduced from the book. The documentation I fetched gives no defaults, so check the book before relying on them.

**Steady state** (my derivation). Money stocks stop changing when $G = T = \theta Y$, so $Y^* = G/\theta$, which is 100 with the values above.

**Use for us.** This is a minimal aggregate-demand engine.

- Cutting $G$ (austerity) lowers $Y$ and so the spending available to firms.
- Its consistency rules mean every flow comes from somewhere and goes somewhere, which is a good discipline for a browser model.

**A distributional alternative.** Hein's Kaleckian model with profits and interest is in the demand-dynamics note, section 1.

## 2. K+S (Keynes + Schumpeter): markups that follow market share

**What it is.** Developed by Dosi, Fagiolo & Roventini (2010) and extended with banks and credit in 2013 and 2014. Dosi, Napoletano, Roventini & Treibich (2014) summarise the family.

- Capital-good firms innovate and imitate.
- Consumption-good firms buy machines of different vintages, so their labour productivity is heterogeneous.
- Demand comes from wages and unemployment benefits: $C_t = w_t L^D_t + w^u_t (L^S - L^D_t)$, with $w^u = \varphi w$.

**Consumption-good firms' rules:**

- **Price:** $p_{j,t} = (1+\mu_{j,t})\,c_{j,t}$, where $c$ is unit cost.
- **Markup follows market share**, a Kaleckian "degree of monopoly":

$$\mu_{j,t} = \mu_{j,t-1}\left(1 + \upsilon\,\frac{f_{j,t-1} - f_{j,t-2}}{f_{j,t-2}}\right)$$

- **Competitiveness:** $E_{j,t} = -\omega_1 p_{j,t} - \omega_2 l_{j,t}$, where $l$ is unfilled demand inherited from the previous period.
- **Market shares** follow "quasi" replicator dynamics:

$$f_{j,t} = f_{j,t-1}\left(1 + \chi\,\frac{E_{j,t} - \bar{E}_t}{\bar{E}_t}\right)$$

- **Exit.** A firm goes bankrupt if its liquid assets turn negative or its market share falls to zero. It is replaced by a smaller entrant.

**Benchmark values:**

- 200 consumption-good firms and 50 capital-good firms;
- $\upsilon = 0.04$, $\omega_1 = \omega_2 = 1$, $\chi = 1$;
- initial markup 0.30, desired inventories 10%;
- unemployment benefit 40% of the wage, tax rate 10%.

**Policy experiments:**

- the initial markup varied from 0.10 to 0.40 (income distribution);
- $\chi$ = 0.95 or 1.05 (weak or strong market selection);
- antitrust caps on market share of 75% or 50%.

**What it reproduces.** Endogenous growth with fluctuations, fat-tailed growth rates, persistent productivity differences across firms, lumpy investment and countercyclical bankruptcies.

**Use for us.** Measured GVA per worker in such a model mixes the markup (driven by market share) with physical productivity from machine vintages. That is a ready test bed for the paper's claim that the two get confused.

## 3. Mark-0: simple firm rules and tipping points

**What it is.** Gualdi, Tarzia, Zamponi & Bouchaud (2015), a stripped-down descendant of the "Mark I" model in the Delli Gatti et al. family. Each step:

- **Quantity.**
  - With excess demand ($Y_i < D_i$), the firm raises output by a fraction $\eta^+$ of the gap, limited by the unemployed workers available.
  - With excess supply, it cuts output by a fraction $\eta^-$ of the gap.
  - $\eta^+$ and $\eta^-$ are the hiring and firing propensities, both below one because of hiring and firing costs.
- **Price.** If $p_i < \bar{p}$ and demand exceeds supply, $p_i$ rises by a factor $(1 + \gamma_p \xi)$. If $p_i > \bar{p}$ and supply exceeds demand, it falls by $(1 - \gamma_p \xi)$. Here $\xi$ is uniform on [0, 1].
- **Household spending budget:** $C_B = c\,[S + \sum_i W_i Y_i]$, where $S$ is household savings and $c$ the propensity to spend.
- **Spending allocated by logit:**

$$D_i = \frac{C_B}{p_i}\cdot\frac{e^{-\beta p_i/\bar{p}}}{\mathcal{Z}}$$

- **Default.** A firm defaults when its debt-to-payroll ratio $\Phi_i$ reaches a threshold $\Theta$.
- **Wages** (an extension). Wages rise with the employment rate when a firm is profitable and short of output. They fall with the unemployment rate when it is loss-making with excess supply.

**Baseline values:**

- 5,000 firms;
- $c = 0.5$, $\gamma_p = 0.05$, $\beta$ from 0 to 2;
- dividend share 0.02, firm revival rate 0.1.

**Phase diagram.** The key parameter is $R = \eta^+/\eta^-$, the ratio of hiring to firing speed.

- Below a critical $R_c$ the economy collapses to full unemployment.
- Above it, the outcome depends on the debt threshold $\Theta$:
  - residual unemployment of 30–50% when $\Theta$ is low;
  - endogenous crises (near-zero unemployment with periodic spikes) for intermediate $\Theta$;
  - full employment when $\Theta$ is high.
- Near a boundary, small shocks get amplified.

**Use for us.** This is the clearest template for "exploring the model space". Sweeping two parameters produces a phase diagram, which would make a strong browser showcase. Its asymmetric hiring and firing directly creates labour hoarding, which drives measured productivity over the cycle.

## 4. Lengnick (2013): a minimal economy of households and firms

**Structure.**

- 1,000 households and 100 firms.
- Time runs in days, with 21 days a month. Goods are bought daily and labour monthly.
- Each household buys from 7 linked firms ("type A" links) and works for one ("type B").
- There is no government or central bank.

**Firm rules (monthly):**

- **Wage.** Raise it if a vacancy went unfilled; cut it if every position has been filled for $\gamma = 24$ months. Each change is a uniform random amount up to $\delta = 0.019$.
- **Employment.**
  - Inventory bounds are set relative to last month's demand $d$: a lower bound of $0.25d$ and an upper bound of $1.0d$.
  - If inventory is below the lower bound, hire one worker immediately. If above the upper bound, fire one worker with a month's lag.
- **Price.**
  - Price bounds are set relative to marginal cost: a lower bound of 1.025× and an upper bound of 1.15×.
  - If inventory is low and the price is below its upper bound, raise the price with probability $\theta = 0.75$, by a uniform random amount up to $\vartheta = 0.02$.
  - If inventory is high and the price is above its lower bound, cut it the same way.
- **Production:** output = 3 × workers ($\lambda = 3$). A liquidity buffer of 10% of the wage bill is kept and the rest paid out as profit.

**Household rules:**

- With probability 0.25 a month, compare one linked firm with a random other firm. Switch if the other is at least 1% cheaper (the chance of drawing a firm rises with its size).
- With probability 0.25, replace a firm that failed to supply.
- Planned real consumption is $\min\{(m/P)^{0.9}, m/P\}$, where $m$ is money held and $P$ the average price of linked firms.

**Results.**

- Unemployment of 0–4.3%, with endogenous cycles.
- Unsatisfied demand stays below 0.03% in 95% of periods.

**Use for us.** Customer links make each firm's demand specific to that firm and give it a customer base, close to Webber & Tiwasing's "territories". The rules are simple enough to explain on screen.

## 5. Caiani et al. (2016): the agent-based stock-flow consistent benchmark

**What it is.** A full agent-based stock-flow consistent (AB-SFC) model with households, consumption-good and capital-good firms, banks, government and a central bank. All transactions are decentralised, and the accounts are checked to sum to zero every period.

**Firm rules:**

- **Expectations** are adaptive: $z^e_t = z^e_{t-1} + \lambda (z_{t-1} - z^e_{t-1})$.
- **Desired output** = expected sales × $(1+\nu)$ − last period's inventories, where $\nu$ is the desired inventory share of sales.
- **Price** = $(1+\mathrm{mu})$ × expected unit labour cost.
- **Markup rule:**
  - if last period's inventory-to-sales ratio was at or below $\nu$, the markup rises by a random proportion drawn from a folded normal distribution;
  - if it was above $\nu$, the markup falls.
- **Choosing suppliers.** Buyers sample a random subset of suppliers and switch to the cheapest with a probability that rises non-linearly with the percentage price gap. An "intensity of choice" parameter $\epsilon > 0$ controls how readily they switch. The exact function is in the model's online documentation, which I didn't read.

**Results.**

- Inflation is procyclical and lags output.
- Markups are countercyclical.
- About 29% of prices change each month and 45% of changes are cuts, matching US evidence.

**Use for us.** It is the most complete accounting template. It is heavy for a browser, but its firm rules are light.

## 6. Related, not read in detail

**Assenza, Delli Gatti & Grazzini (2015, CATS model).** Firms decide whether to change price or quantity by comparing their inventories with the average price. It is the same family as Mark-0.

## 7. Comparison

| Model | Firms | How demand reaches each firm | Pricing | Physical productivity | What it would add |
|---|---|---|---|---|---|
| SIM (Godley–Lavoie) | none (aggregate) | none | none | none | aggregate demand with consistent accounts |
| K+S (Dosi et al.) | 200 + 50 | replicator market shares from price and unfilled demand | markup moves with market share | machine vintages, innovation | markup vs productivity confusion; Schumpeterian supply side |
| Mark-0 (Gualdi et al.) | 5,000 | logit on relative price | moves toward the average price when supply and demand are out of balance | none (output = labour) | phase diagrams and tipping points; hiring/firing asymmetry |
| Lengnick | 100 | customer links with switching | adjusted on inventories, within cost-based bounds | fixed | firm-specific customer bases; simple, explainable rules |
| Caiani et al. | many, with banks | sampled suppliers, switching probability | markup on unit labour cost, adjusted on inventories | capital vintages | full stock-flow accounting; credit |

## 8. What this gives a browser model of the paper (my synthesis)

These models suggest a ladder of increasing complexity. Each rung adds one mechanism the paper talks about.

1. **Identity explorer.** One firm's S, C, Q and L, with GVA bands and isoGVA curves. No behaviour.
2. **One firm facing a demand curve with a pricing rule.** Shows when raising S increases or decreases GVA (elasticity), and how pass-through decides the effect of squeezing C.
3. **A population of firms** with logit or replicator demand allocation and inventory-driven price and quantity rules (Mark-0 or Lengnick style). Gives a scatter of firms on isoGVA axes, long tails in GVA per worker, and a hiring/firing asymmetry that produces labour hoarding.
4. **Supply chains.** Linked firms whose S is the next firm's C, with bargaining weights and locations. Covers the rural–urban argument.
5. **Macro closure.** Spending from wages, profits and government (SIM or Kaleckian), feeding back into firms' Q. Covers austerity, immigration and wage-led scenarios.
6. **Productivity dynamics.** Kaldor–Verdoorn or vintage-capital growth in physical output per worker. Shows hysteresis, and how a demand shock becomes a "supply-side" productivity slowdown.

**Feasibility** (my judgement, untested). These models ran with 100–5,000 firms, and each step is simple arithmetic per firm, so populations of that size should be feasible in a browser.

**An open modelling question.** Markups move with the cycle in opposite directions in different models and in different evidence (see the firm-pricing note, section 4), so markup cyclicality should be a switch, not an assumption.

## Sources

- Godley, W. & Lavoie, M. (2007) *Monetary Economics*, ch. 3 (model SIM). Equations from the MacroStat documentation: https://macrostat.readthedocs.io/en/stable/_sources/models/GL06/GL06SIM/equations.rst.txt and https://macrostat.readthedocs.io/en/v0.4.0/models/GL06/GL06SIM.html
- Dosi, G., Napoletano, M., Roventini, A. & Treibich, T. (2014) "Micro and Macro Policies in the Keynes+Schumpeter Evolutionary Models", OFCE Working Paper 2014-19: eqs (4)–(6), section 2.3, Tables 1, 5 and 6: https://www.ofce.fr/pdf/dtravail/WP2014-19.pdf
- Dosi, G., Fagiolo, G. & Roventini, A. (2010) "Schumpeter meeting Keynes: A policy-friendly model of endogenous growth and business cycles", *JEDC* 34(9). Parameter ranges for the consumption-good sector are also given in the Sant'Anna model documentation: https://www.ews.santannapisa.it/ks-basic
- Gualdi, S., Tarzia, M., Zamponi, F. & Bouchaud, J.-P. (2015) "Tipping points in macroeconomic agent-based models", *JEDC*: https://ar5iv.arxiv.org/html/1307.5319 (arXiv 1307.5319)
- Lengnick, M. (2013) "Agent-based macroeconomics: A baseline model", *Journal of Economic Behavior & Organization* 86, pp. 102–120, sections 2.1–2.4 and Tables 1–2: https://legacy.econ.tuwien.ac.at/lva/compeco.se/artikel/jebo_2013_agent_based_macroeconomics_a_baseline_model.pdf
- Caiani, A., Godin, A., Caverzasi, E., Gallegati, M., Kinsella, S. & Stiglitz, J. (2016) "Agent based-stock flow consistent macroeconomics: Towards a benchmark model", *JEDC* 69, pp. 382–384 and 393: https://business.columbia.edu/sites/default/files-efs/imce-uploads/Joseph_Stiglitz/Agent%20based-stock%20flow.pdf
- Assenza, T., Delli Gatti, D. & Grazzini, J. (2015) "Emergent dynamics of a macroeconomic agent based model with capital and credit", *JEDC* 50: https://ideas.repec.org/a/eee/dyncon/v50y2015icp5-28.html
- Hein, E. (2015), IPE Berlin Working Paper 60/2015: see the demand-dynamics note.
