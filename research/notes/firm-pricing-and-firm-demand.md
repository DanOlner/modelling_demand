# Firm pricing and firm demand: how S and Q get set

This note collects ways to model how a firm sets its sale price S and what determines how much it sells, Q. Webber & Huaccha (2024) argue that both carry demand into GVA, but they give no behavioural rules; see `webber-huaccha-2024-rethinking-productivity.md`.

The sources are Post Keynesian pricing theory and empirical work on price-setting and firm-level demand. Published figures are for orientation, not calibration.

## 1. Kalecki's pricing: the paper's own reference point

**The firm-level rule.** Kalecki (1954, *Theory of Economic Dynamics*, ch. 1) writes the firm's price as

$$p = m\,u + n\,\bar{p}$$

- $u$ is unit prime cost: wages plus materials per unit.
- $\bar{p}$ is the output-weighted average price of the industry, including the firm itself.
- $m$ and $n$ are positive coefficients reflecting the "degree of monopoly" of the firm's position.
- Averaging across firms gives the industry price $\bar{p} = \frac{\bar{m}}{1-\bar{n}}\,\bar{u}$, which requires $\bar{n} < 1$.
- Confidence is medium-high. This is the standard textbook statement and it matches across secondary sources, but I could not open Kalecki's text itself.

**This is the mechanism the paper cites.** The paper's appeal to Kalecki (1938/40) is exactly this (paper PDF p. 15):

- a firm's price depends on its demand elasticity, which depends on its price relative to the industry price;
- so firm prices move with industry prices, which is the $n\bar{p}$ term.

**What sets the degree of monopoly.** In Hein's summary of Kalecki:

- market concentration;
- how much firms compete on price rather than through sales promotion;
- overhead costs;
- trade union bargaining power.

**Distribution.** Let $k$ be the ratio of proceeds to prime costs and $j$ the ratio of material costs to the wage bill. The wage share of value added is then

$$\omega = \frac{1}{1 + (k-1)(j+1)}$$

- So at an unchanged markup, a rise in material prices relative to wages lowers the wage share (heteconomist summary of Kalecki).

**Simplest macro version.** Hein (2015) writes the price as a markup on unit labour cost, $p = [1+m]\,w/y$, where $y$ is output per worker. The profit share is then $h = m/(1+m)$.

## 2. What Kaleckian pricing does to the paper's identity (my derivation)

**Setting it up.**

- In the paper, C is bought-in (intermediate) cost per unit and wages sit inside GVA.
- Kalecki's markup is on prime cost, $C + w/q$, where $q = Q/L$ is physical output per worker.
- With a proportional markup, $S = k\,(C + w/q)$, where $k$ is one plus the markup.
- The paper's margin per unit (value added per unit) is then

$$m = S - C = (k-1)\,C + k\,\frac{w}{q}$$

**Consequences for the model.**

- **A buyer squeezing its supplier can lower its own GVA.**
  - Under proportional markup pricing, a fall in C cuts S by $k$ times as much, which is more than 100% pass-through. The margin falls, because $dm/dC = k - 1 > 0$.
  - The paper's supermarket example (C down $0.10, S down $0.05) needs pass-through of under 100%.
  - So the sign of the paper's market-power effect depends on the pricing rule. The model should treat that rule as a switch.
- **Wage rises raise S and the margin.** Wages feed straight into price through the $k\,w/q$ term. This fits the paper's statement that higher wages must come with higher S or higher Q (PDF p. 21).
- **Dearer inputs raise measured GVA.** Under proportional markups, higher input prices raise the margin by $(k-1)$ times the cost rise, so nominal GVA rises with input costs. Under an absolute-margin rule ($S = C$ + a fixed amount) there is no such effect.
- **Pricing rules worth offering as model options:**
  1. proportional markup on prime cost;
  2. markup on unit labour cost only;
  3. fixed absolute margin;
  4. sticky price that changes only when triggered;
  5. Kalecki's relative-price rule, $S = m\,u + n\,\bar{S}$.

## 3. Post Keynesian pricing doctrines

**Lee's synthesis.** Lee (1998), which the paper cites, sets out three doctrines and builds an empirically grounded pricing model from about a hundred pricing studies:

- markup pricing (Kalecki);
- normal-cost or full-cost pricing (Andrews; Hall and Hitch);
- target-rate-of-return or administered pricing (Means).

**What the doctrines share.**

- Prices are set from costs plus a margin and held for a pricing period.
- Changes in quantities, not prices, carry the information about demand.
- Material and labour inputs are explicit parts of the markup, normal-cost and target-return procedures.

**Target-return pricing in words.** The markup is chosen so that, at a standard (normal) rate of capacity use, the firm earns its target return on capital. I have not checked a source for the exact formula, so I have left it out.

**Shapiro & Sawyer (2003).** The paper also cites this survey for its point that scale and the S–C gap drive GVA (PDF p. 18). I have not read it.

## 4. Evidence on how UK firms set prices

The main source is the Bank of England survey of 693 UK firms, run December 2007 to February 2008 (Greenslade & Parker 2010 working paper; 2012 *Economic Journal* version). It was carried out just before the recession. Many of its categories map directly onto the paper's mechanisms.

**How firms set prices** (shares rating each method "important" or "very important"):

| Method | Important + very important | Very important |
|---|---|---|
| Direct cost per unit plus a fixed percentage markup | 43.7% | 24.7% |
| Direct cost plus a markup that is not fixed | 58.0% | 32.9% |
| Competitors' prices | 68.2% | 32.6% |
| Set by the principal customer | 27.2% | 9.5% |
| Regulator | 5.9% | 2.6% |

- **Competition shifts the method.** Firms that rate competition as very important lean much more on competitors' prices. The mean importance score is 3.4, against 2.1 where competition is not important.
- **Price discrimination is common.** Only 22% charge the same price to all customers. 57% decide case by case and 22% vary price with quantity. Retail is the exception: 64.5% charge everyone the same.

**How often prices change.**

- The median firm changes its price once a year and reviews it twice a year.
- About a fifth change prices at least monthly and a third annually.
- Medians elsewhere: 1.4 changes a year in the US survey, 2 in the earlier UK survey (1995) and 4 in Canada.
- US interview study (Blinder et al. 1998): the median firm changes price about once a year, price changes lag shocks by 3–4 months, and roughly 80% change prices four times a year or fewer. This is a secondary summary; I did not read the book.
- US consumer-price microdata: about 29% of prices change each month, implying an average spell of about 3.4 months, and 45% of changes are cuts (Klenow & Kryvtsov, as cited by Caiani et al. 2016).
- So survey and microdata frequencies differ a lot, partly because microdata include sales and retail prices. A model needs to say which prices it means.

**What drives changes.**

- **Price rises are driven by costs.** Labour costs are very important for 39.0% of firms and fuel and raw materials for 42.9%.
- **Price falls are driven by demand and rivals.** An actual fall in demand is very important for 38.4% (important or very important for 67.5%). Price cuts by domestic rivals are very important for 31.1%.
- **Some firms never move one way.** 6% never raise prices and 26% never cut them.

**Margins and demand.**

- 78.4% say a rise in demand for their product lets them raise their margin.
- 68.0% say the same of a rise in domestic competitors' prices, and 23.4% of a rise in overseas competitors' prices.
- So in this survey margins rise with demand. That bears on the paper's remark that the S–C gap may vary over the business cycle (PDF p. 14).

**Speed of response** (share whose price stays unchanged after each shock):

- 12.3% after a significant rise in costs;
- 18.8% after a rise in demand;
- 23.1% after a fall in demand;
- 33.9% after a fall in costs.
- So prices are stickier downward, especially after cost falls. Nearly half of firms change price within a quarter of a cost rise or a fall in demand.

**Why prices stick** (share rating each reason important or very important, for not raising and for not cutting the price):

| Reason | Not raising | Not cutting | Paper's matching idea |
|---|---|---|---|
| Co-ordination failure: not wanting to move first | 58% | 34% | firms raise prices only once competitors do (Webber et al. 2018; paper PDF p. 15) |
| It would antagonise customers | 55% | 24% | not wanting to look greedy (PDF p. 15) |
| Explicit contracts | 46% | 33% | nominal contracts (PDF p. 21) |
| Implicit contracts | 37% | 28% | implicit contracts (Okun, Azariadis; PDF pp. 15, 21) |
| Variable costs don't change much | 31% | 24% | |
| Temporary shock | 31% | 27% | |
| Keeping price at a threshold | 24% | 14% | psychological price points such as $99.99 (PDF p. 16) |
| Menu costs | 10% | 8% | |

**The sources disagree on how margins move over the cycle.**

- In the Bank of England survey, margins rise with demand.
- Nekarda & Ramey (2020), on US data, find all markup measures are procyclical or acyclical.
- Standard New Keynesian models assume countercyclical markups. The Caiani et al. (2016) agent-based model produces countercyclical markups and cites Bils (1987) and Rotemberg & Woodford (1999) in support.
- So the cyclical behaviour of the S–C gap is an open question and is best treated as a model switch.

## 5. How much firms follow competitors' prices

- **The estimates.** Amiti, Itskhoki & Konings (2019), on Belgian manufacturers, find that a typical firm's price moves with an elasticity of about 0.4 to competitors' prices and about 0.6 to its own costs.
  - Small firms show no follow-the-competitor behaviour and pass through all cost changes.
  - Large firms respond to both with elasticities of about 0.5.
- **Mapping onto Kalecki** (my reading). In Kalecki's rule, $n \approx 0.4$ on average: near zero for small firms and about 0.5 for large ones. Own-cost pass-through is under one.
- **Incomplete pass-through matters for the paper's supermarket example**, as shown in section 2.

## 6. Firm-level demand: what it depends on and how to model it

The paper splits a firm's demand into aggregate demand and demand specific to the firm (PDF p. 15). The literature offers several ways to write the firm-specific part.

**a. Constant-elasticity demand with a customer stock** (Foster, Haltiwanger & Syverson 2016):

$$q_t = \theta_t\,\mathrm{Age}_t^{\phi}\,Z_t^{\gamma}\,p_t^{-\eta}, \qquad Z_t = (1-\delta)\,Z_{t-1} + (1-\delta)\,R_{t-1}$$

- $R$ is past sales revenue, so $Z$ is a demand stock built from past sales: "demand accumulation by doing".
- $\theta$ is an exogenous demand shock following an AR(1) process.
- Estimates on US plants in commodity-like industries (Census of Manufactures, five-year intervals):
  - price elasticity $\eta \approx 1.6$;
  - elasticity of future demand to the demand stock $\gamma \approx 0.92$;
  - depreciation of the demand stock $\delta \approx 0.65$ per five-year period, about 19% a year;
  - elasticity of demand to local competitors' prices about 0.30 (local products);
  - persistence of the exogenous shock about 0.06 per five years in this model (0.64 in the version without depreciation).
- In their example, a 10% price cut raises current quantity about 16% and revenue about 6%, and shifts next year's demand out by about 3%.
- Being in the market longer adds little once the demand stock is accounted for. Active accumulation dominates.

**b. Logit allocation of spending** ("intensity of choice", as in the Mark-0 agent-based model):

$$D_i = \frac{C_B}{p_i}\cdot\frac{e^{-\beta p_i/\bar{p}}}{\mathcal{Z}}$$

- $C_B$ is total consumer spending and $\mathcal{Z}$ normalises across firms.
- $\beta$ sets price sensitivity; Mark-0 explores values from 0 to 2.
- This is a direct version of Kalecki's relative-price idea, and it is cheap to compute for thousands of firms.

**c. Market shares that evolve with competitiveness** (the K+S model; see the agent-based models note):

$$f_{j,t} = f_{j,t-1}\left(1 + \chi\,\frac{E_{j,t} - \bar{E}_t}{\bar{E}_t}\right), \qquad E_{j,t} = -\omega_1 p_{j,t} - \omega_2 l_{j,t}$$

- Here $l$ is unfilled demand from the previous period.

**d. Customer search and switching** (Lengnick 2013; Caiani et al. 2016):

- Each customer is linked to a few firms.
- Customers occasionally compare a sampled firm's price and switch if it is cheaper by more than a threshold, or with a probability that rises with the price gap.
- This gives each firm its own customer base, which is close to the "territories" of Webber & Tiwasing (2025).

**How much of firm size is demand?**

- **Foster, Haltiwanger & Syverson (2016):**
  - Within a product and year, the spread (standard deviation) of log idiosyncratic demand is 1.47, against 0.28 for log physical productivity (TFPQ) and 0.22 for log prices. A plant one standard deviation higher in demand sells 4.3 times as much at the same price.
  - At the same price, entrants sell only 41% of the output of plants over 15 years old. Plants aged 5–9 sell 62% and plants aged 10–14 sell 68%.
  - Yet entrants' TFPQ is about 2% *higher*. New plants are small because of demand, not inefficiency.
- **Hottman, Redding & Weinstein (2016):** using US barcode data, differences in firm "appeal" and product range explain at least four fifths of the variation in firm sales. Cost differences explain less than a fifth.
- **Pozzi & Schivardi (2016):** using Italian firm-level prices, demand shocks and TFP shocks matter equally for firm growth. Firm growth responds only partially to either kind of shock, and less to TFP shocks.
- **Gourio & Rudanko (2014):** where customers are harder to find, firms spend more on selling. Measured profit rates and markups are then higher, sales and investment are less volatile, and responses to shocks are hump-shaped.

**Price elasticities, for orientation.** These are Foster, Haltiwanger & Syverson's instrumental-variable estimates by product (2005 working paper version):

| Product | Elasticity |
|---|---|
| Ready-mixed concrete | −5.93 |
| Coffee | −3.63 |
| Bread | −3.09 |
| Boxes | −3.02 |
| Sugar | −2.52 |
| Block ice | −2.05 |
| Hardwood flooring | −1.67 |
| Processed ice | −1.48 |
| Gasoline | −1.42 |
| Plywood | −1.21 |
| Carbon black | −0.52 |

- These come from homogeneous goods. Differentiated, branded or status goods (the paper's Firm A) may differ a lot.
- The paper itself warns that status pricing and price points make elasticities unreliable (PDF p. 16).

## 7. What this gives the model

- **A menu of pricing rules** (section 2), switchable. The choice decides the sign of some of the paper's effects. This is the clearest single lesson here.
- **A menu of ways to allocate demand across firms** (section 6), from a simple elasticity curve to logit shares, replicator shares, and customer networks with switching.
- **Orientation values:**
  - prices change about once a year (survey) or about monthly (consumer-price microdata);
  - cost pass-through about 0.6;
  - weight on competitors' prices about 0.4;
  - firm price elasticities roughly −0.5 to −6;
  - demand spread several times larger than physical productivity spread;
  - demand stock depreciation about 19% a year.
- **Asymmetries to build in:** prices are stickier downward than upward, and cost falls pass through less than cost rises.
- **An open choice:** whether margins rise or fall with demand. The evidence disagrees.

## Sources

- Webber, D.J. & Huaccha, G. (2024) "Rethinking productivity: the crucial role of demand", *Journal of Post Keynesian Economics* 47(1). `sources/Rethinking productivity the crucial role of demand.pdf`, PDF pp. 14–16, 18, 21.
- Kalecki's pricing equation, as summarised in secondary sources (Kalecki's text not consulted):
  - search summaries of Hein's Elgar companion chapter: https://e-elgar.com/assets/Companion-Pages/Hein-Distribution/cd458945cd/5._post-keynesian_distribution_and_growth_theories_ii_dg_after_keynes_final.pdf (fetch failed; used only for the list of degree-of-monopoly determinants);
  - "Kalecki's pricing theory": https://www.academia.edu/728209/Kaleckis_pricing_theory;
  - Review of Keynesian Economics (2013) "Degree of monopoly and class struggle": https://www.elgaronline.com/view/journals/roke/1-4/roke.2013.04.06.xml.
- Wage-share formula: "Wages, Materials, and the Markup", heteconomist: https://heteconomist.com/wages-materials-and-the-markup/
- Hein, E. (2015) "The principle of effective demand – Marx, Kalecki, Keynes and beyond", IPE Berlin Working Paper 60/2015, pp. 12–13: https://www.ipe-berlin.org/fileadmin/institut-ipe/Dokumente/Working_Papers/ipe_working_paper_60.pdf
- Lee, F.S. (1998) *Post Keynesian Price Theory* (summary only): https://hal-univ-paris13.archives-ouvertes.fr/hal-01343753 and https://ideas.repec.org/b/cup/cbooks/9780521030212.html
- Greenslade, J. & Parker, M. (2010) "New insights into price-setting behaviour in the United Kingdom", Bank of England Working Paper 395, Tables 6–8, 12–14, 18–19, Chart 6: https://www.bankofengland.co.uk/working-paper/2010/new-insights-into-price-setting-behaviour-in-the-uk. Published as *Economic Journal* 122 (2012): https://ideas.repec.org/a/ecj/econjl/v122y2012i558pf1-f15.html
- Blinder, A. et al. (1998) *Asking About Prices* (summary only): https://www.russellsage.org/node/13684
- Nekarda, C. & Ramey, V. (2020) "The Cyclical Behavior of the Price-Cost Markup", *JMCB*: https://www.nber.org/papers/w19099
- Amiti, M., Itskhoki, O. & Konings, J. (2019) "International Shocks, Variable Markups, and Domestic Prices", *Review of Economic Studies* 86(6): https://ideas.repec.org/a/oup/restud/v86y2019i6p2356-2402..html
- Foster, L., Haltiwanger, J. & Syverson, C. (2016) "The Slow Growth of New Plants: Learning about Demand?", *Economica* 83, pp. 91–129, Tables 1–3 and eqs (2)–(3): https://www.econ.umd.edu/sites/www.econ.umd.edu/files/pubs/Economica_FHS_January_2016.pdf
- Foster, L., Haltiwanger, J. & Syverson, C. (2005) NBER Working Paper 11555, Table 2 (published 2008, *AER*): https://www.nber.org/papers/w11555.pdf
- Hottman, C., Redding, S. & Weinstein, D. (2016) "Quantifying the Sources of Firm Heterogeneity", *QJE*: https://www.nber.org/papers/w20436
- Pozzi, A. & Schivardi, F. (2016) "Demand or productivity: what determines firm growth?", *RAND Journal of Economics* 47(3): https://repec.cepr.org/repec/cpr/ceprdp/DP9184.pdf
- Gourio, F. & Rudanko, L. (2014) "Customer Capital", *Review of Economic Studies* 81(3): https://ideas.repec.org/p/red/sed010/121.html
- Gualdi, S. et al. (2015) "Tipping points in macroeconomic agent-based models" (Mark-0 demand rule): https://ar5iv.arxiv.org/html/1307.5319
- Caiani, A. et al. (2016) "Agent based-stock flow consistent macroeconomics: Towards a benchmark model", *JEDC* 69, p. 393: https://business.columbia.edu/sites/default/files-efs/imce-uploads/Joseph_Stiglitz/Agent%20based-stock%20flow.pdf
- Webber, D.J. & Tiwasing, P. (2025): see the supply-chains note.
