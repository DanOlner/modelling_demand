# Model specification, version 1: a stylised flow model of where GVA is made, booked and received

This is the brief for building the first version of the model. It uses prose, tables and equations only, with no code. The build happens in the separate build container.

The model is a small, stylised economy:

- **Places:** four, namely a core city, a manufacturing town, a rural area and the rest of the world.
- **Accounts:** every flow is recorded, so the accounts always balance.
- **Time:** it runs over time.
- **Two views of every result:** the statistics an official observer would see, and the true flows behind them.

Each producer's 2D rectangle (price S, unit bought-in cost C, quantity Q) from Webber & Huaccha (2024) is available as a view of that single producer.

**Background reading:**

- `interrogating-the-2d-model.md`: why this model, and the decisions behind it;
- `worklog.md`: history;
- the topic notes listed at the end.

**Decisions this spec follows** (made by the user on 3 October 2026):

1. Stylised, but built so it can later be calibrated to, and compared with, real data.
2. Four places: a core city (C), a manufacturing town (M), a rural area (R) and the rest of the world (W).
3. Runs over time. A single-period base year is built and tested first.
4. Fixed input–output coefficients and markup pricing; agent behaviour comes later.
5. Both measurement conventions for public-service output, available as a switch.
6. No unpaid household work or physical flows (energy, materials) in version 1, but room is left for them.
7. The firm-demand work provides the single-producer view and the first behavioural module.

All numbers here are first guesses for a stylised economy. They are meant to be plausible in proportion, not to describe any real place.

## 1. Scope of version 1

**In:**

- 17 domestic producers across three places, plus rest-of-world suppliers and an offshore holder of intellectual property (IP);
- households by place of residence;
- firms and their owners, including overseas owners;
- a national government;
- commuting;
- markup pricing;
- spending-driven output with a multiplier;
- taxes and benefits;
- money and wealth stocks over time;
- seven ways of reporting results (the "lenses" in section 13);
- seven experiments.

**Out, with room left:**

- unpaid household production;
- physical and environmental flows;
- several household types per place (by tenure or skill);
- agent behaviour;
- price-responsive trade;
- net investment and capital growth;
- productivity dynamics such as Kaldor–Verdoorn;
- calibration to UK data.

See section 18.

## 2. Conventions

- **Time:** discrete periods of one year. Period 0 is the calibrated base year. Scenario changes apply from a stated period (default t = 5). Default runs go to t = 40.
- **Volume units:** each producer's output is measured in base-year pounds. One unit is "£1 of output at base-year prices", so every price index is 1 in the base year.
- **Display units:** each producer also has a display price $\pi^0_j$, its price in £ per physical unit. The single-producer view shows physical units: $S = p_j\,\pi^0_j$, $Q = x_j/\pi^0_j$.
- **Money:** £ per year. Employment is in persons; populations are in persons.
- **Notation:**
  - producers $i, j, k$; workplaces $w$ and residence places $r$, both from {C, M, R}; owner groups $o$ from {C, M, R, W};
  - output volume $x_j$; price index $p_j$;
  - input coefficient $a_{ij}$: units of $i$'s output used per unit of $j$'s output;
  - jobs per unit of output $\ell_j$; annual wage per job $\omega_j$ (£);
  - depreciation per unit of output $\delta_j$ (£); markup on prime cost $\mu_j$.
- **Tolerances:**
  - converge price and quantity solves to a relative change below $10^{-12}$;
  - accounting identities must hold to within $10^{-6}$ of GDP;
  - the scenario tests in section 16 must hold to within $10^{-9}$ relative.

## 3. Places and people

**Population.**

- Total population is 1.8 million. The city's share $s_C$ is set by the base-year calibration (section 12).
- The rest splits between town and rural area in the ratio 2 : 1:
  - $N_C = s_C \cdot 1.8\text{m}$;
  - $N_M = \tfrac{2}{3}(1 - s_C)\cdot 1.8\text{m}$;
  - $N_R = \tfrac{1}{3}(1 - s_C)\cdot 1.8\text{m}$.

| Place | Working-age share | Participation (of working-age) | Persons per dwelling |
|---|---|---|---|
| C | 0.66 | 0.80 | 2.3 |
| M | 0.62 | 0.76 | 2.3 |
| R | 0.58 | 0.74 | 2.3 |

**Derived quantities:**

- labour force $LF_r = N_r \times$ working-age share $\times$ participation;
- non-working-age population $NW_r = N_r \times (1 -$ working-age share$)$.

**Households.** There is one representative household account per place of residence in version 1.

## 4. Producers, firms and owners

### Producers

| ID | Place | What it does | Pricing rule | Display unit (base £ per unit) |
|---|---|---|---|---|
| C.HQ | City | Gadget brand: IP, design, head office ("Cupertino") | fixed price | gadget, £700 |
| C.BIZ | City | Business and financial services, sold to firms everywhere and exported | markup | consultant hour, £120 |
| C.RET, M.RET, R.RET | each place | Everyday goods and services: retail, hospitality, personal services | markup | basket, £10 |
| C.UTL, M.UTL, R.UTL | each place | Utilities and transport (material foundational economy) | markup (regulated) | service unit, £1 |
| C.PRV, M.PRV, R.PRV | each place | Health, education, care (providential foundational economy), publicly funded and non-market | cost price | service hour, £30 |
| C.HSG, M.HSG, R.HSG | each place | Housing services (rent) | fixed price | dwelling-year: £13,800 (C), £6,900 (M), £8,050 (R) |
| M.CMP | Town | Components and capital goods | markup | component set, £140 |
| M.FOD | Town | Food processing | markup | pot, £0.50 |
| R.AGR | Rural | Agriculture (milk and other produce) | markup | litre, £0.35 |
| W.GEN | Rest of world | Imported goods and energy | fixed price | £1 |
| W.ASM | Rest of world | Contract assembly of gadgets | fixed price | assembly, £56 |
| W.IP | Rest of world | Offshore IP-holding subsidiary of GadgetCo; receives royalties only when the Cupertino switch is on | — | — |

### Firms and the place of their head office

| Firm | Producers | Head office |
|---|---|---|
| GadgetCo | C.HQ (and W.IP) | C |
| BizCo | C.BIZ | C |
| RetailCo | C.RET, M.RET, R.RET | C |
| UtilityCo | C.UTL, M.UTL, R.UTL | C |
| CompCo | M.CMP | M |
| FoodCo | M.FOD | M |
| Farms | R.AGR | R |
| Landlords C, M, R | C.HSG, M.HSG, R.HSG | own place |
| Government | C.PRV, M.PRV, R.PRV | none (no profits) |

### Ownership: shares of each firm's dividends, $s_{f,o}$

| Firm | C | M | R | W (overseas) |
|---|---|---|---|---|
| GadgetCo (incl. W.IP) | 0.30 | 0.03 | 0.02 | 0.65 |
| BizCo | 0.40 | 0.05 | 0.05 | 0.50 |
| RetailCo | 0.40 | 0.10 | 0.05 | 0.45 |
| UtilityCo | 0.15 | 0.05 | 0.05 | 0.75 |
| CompCo | 0.20 | 0.40 | 0.00 | 0.40 |
| FoodCo | 0.10 | 0.60 | 0.10 | 0.20 |
| Farms | 0 | 0 | 1.00 | 0 |
| Landlords C | 0.70 | 0 | 0 | 0.30 |
| Landlords M | 0.20 | 0.80 | 0 | 0 |
| Landlords R | 0.20 | 0 | 0.80 | 0 |

For orientation, 58.8% of UK quoted shares were owned overseas at the end of 2024 (`data-streetlight-effect.md`).

## 5. Technology: cost structures per £1 of output at base prices

Each row gives a producer's bought-in inputs, by supplier, and the split of the rest of its output value into wages, depreciation and net profit. Every row sums to 1. "r" means the supplier in the buyer's own place.

| Producer | Bought-in inputs, by supplier | Inputs total | Wages | Depreciation | Net profit | Wage per job (£) |
|---|---|---|---|---|---|---|
| R.AGR | W.GEN 0.28, R.UTL 0.05, C.BIZ 0.02 | 0.35 | 0.30 | 0.15 | 0.20 | 25,000 |
| M.FOD | R.AGR 0.40, W.GEN 0.13, M.UTL 0.04, C.BIZ 0.03 | 0.60 | 0.22 | 0.07 | 0.11 | 30,000 |
| M.CMP | W.GEN 0.38, M.UTL 0.05, C.BIZ 0.04 | 0.47 | 0.30 | 0.08 | 0.15 | 36,000 |
| C.HQ | M.CMP 0.20, W.ASM 0.08, W.GEN 0.04, C.UTL 0.02, C.BIZ 0.06 | 0.40 | 0.20 | 0.05 | 0.35 | 100,000 |
| C.BIZ | W.GEN 0.08, C.UTL 0.03 | 0.11 | 0.50 | 0.05 | 0.34 | 55,000 |
| r.RET | M.FOD 0.16, W.GEN 0.16, r.UTL 0.04, C.BIZ 0.04 | 0.40 | 0.40 | 0.07 | 0.13 | 27,000 |
| r.UTL | W.GEN 0.25, C.BIZ 0.03 | 0.28 | 0.30 | 0.20 | 0.22 | 38,000 |
| r.PRV | r.UTL 0.06, W.GEN 0.06, r.RET 0.04, C.BIZ 0.02 | 0.18 | 0.75 | 0.07 | 0 | 32,000 |
| r.HSG | r.UTL 0.05, W.GEN 0.02, r.RET 0.02, C.BIZ 0.01 | 0.10 | 0.02 | 0.25 | 0.63 | 28,000 |

**What follows from the table:**

- **Coefficients.** The input coefficients $a_{ij}$ are the bought-in input entries. Depreciation per unit is $\delta_j$ = the depreciation column (£ per unit).
- **Jobs per unit of output:** $\ell_j$ = wage share ÷ wage per job. The values are:

| Producer | Jobs per £ of output ($\ell_j$) |
|---|---|
| AGR | $1.2\times10^{-5}$ |
| FOD | $7.333\times10^{-6}$ |
| CMP | $8.333\times10^{-6}$ |
| HQ | $2.0\times10^{-6}$ |
| BIZ | $9.0909\times10^{-6}$ |
| RET | $1.48148\times10^{-5}$ |
| UTL | $7.8947\times10^{-6}$ |
| PRV | $2.34375\times10^{-5}$ |
| HSG | $7.142857\times10^{-7}$ |

- **Base-year GVA per job** is (1 − inputs total) ÷ $\ell_j$:

| Producer | GVA per job |
|---|---|
| HQ | £300,000 |
| BIZ | £97,900 |
| UTL | £91,200 |
| CMP | £63,600 |
| FOD | £54,545 |
| AGR | £54,167 |
| RET | £40,500 |
| PRV | about £35,000 |
| HSG | about £1.26m |

  - The HSG figure is real: housing GVA is mostly rent, with almost no jobs.
  - HQ's figure is the "Cupertino" contrast.

- **Labour per unit in the rest of the world**, used only for the whole-chain productivity lens:
  - W.ASM: $2.15\times10^{-5}$ jobs per £, i.e. a labour share of about 0.14 at a wage of about £6,500;
  - W.GEN: $1.0\times10^{-5}$ jobs per £.
  - Both are stylised.

**Consistency with the display units:**

- each £700 gadget uses £140 of components (one component set) and £56 of assembly (one assembly);
- 1 litre of milk = £0.35 and 1 pot = £0.50 at base prices.

## 6. Prices

Prices are solved first in each period. In version 1 they do not depend on quantities.

**Markup producers** (BIZ, RET, UTL, CMP, FOD, AGR):

$$p_j = (1+\mu_j)\Big(\sum_i a_{ij}\,p_i + \omega_j\,\ell_j\Big)$$

This is a markup on prime cost: bought-in inputs plus direct labour, Kaleckian style (see `firm-pricing-and-firm-demand.md`).

**Base markups** are set so that every base price is 1, i.e. $\mu_j = 1/(\text{inputs total} + \text{wage share}) - 1$:

| Producer | Base markup $\mu_j$ |
|---|---|
| AGR | 0.538462 |
| FOD | 0.219512 |
| CMP | 0.298701 |
| BIZ | 0.639344 |
| RET | 0.25 |
| UTL | 0.724138 |

Markups cover depreciation and net profit.

**Cost-price producers** (PRV, non-market). The price is unit cost, so the output value equals the cost of providing it:

$$p_j = \sum_i a_{ij}\,p_i + \omega_j\,\ell_j + \delta_j$$

**Fixed-price producers:**

- C.HQ: the gadget brand sets its price, which does not move with costs;
- r.HSG: rents by place;
- W.GEN and W.ASM.

Each has $p_j = \bar p_j$, which is 1 in the base year and can be changed by scenarios.

**Royalty.** When the Cupertino switch is on, C.HQ pays W.IP a royalty of $R = r_{IP}\,p_{HQ}\,x_{HQ}$, which is a share $r_{IP}$ of its revenue. Its price is fixed, so the royalty does not change its price.

**Solving.** Iterate the price equations from the previous period's prices until converged. **Check:** with base parameters, every price comes out at exactly 1.

## 7. Demand

Quantities are driven by spending. In version 1 there are no supply constraints.

### Households in place $r$

**Essentials** are fixed quantities:

- housing $h_r$, with base-year rent spending per resident of £6,000 (C), £3,000 (M) and £3,500 (R);
- utilities, $e_U = 1{,}500$ units per resident;
- everyday basics, $e_R = 2{,}500$ units of the local RET per resident.

Essential spending is

$$E_r = p_{HSG,r}\,h_r + p_{UTL,r}\,e_U N_r + p_{RET,r}\,e_R N_r$$

**Consumption:**

- in the base year, $C_r = YD_r$ (households spend all their disposable income);
- in later periods, $C_r = \alpha_1 YD_r + \alpha_2 M^h_{r,t-1}$, with $\alpha_1 = 0.9$ and $\alpha_2 = 0.1$. This is a Godley–Lavoie-style rule; see `agent-based-firm-demand-models.md`.

**Discretionary spending** is $Z_r = C_r - E_r$. It is split:

- a share $s_g = 0.03$ goes on gadgets from C.HQ, a quantity of $s_g Z_r / p_{HQ}$;
- the rest goes on extra local RET, a quantity of $(1 - s_g) Z_r / p_{RET,r}$.

If $C_r < E_r$, households still buy the essentials. Set $C_r = E_r$, flag "essentials exceed planned consumption", and let money holdings fall.

### Government

- It buys providential services in each place: $g = 5{,}500$ units per resident, a quantity of $G_r = g\,N_r$ (scaled by a scenario multiplier).
- Spending is $\sum_r p_{PRV,r}\,G_r$.

### Investment

- Version 1 has replacement investment only: total investment equals total depreciation, $I = \sum_j \delta_j x_j$.
- It is spent:
  - a share $s_K = 0.5$ on M.CMP, a quantity of $s_K I/p_{CMP}$;
  - the rest on W.GEN.
- Capital stocks are therefore constant in version 1.

### Exports

- Total export value at base prices, $X$, is set by the base-year calibration.
- Its split by product (the export mix) is fixed: C.HQ 0.40, C.BIZ 0.35, M.CMP 0.15, M.FOD 0.10.
- Export quantities stay fixed after the base year unless a scenario changes them. There is no price response in version 1.

### Output

For domestic producers, solve

$$x_j = \sum_k a_{jk}\,x_k + f_j$$

where $f_j$ is the final demand for $j$'s output in quantities. Use iteration or a linear solve.

Imports of each rest-of-world product are $m_i = \sum_k a_{ik} x_k$, plus W.GEN's share of investment.

## 8. Incomes, taxes and transfers

**For each domestic producer $j$:**

- jobs $J_j = \ell_j x_j$;
- wage bill $W_j = \omega_j J_j$;
- depreciation $D_j = \delta_j x_j$. This is money at base prices; it is not revalued in version 1;
- GVA $V_j = p_j x_j - \sum_i a_{ij} p_i x_j - R_j$, where $R_j$ is the royalty (C.HQ only);
- net profit $\Pi_j = V_j - W_j - D_j$. Taxes on production are 0 in version 1, but keep the slot;
- profit tax $T^\pi_j = \tau \max(\Pi_j, 0)$, with $\tau = 0.25$. The non-market PRV producers have $\Pi_j = 0$;
- dividends $Div_j = \rho_j (\Pi_j - T^\pi_j)$, with payout $\rho_j = 1$ by default. Owner group $o$ receives $s_{f(j),o}\,Div_j$, where $f(j)$ is the firm owning $j$;
  - negative dividends are allowed: owners then cover the losses;
  - retained earnings are $(1-\rho_j)(\Pi_j - T^\pi_j)$.

**W.IP** (part of the rest of the world):

- its profit is $R$, untaxed by the UK;
- it pays dividends $\rho_{IP} R$ (default $\rho_{IP} = 1$) to GadgetCo's owners in their ownership shares, and retains the rest offshore.

**Households in place $r$:**

- gross income $Y_r$ = wages received through commuting (section 9) + dividends received from domestic firms and from W.IP;
- income tax $T^y_r = \theta Y_r$. The rate $\theta$ is set by the base-year calibration and then held fixed;
- benefits $B_r = b_n\,NW_r + b_u \max(U_r, 0)$, with $b_n = £5{,}000$ per non-working-age resident and $b_u = £6{,}000$ per unemployed person;
- disposable income $YD_r = Y_r - T^y_r + B_r$;
- saving $S_r = YD_r - C_r$.

**Government:**

- tax revenue $T = \sum_r T^y_r + \sum_j T^\pi_j$;
- balance $GB = T - \sum_r p_{PRV,r} G_r - \sum_r B_r$.

**Rest of the world:**

- it receives import payments (W.GEN, W.ASM), royalties $R$, and dividends paid to overseas owners;
- it pays for exports and W.IP's dividends to domestic owners;
- its net receipts are $RB$. The domestic current account is $CA = -RB$.

## 9. Commuting and employment

**Commuting matrix.** $\Gamma_{wr}$ is the share of jobs in place $w$ held by residents of place $r$; each row sums to 1.

- Residents of $r$ in work: $E_r = \sum_w \Gamma_{wr} J_w$, where $J_w$ is total jobs in $w$.
- Wages received by residents of $r$: $\sum_w \Gamma_{wr} W_w$. Commuters earn the same as local workers.
- Unemployment: $U_r = LF_r - E_r$. In version 1, a negative value is reported as a "labour shortage" flag; there is no supply constraint.

**Base-year commuting rule**, used only in period 0 (afterwards $\Gamma$ is fixed unless a scenario changes it):

1. Target employed residents: $E^*_r = LF_r \cdot \sum_w J_w / \sum_r LF_r$. This gives every place the same employment rate.
2. Local jobs are filled first: $L_{rr} = \min(J_r, E^*_r)$.
3. Surplus residents are $S_r = E^*_r - L_{rr}$, and unfilled jobs are $Dj_w = J_w - L_{ww}$.
4. Surplus residents of $r$ fill unfilled jobs elsewhere in proportion to those gaps: $F_{rw} = S_r \cdot Dj_w / \sum_{w'} Dj_{w'}$.
5. So $\Gamma_{ww} = L_{ww}/J_w$, and $\Gamma_{wr} = F_{rw}/J_w$ for $r \neq w$.

**City in-commuting share** = in-commuters to C ÷ jobs in C.

## 10. Stocks and time

**Money stocks.** There is a single financial asset, money (deposits), issued by the government.

- Households: $M^h_{r,t} = M^h_{r,t-1} + S_r$.
- Firms (total): $M^f_t = M^f_{t-1}$ + retained earnings. This stays 0 when payout is 1.
- Government: $M^g_t = M^g_{t-1} + GB$. It is negative, i.e. government debt.
- Rest of world: $M^w_t = M^w_{t-1} + RB$. This includes W.IP's retained royalties.
- **Check every period:** $\sum_r M^h_r + M^f + M^g + M^w = 0$.

**Wealth lens.** These values are capitalised for reporting only; they are not traded.

- Housing wealth of owner group $o$: $\sum_{HSG} s_{f,o}\,p_{HSG}x_{HSG}/y_h$, with $y_h = 0.04$.
- Equity wealth of owner group $o$: $\sum_f s_{f,o}\,(\text{after-tax profit}_f)/y_e$, with $y_e = 0.06$.
- Household wealth in place $r$ = $M^h_r$ + housing wealth + equity wealth.

**What changes over time in version 1:**

- money stocks, through saving and the wealth term in consumption;
- government and rest-of-world positions;
- any scenario changes.

Everything else holds its value unless a scenario changes it.

## 11. Solving one period

1. Apply this period's scenario changes to parameters.
2. Solve prices (section 6).
3. Solve quantities and incomes together by fixed-point iteration. Start from last period's quantities. Repeat until quantities and disposable incomes converge:
   1. build final demand: households from current disposable incomes and last period's money; government; investment (from depreciation at current quantities); exports;
   2. solve outputs $x$;
   3. compute jobs, wages, GVA, profits, taxes and dividends;
   4. compute employment by residence through $\Gamma$, then unemployment, benefits and disposable incomes.
4. Compute all flows, sector balances and stock updates.
5. Compute the lenses (section 13).
6. Run the per-period checks (section 16, T1).

**Test mode "freeze consumption".** Hold each household's quantity of every good fixed at its base-year level. This isolates first-round effects; tests T4, T5 and T7 use it.

## 12. Calibrating the base year (period 0)

**Unknowns solved for:**

- total exports $X$;
- the income tax rate $\theta$;
- the city's population share $s_C$.

**Targets:**

| Target | Default | Set by |
|---|---|---|
| Current account $CA = 0$ | | $X$ |
| National unemployment rate $u^*$ | 0.05 | $\theta$ |
| City in-commuting share $c^*$ | 0.15 | $s_C$ |

**Inside every base-year evaluation:**

- consumption equals disposable income, $C_r = YD_r$;
- the commuting rule of section 9 is applied at each step of the iteration.

**Method.** Any robust method works. Nested bisection is safe: $s_C$ in [0.05, 0.80] on the outside, $\theta$ in [0, 0.8] in the middle, $X$ on the inside. A damped joint update inside the fixed point is faster. Each target pulls in one direction:

- more exports improve the current account;
- a higher tax rate lowers consumption and so raises unemployment;
- a smaller city raises in-commuting.

**After solving:**

- Fix $\Gamma$ at the base-year commuting matrix.
- Set household money to its steady-state level, $M^h_r = (1-\alpha_1)\,YD_r/\alpha_2$, which equals one year's disposable income with the defaults.
- Set $M^f = 0$ and $M^w = 0$, and $M^g = -\sum_r M^h_r$.
- Store the solved $X$, $\theta$ and $s_C$ with the defaults. Rerun the calibration only when base parameters change.

**Why the base year is steady** (so later periods repeat it with no shocks):

- households spend exactly their income;
- firms pay out all profit, and investment equals depreciation;
- the current account is zero.

Since all sector balances must sum to zero, the government balance is then zero as well.

**Plausibility check.** Report these base-year results, and flag any outside the range. Do not tune anything except the three unknowns; out-of-range results go back to the user.

| Base-year result | Expected range |
|---|---|
| Income tax rate $\theta$ | 0.15–0.35 |
| City population share $s_C$ | 0.20–0.50 |
| GDP per resident | £28,000–£40,000 |
| Disposable income ÷ GDP | 0.55–0.75 |
| Labour share of GVA | 0.45–0.60 |
| Exports ÷ GDP | 0.25–0.50 |
| Dividends to overseas owners ÷ GDP | 0.05–0.15 |
| Providential (PRV) share of GVA | 0.12–0.22 |
| Housing share of GVA | 0.08–0.16 |
| C.HQ share of GDP | 0.05–0.25 |
| GVA per job, by place | C > M and C > R |

## 13. Lenses: what the model reports, each period

1. **Workplace GVA, the "official" view.**
   - GVA by place $V_w = \sum_{j \in w} V_j$, with GVA per job and GVA per resident.
   - Variants for the multi-place firms (RetailCo, UtilityCo), selected by switch S1:
     - *true*: each producer's own GVA;
     - *head-office booking*: the net-profit part of all the firm's producers is booked in its head-office place;
     - *wage-bill allocation*: the firm's total net profit is shared among its producers in proportion to their wage bills, as ONS does in finance and insurance (`where-gva-is-recorded.md`).
   - Wages and depreciation always stay where they occur. W.IP's profit is always recorded in the rest of the world.
2. **Value capture per final product: who gets each £ of a gadget, a basket or a PRV hour.**
   - Let $L$ be the Leontief inverse over all producers, domestic and rest-of-world.
   - The value added captured by producer $j$ per unit of final product $k$ is $v_j L_{jk}$, where $v_j$ is GVA per unit. For W.GEN and W.ASM, $v$ equals their price. W.IP's share is the royalty per unit of C.HQ output.
   - Group the results by place, including the rest of the world. They must sum to $p_k$.
   - This reproduces the iPhone value-capture chart (`where-gva-is-recorded.md`).
3. **Whole-chain productivity.**
   - Chain workers per unit of final product: $\lambda_k = \sum_j \ell_j L_{jk}$, including the rest-of-world labour coefficients for this lens.
   - Report final value per chain worker, $p_k/\lambda_k$, next to on-site GVA per job ($V_{HQ}/J_{HQ}$ for gadgets).
4. **Household income by residence.** GDHI per resident ($YD_r/N_r$), shown next to GVA per resident and GVA per job.
5. **Residual income per resident:** $(YD_r - E_r)/N_r$, i.e. income left after essentials.
6. **Wealth per resident by place** (section 10).
7. **Sector groups.** Shares of jobs and GVA by place for:
   - tradable (HQ, BIZ, CMP, FOD, AGR);
   - everyday economy (RET);
   - material foundational (UTL);
   - providential (PRV);
   - housing (HSG).
   - Also report access to providential services as PRV units per resident, adjusted for quality ($q_r$).
8. **Local retention.**
   - The share of GVA produced in place $w$ that becomes income for residents of $w$: wages to resident workers plus dividends to resident owners.
   - The local share of each PRV producer's purchases: the share bought from producers in its own place.
9. **Measurement views**, selected by switches S2 and S3.
   - Nominal GVA.
   - Real GVA valued at each producer's own base prices: $x_j(1 - \sum_i a_{ij}) - r_{IP} x_{HQ}$. This approximates physical output.
   - Real GVA using sector deflators, as official statistics do: deflate each producer's output by its sector's output-weighted average price across places, and its inputs by a national average price of intermediate inputs.
   - **PRV output measurement switch:**
     - *input-based*: volume = inputs at base prices (bought-in inputs + labour + depreciation);
     - *indicator-based*: volume = service units × quality index $q_r$ (default 1).
     - Report real GVA per job in PRV under each.
10. **Macro accounts:**
    - GDP, measured three ways (production, expenditure, income);
    - GNI = GDP + W.IP dividends to domestic owners − dividends paid to overseas owners;
    - current account, government balance;
    - unemployment rate by place;
    - money stocks.
11. **Single-producer view** (the 2D rectangle) for any producer $j$:
    - $S = p_j\pi^0_j$;
    - $C = (\sum_i a_{ij}p_i + R_j/x_j)\,\pi^0_j$;
    - $Q = x_j/\pi^0_j$;
    - jobs $L = J_j$;
    - per-unit bands for wages, depreciation and net profit;
    - isoGVA curves drawn with the margin $S - C$ on the vertical axis, with the paper's $S/C$ version available for comparison (see `webber-huaccha-2024-rethinking-productivity.md`).

## 14. Switches: scenario controls

A scenario is a list of changes: (period, parameter, new value). The available controls:

- **S1** Booking lens: true / head-office / wage-bill.
- **S2** PRV output convention: input / indicator.
- **S3** Measurement view: nominal / own-price real / sector-deflated real.
- **S4** Royalty rate $r_{IP}$ and W.IP payout $\rho_{IP}$.
- **S5** Markups $\mu_j$.
- **S6** Fixed prices $\bar p_j$: HQ, HSG by place, GEN, ASM.
- **S7** Wages per job $\omega_j$.
- **S8** PRV provision per resident (multiplier on $g$ by place), benefit rates $b_n$ and $b_u$, PRV quality $q_r$.
- **S9** Ownership shares $s_{f,o}$.
- **S10** Commuting matrix $\Gamma$ (override).
- **S11** Export quantities: total or by product.
- **S12** Technology: input coefficients $a_{ij}$ and jobs per unit $\ell_j$.
- **S13** Tax rates $\theta$ and $\tau$.
- **S14** Household parameters $\alpha_1$, $\alpha_2$, $s_g$ and the essential quantities.
- **S15** Freeze consumption (test mode).

## 15. Experiments

Each starts from the base year, applies its change at t = 5, and runs to t = 40.

**E1 Cupertino: offshore the IP.**

- Change: $r_{IP}$ goes from 0 to 0.25. Variant: $\rho_{IP} = 0$, cash held offshore.
- Expect:
  - city and national GDP fall by the royalty $R$;
  - C.HQ's GVA per job falls from £300,000 to £175,000;
  - quantities, jobs and wages are unchanged in the first round;
  - UK profit tax falls;
  - GadgetCo's owners gain the tax saving;
  - GNI falls by less than GDP.

**E2 Supermarket squeeze.**

- Change: $\mu_{AGR}$ 0.538462 → 0.40; $\mu_{FOD}$ 0.219512 → 0.10; $\mu_{RET}$ 0.25 → 0.28.
- Expect: prices AGR 0.91, FOD 0.8624, RET 0.9958195. GVA per unit −13.8% (AGR), −25.4% (FOD) and +2.97% (RET). The final retail price falls slightly, as in the paper's example.
- The rural and town GVA losses show up as city GVA under the head-office booking lens.

**E3 Austerity in providential services.**

- Change: PRV provision per resident −10% in all places.
- Expect:
  - PRV jobs −10%;
  - unemployment and benefits rise;
  - disposable income, RET output and residual income fall everywhere, through a multiplier;
  - average GVA per job by place may *rise* because low-GVA jobs are cut, which is the streetlight effect;
  - access to services falls 10%.
- Report the sign of each.

**E4 Overseas takeover.**

- Change: CompCo and FoodCo ownership becomes C 0.05, M 0.05, R 0, W 0.90.
- Expect:
  - GVA unchanged in the first round;
  - town residents' dividends and disposable income fall;
  - GNI falls;
  - later, lower town consumption reduces local RET jobs.

**E5 City rents up 30%.**

- Change: $\bar p_{HSG,C}$ × 1.3.
- Expect:
  - city housing GVA and city GVA per job rise;
  - landlords' income and housing wealth rise;
  - the city's residual income falls.
- Note: with one household per place, owners and renters are blended; separating them is a later version.

**E6 Export slump.**

- Change: all export quantities −20%.
- Expect:
  - output and jobs fall in C and M, and in R through AGR;
  - unemployment and the government deficit rise;
  - imports fall partly.

**E7 Local procurement** (Preston-style).

- Change: in each place's PRV, W.GEN 0.06 → 0.02, with r.RET +0.02 and r.UTL +0.02.
- Expect:
  - imports fall;
  - local RET and UTL output, jobs and disposable income rise;
  - the local share of PRV purchases rises.

**E8 Providential "efficiency".**

- Change: PRV jobs per unit −10%, with service quantities and quality unchanged.
- Expect, for real GVA per PRV job:
  - +11.1% under the indicator convention;
  - about +0.95% under the input convention.
- Variant: also set quality $q$ −10%.

## 16. Acceptance tests

**T1 Accounting identities, every period.**

- For each producer: revenue = bought-in inputs + royalty + wages + depreciation + net profit.
- GDP is the same measured by production, expenditure ($\sum C_r + G + I + X - M$, where M includes royalties) and income.
- Total domestic GVA = final demand − imports, the chain identity.
- Sector balances sum to zero: $\sum_r S_r$ + retained earnings + $GB$ + $RB$ = 0.
- Money stocks sum to zero.

**T2 Base year.**

- All prices are 1.
- The current account is 0, the government balance is 0, and unemployment is 5% in every place.
- The city in-commuting share is 15%.
- The stored $X$, $\theta$ and $s_C$ reproduce these.

**T3 Steady state.** With no scenario changes, periods 1–40 reproduce period 0.

**T4 Cupertino, with consumption frozen, $\rho_{IP} = 1$.** Let $R = 0.25 \times$ C.HQ revenue.

- All quantities, jobs and wages are unchanged.
- $\Delta V_C = \Delta \text{GDP} = -R$, and $\Delta V_M = \Delta V_R = 0$.
- $\Delta T^\pi = -0.25R$.
- Domestic owners' dividends change by $+0.35 \times 0.25R = +0.0875R$.
- $\Delta \text{GNI} = -0.1625R$.
- $\Delta RB = +0.1625R$.
- $\Delta GB = -0.25R + 0.0875\,\theta R$.

**T5 Squeeze, with consumption frozen.** Prices and GVA-per-unit changes exactly as listed in E2.

**T6 Austerity.** The directions of change listed in E3. Record the sign of the change in GVA per job by place.

**T7 Takeover, with consumption frozen.**

- GVA is unchanged everywhere.
- The change in town disposable income = $(1-\theta) \times$ the change in town dividends.
- The change in GNI = −(the rise in dividends paid to overseas owners).

**T8 Minimal test economy, for checking the solver.**

- **Set-up.** One place, two producers:
  - F (farm): no bought-in inputs; wage share 0.5, profit share 0.5, markup 1.
  - S (shop): buys 0.5 of F per unit; wage share 0.3, profit share 0.2, markup 0.25.
  - Households own everything.
  - The government buys $G = 20$ of S and taxes all income at $\theta = 0.2$.
  - No profit tax, no rest of the world.
  - Consumption $C = YD$ in the base year; $\alpha_1 = 0.6$ and $\alpha_2 = 0.4$ afterwards.
- **Base year.** Expect:
  - S = 100, F = 50;
  - wages 55, profits 45, taxes 20, YD = 80;
  - $M^h_0 = 80$.
- **After G rises to 25 at t = 1.** Expect:
  - $S_1 = 109.6154$, $F_1 = 54.8077$, $YD_1 = 87.6923$, $C_1 = 84.6154$, $M^h_1 = 83.0769$;
  - in the long run S → 125, YD → 100, $M^h$ → 100.

**T9 Price solve.**

- In the minimal economy, double F's wage per job.
- Expect $p_F = 2.0$ and $p_S = 1.625$.

## 17. Build order

1. Parameter set as a single configuration holding all the defaults above, and a scenario format.
2. Price solve; then T9 and the "all base prices = 1" check.
3. Quantity and income solve on the minimal economy (T8).
4. Full model, period 0: base-year calibration (T2) and the identities (T1).
5. Running over time, and the steady-state check (T3).
6. Experiments E1–E8 with tests T4–T7.
7. Lenses and the single-producer view.
8. Browser views. These need a short design pass with the user first. Likely candidates:
   - a map of the four places with switchable lenses;
   - the value-capture chart per product;
   - the rectangle and isoGVA view for any producer;
   - time series for scenarios;
   - a toggle between the "streetlight" (official) view and the true flows.

At each stage, record the results and any departures from this spec in the build worklog.

## 18. Room for later

- **Unpaid household production.** A household production account by place: hours times a shadow wage, outside GDP. Unpaid work was valued at £1.7 trillion in 2023 (`data-streetlight-effect.md`).
- **Physical flows.** Physical units for W.GEN energy and materials, and emission factors, using environmentally extended input–output tables (`flows-and-value-added.md`).
- **More household types** per place, by tenure and skill, so residual income and wealth can be separated for renters, mortgagors and outright owners.
- **Behaviour.** Replace fixed shares with rules from `agent-based-firm-demand-models.md` and `firm-pricing-and-firm-demand.md`: demand allocation by relative price, markups responding to demand, hiring and firing speeds.
- **Price-responsive exports and imports.**
- **Net investment, capital stocks and choice of technique.**
- **Productivity dynamics:** Kaldor–Verdoorn, or wage-induced productivity growth (`demand-led-productivity-dynamics.md`).
- **More places** and a fuller sector list.
- **Calibration to UK data:** ONS input–output tables, regional accounts, the new trade-between-regions estimates, and ownership statistics.

## Related notes and sources

- Design and decisions: `interrogating-the-2d-model.md`, `worklog.md`.
- Accounting and flows: `flows-and-value-added.md`.
- Booking and value capture: `where-gva-is-recorded.md`.
- Streetlight lenses: `data-streetlight-effect.md`.
- Incomes and wealth: `productivity-incomes-and-wealth.md`.
- Foundational economy and local multipliers: `foundational-economy-and-sector-linkages.md`.
- Pricing rules: `firm-pricing-and-firm-demand.md`.
- Dynamics: `demand-led-productivity-dynamics.md`.
- Model templates (Godley–Lavoie SIM, K+S and others): `agent-based-firm-demand-models.md`.
- Measurement and deflation: `measuring-gva-and-productivity.md`.
- The single-producer view: `webber-huaccha-2024-rethinking-productivity.md`.

All parameter values in this spec are stylised choices by the author of these notes, guided by the orientation figures in the notes above. They are not estimates.
