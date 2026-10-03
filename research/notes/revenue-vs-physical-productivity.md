# Revenue productivity vs physical productivity: mainstream evidence that measured productivity contains prices and demand

Webber & Huaccha (2024) argue that GVA-based productivity mixes price, cost and quantity, and so contains demand. Industrial-organisation economics has a closely parallel literature that separates revenue-based productivity (TFPR) from physical, quantity-based productivity (TFPQ). The paper doesn't cite it, but it is the strongest quantitative evidence for the paper's central point.

This literature still estimates production functions and total factor productivity (TFP), which the paper rejects on capital-theory grounds (see section 8). Its findings about prices and demand don't depend on TFP being meaningful, but its numbers are expressed in TFP terms. Published figures are for orientation, not calibration.

## 1. The basic decomposition

- **The standard practice.** Output is measured as firm revenue divided by an industry-wide price index.
- **What that measures.** Measured productivity is then the firm's price relative to the industry index multiplied by its physical productivity. In logs: tfpr = p + tfpq.
- **The parallel with the paper** (my comparison). The paper's identity gives GVA per worker = margin per unit × physical output per worker. In both cases, a measured productivity figure is a price-type term times a physical-efficiency term.
- **The data problem is the same.** Most firm datasets have revenue but not price, so the two terms can't be separated (paper PDF p. 22).

## 2. Klette & Griliches (1996): the omitted-price problem

- **The mechanism.** Firms in imperfectly competitive markets charge different prices. Deflating each firm's sales by a common industry deflator leaves an omitted variable: the firm's price relative to the industry index.
- **The consequence.** This biases estimated returns to scale downward, under a variety of assumptions about technology, demand and cost shocks. The same holds for estimates from cost functions.
- **Data.** Norwegian manufacturing plants.

## 3. Foster, Haltiwanger & Syverson: revenue vs physical productivity in homogeneous goods

**The data.** US Census of Manufactures plants making eleven physically homogeneous products: boxes, bread, carbon black, coffee, ready-mixed concrete, hardwood flooring, gasoline, block ice, processed ice, plywood and sugar. Because both price and quantity are observed, TFPR and TFPQ can be separated.

**Correlations and spreads** (NBER working paper 2005, Table 1, controlling for product–year effects; the published 2008 *AER* version may differ slightly):

| | TFPQ | TFPR | Price |
|---|---|---|---|
| Correlation with price | −0.54 | +0.16 | 1 |
| Correlation with TFPQ | 1 | 0.75 | −0.54 |
| Standard deviation (logs) | 0.26 | 0.22 | 0.18 |

**Findings.**

- **Efficient plants charge less.** Physically more productive plants charge lower prices, so revenue productivity understates their advantage.
- **New producers charge less too.** So revenue-based measures understate new producers' productivity and entry's contribution to aggregate productivity growth.
- **Earlier work mixed up two effects.** Earlier studies linking revenue productivity to survival confused two separate, opposing influences: technical efficiency and demand.

**The 2016 follow-up** (*Economica*). New plants are small and grow slowly because of demand, not technology.

- At the same price, entrants sell only 41% of the output of plants over 15 years old, even though their physical productivity is about 2% higher.
- The spread of plant-level demand (standard deviation of logs 1.47) is about five times the spread of physical productivity (0.28).
- Demand builds up mainly through past sales, building a customer base.
- Parameter values are in the firm-pricing note.

## 4. Hsieh & Klenow (2009): spread in revenue productivity as a sign of distortions

- **The model's logic.** With constant-elasticity demand and no distortions, revenue productivity would be equal across plants within an industry. More physically productive plants grow and cut their prices until revenue productivity equalises.
- **Their interpretation.** Measured dispersion in revenue productivity therefore signals distortions.
- **The headline numbers.** Reallocating capital and labour in China and India so that marginal products are as equal as in the US would raise manufacturing TFP by 30–50% in China and 40–60% in India. Syverson (2011) reports that they find 90th-to-10th percentile TFP ratios above 5:1 in those countries.
- **A contrasting reading** (mine). Hsieh & Klenow treat revenue-productivity dispersion as distortion because they assume equal markups across firms. In the paper's framing, the same dispersion could come from differences in market power and demand. The two readings imply different policies, which is the paper's point about policy advice.

## 5. How big and how persistent productivity differences are

- **The spread** (Syverson 2004, 2011). Within 4-digit US manufacturing industries, the average gap in log TFP between the 90th and 10th percentile plant is 0.651, a ratio of 1.92. Its standard deviation across industries is 0.173.
- **Physical measures spread more.** Productivity measured in physical quantities is more dispersed than revenue-based measures, because efficient producers sell at lower prices.
- **Persistence.** Regressing a producer's productivity on its own value a year earlier gives coefficients of about 0.6–0.8.
- **Demand density** (Syverson 2004, cited by the paper, PDF p. 16). In ready-mixed concrete, denser local markets have higher and less dispersed productivity, because more competition weeds out weak producers. The paper reads this as demand density mattering.

## 6. Demand vs cost in firm size and growth

- **Hottman, Redding & Weinstein (2016).** Using US barcode data on prices and sales, differences in firm "appeal" and product range explain at least four fifths of the variation in firm sales. Standard productivity measures understate large firms' productivity.
- **Pozzi & Schivardi (2016).** Using Italian data with firm-level prices, demand shocks and TFP shocks are equally important for growth. Growth responds only partially to either, and less to TFP shocks.

## 7. Markups: level, trend and how they are measured

**The production approach.** De Loecker & Warzynski (2012), used by De Loecker, Eeckhout & Unger (2020), estimate a firm's markup over marginal cost as

markup = (output elasticity of a variable input) ÷ (that input's cost as a share of revenue).

- I've given this formula from my own knowledge of the method; check the original paper before relying on its exact form.
- **The link to the paper** (my observation). If the variable input is bought-in materials, its revenue share is $CQ/SQ = C/S$. The production-approach markup is then the output elasticity of materials × S/C. The paper's isoGVA axis, S/C, is therefore one ingredient of standard markup estimates.

**US level and trend** (De Loecker, Eeckhout & Unger 2020).

- The aggregate, sales-weighted markup rose from 21% above marginal cost in 1980 to 61% by the mid-2010s.
- The rise is driven by the upper tail; the median markup is unchanged.

**UK level and trend.**

- Aquilante et al. (2019, Bank of England Staff Working Paper 798) find UK firm-level markups have risen, broadly across sectors, with the rise concentrated in the upper tail.
- The CMA's *State of UK Competition* report (2024) finds:
  - average markups in Great Britain rose about 10% since 1997, at the lower end of a 9–40% range across methods;
  - they peaked in the mid-2010s, fell before Covid and rose again during Covid;
  - the rise was up to three times larger at the top of the distribution;
  - high-markup firms are older, bigger and more profitable;
  - concentration was roughly stable, with the average Herfindahl index (HHI) going from about 1,100 (1997) to 1,300 and back to just over 1,100 (2022);
  - the UK rise is smaller than in the US.

**Caveats.**

- The CMA notes that production-function estimation is still contested and that its outlier exclusions probably miss the largest digital firms.
- The accounting-identity critique (next section) applies directly to these estimates.

**Relevance to the paper's slowdown question.** The paper asks whether slow productivity growth reflects rising market power (PDF p. 20). The UK evidence suggests a modest rise in average markups since 1997, concentrated in a minority of firms.

## 8. The accounting-identity critique (Felipe & McCombie)

- **The argument.**
  - Value added is, by definition, the wage bill plus operating surplus.
  - So production functions estimated on value data can always be made to fit, and their coefficients can't be read as technology.
  - Felipe & McCombie say this holds at any level of aggregation that uses value data, including 4-digit industries.
  - There is no such problem with genuinely physical data, such as identical widgets or yield per acre.
- **The dissent.** Temple (2006, 2010) disputes the scope, calling it "the part-time tyranny of the identity". Felipe & McCombie (2012) reply that it works "full time". This is a live disagreement.
- **Fit with the paper.** It is close to the paper's capital-controversy argument against TFP. Webber & Tiwasing (2025) cite Felipe & McCombie's (2013) "not even wrong" verdict.
- **Consequence for the model.** Any "productivity" the model reports from value data inherits the problem. The model can show this directly by generating firms with known physical efficiency and comparing them with what value-based measures would say.

## 9. What this gives the model

- **Evidence that demand and prices matter to measured productivity**, from a mainstream source:
  - the spread in demand across plants is about five times the spread in physical efficiency;
  - price and physical productivity are negatively correlated (about −0.5);
  - appeal outweighs cost in explaining firm size.
- **A showcase idea.** Give simulated firms separate draws of physical efficiency and demand. Let efficient firms cut prices. Then show the gap between "true" efficiency and what a statistician deflating revenue with an industry price index would record. This is the paper's argument made visible, and it rests on established empirical findings.
- **Orientation values:**
  - 90–10 productivity ratio about 2 within US industries, above 5 in China and India;
  - productivity persistence 0.6–0.8 a year;
  - US markups up from 1.2 to about 1.6 since 1980; UK average up about 10% since 1997.
- **A reminder for the next stage.** The TFP-based literature and the paper share the diagnosis but not the framework. A model built on the paper's identity can use these findings as targets for patterns without adopting production functions.

## Sources

- Webber, D.J. & Huaccha, G. (2024), *Journal of Post Keynesian Economics* 47(1). `sources/Rethinking productivity the crucial role of demand.pdf`, PDF pp. 16, 20, 22.
- Klette, T.J. & Griliches, Z. (1996) "The Inconsistency of Common Scale Estimators When Output Prices Are Unobserved and Endogenous", *Journal of Applied Econometrics* 11(4): https://ideas.repec.org/a/jae/japmet/v11y1996i4p343-61.html and https://nber.org/papers/w4026
- Foster, L., Haltiwanger, J. & Syverson, C. (2005) "Reallocation, Firm Turnover, and Efficiency: Selection on Productivity or Profitability?", NBER Working Paper 11555, abstract and Tables 1–2: https://www.nber.org/papers/w11555.pdf. Published in *AER* 98 (2008): https://econ.umd.edu/publication/reallocation-firm-turnover-and-efficiency-selection-productivity-or-profitability
- Foster, L., Haltiwanger, J. & Syverson, C. (2016) "The Slow Growth of New Plants: Learning about Demand?", *Economica* 83: https://www.econ.umd.edu/sites/www.econ.umd.edu/files/pubs/Economica_FHS_January_2016.pdf
- Hsieh, C.-T. & Klenow, P. (2009) "Misallocation and Manufacturing TFP in China and India", *QJE* 124(4): https://www.nber.org/papers/w13290
- Syverson, C. (2011) "What Determines Productivity?", *JEL* 49(2), pp. 1–2 of the NBER version and footnote 2: https://www.nber.org/system/files/working_papers/w15712/w15712.pdf
- Hottman, C., Redding, S. & Weinstein, D. (2016) "Quantifying the Sources of Firm Heterogeneity", *QJE*: https://www.nber.org/papers/w20436
- Pozzi, A. & Schivardi, F. (2016) "Demand or productivity: what determines firm growth?", *RAND Journal of Economics* 47(3): https://repec.cepr.org/repec/cpr/ceprdp/DP9184.pdf
- De Loecker, J., Eeckhout, J. & Unger, G. (2020) "The Rise of Market Power and the Macroeconomic Implications", *QJE* 135(2): https://www.nber.org/papers/w23687
- Aquilante, T. et al. (2019) "Market power and monetary policy", Bank of England Staff Working Paper 798: https://www.bankofengland.co.uk/working-paper/2019/market-power-and-monetary-policy
- Competition and Markets Authority (2024) *The State of UK Competition Report 2024*: https://www.gov.uk/government/publications/the-state-of-uk-competition-report-2024/the-state-of-uk-competition-report-2024
- Felipe, J. & McCombie, J. (2012) "Aggregate Production Functions and the Accounting Identity Critique: Further Reflections on Temple's Criticisms and Misunderstandings", Levy Institute Working Paper 718: https://levyinstitute.org/pubs/wp_718.pdf
- Webber, D.J. & Tiwasing, P. (2025), accepted manuscript p. 2: https://eprints.whiterose.ac.uk/id/eprint/232807
