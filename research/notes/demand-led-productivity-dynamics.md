# Demand-led productivity dynamics: how demand feeds back on output per worker over time

Webber & Huaccha's identity, GVA = (S − C) × Q, is static. Their claims about austerity, immigration, wages and the post-2008 slowdown are about change over time, so a model needs dynamic links:

- demand to output (the multiplier);
- output to employment (labour hoarding);
- output growth to productivity growth (Kaldor–Verdoorn);
- distribution to demand (wage-led or profit-led);
- temporary shocks to permanent losses (hysteresis).

This note collects those links and their published sizes. The figures are for orientation, not calibration.

## 1. Short run: output is set by demand

**Basic multiplier.** Hein's (2015) textbook statement of Keynes's principle of effective demand has a constant marginal propensity to consume $c$ (between 0 and 1) and exogenous investment $I$. Equilibrium income is $Y^* = I/(1-c)$. Any other autonomous spending (government, exports, income-independent consumption) enters the same way.

**Kaleckian short-run model with distribution** (Hein 2015, eqs 15–23):

- **Prices:** a markup on unit labour cost, $p = [1+m]\,w/y$. The profit share is $h = m/(1+m)$.
- **Investment:** $I = I_a + \beta Y - \theta\,iB$. Here $I_a$ is "animal spirits", $\beta$ is an accelerator on sales, and $\theta$ captures how interest payments on debt $B$ at rate $i$ squeeze firms' own funds.
- **Saving:** $S = hY - (1-s_R)\,iB$, where $s_R$ is rentiers' propensity to save. Workers spend all their wages.
- **Equilibrium:**

$$Y^* = \frac{I_a + (1 - s_R - \theta)\,iB}{h - \beta}$$

  This is stable if $h > \beta$.
- **"Paradox of costs":** $\partial Y^*/\partial h = -Y^*/(h-\beta) < 0$. A higher profit share lowers equilibrium income, investment and profits.
- **Relevance.** This is the formal version of the paper's claim that wage cuts and austerity reduce Q, and so GVA (PDF pp. 4, 20–21).

**Long run** (Hein 2015, eqs 24–29). The profit rate is $r = h\,u/v$, where $u$ is capacity utilisation and $v$ the capital–potential output ratio. Accumulation is $g = g(\alpha, h, u, v)$, rising with animal spirits, the profit share and utilisation. In Kaleckian–Steindlian models, utilisation adjusts in the long run too, so demand also determines long-run growth.

## 2. Labour hoarding and procyclical productivity

**The mechanism.** When demand falls, firms keep workers they expect to need again (labour hoarding), so output per worker falls with output. The paper lists this as one explanation of the slowdown (Martin & Rowthorn 2012, PDF p. 19).

**The UK after 2008** (Bank of England Quarterly Bulletin, Barnett et al. 2014):

- **The shortfall.** In 2013 Q4 output per hour was about 16% below a continuation of its pre-crisis trend.
- **What explains it:**
  - about 4 percentage points may be measurement, leaving about 12 points to explain;
  - cyclical, demand-related spare capacity within firms: "uncertain, but little evidence" from business surveys and employment by then;
  - more persistent factors (lower investment in physical and intangible capital, impaired reallocation of resources, unusually high firm survival): about 6–9 points;
  - total explained: about 6–9 points.
- **Context.** The fall in productivity in this recession was larger than in any other post-war recession. Six years on, productivity was still about 4% below its pre-crisis peak, while output had broadly recovered.

**A caution** (mine). The Bank's "persistent" factors, such as weak investment, can themselves be caused by weak demand (see hysteresis below). So this split doesn't settle demand against supply. The paper would read much of it as demand.

## 3. Kaldor–Verdoorn: output growth raises productivity growth

**The relation.** Labour productivity growth $\hat{\lambda}$ rises with output growth $\hat{Q}$:

$$\hat{\lambda} = a + b\,\hat{Q}$$

This reflects increasing returns, learning by doing and induced investment.

**The size of the coefficient $b$:**

- **Classic values:** about 0.45 (Verdoorn 1949) and about 0.5 (Kaldor 1966).
- **Manufacturing studies:** often 0.5–0.7 (as summarised in Deleidi et al. 2023).
- **McCombie & Magacho (2017, JPKE):** manufacturing in 70 countries, 1963–2009. If output growth is treated as demand-driven, faster output growth raises productivity growth. If it is driven by the supply of factors, that conclusion doesn't follow.
- **Deleidi, Fontanari & Gahn (2023):** panel structural vector autoregressions (SVAR) on a global dataset.
  - Responses to output shocks give elasticities of about 1.0 (all countries 1.02, developed 1.00, developing 0.95).
  - Autonomous-demand shocks give 0.32–0.44.
  - Government spending raises productivity more than exports do.
- **The disagreement:** the main dispute is the direction of causality.
- **For the model:** a range of about 0.3–1.0, with 0.5 as the conventional central value.

**Relevance.** This is the most direct channel from the paper's Q to physical productivity, the Q/L part of GVA per worker. The paper doesn't mention it.

## 4. Wage-led or profit-led demand

**The framework.** Bhaduri–Marglin: a higher profit share lowers consumption, because wage earners spend more of their income. It may raise investment and net exports. Demand is "wage-led" if the net effect of a higher profit share is negative.

**Estimates for the G20** (Onaran & Galanis 2013/2014):

- **Private domestic demand** is wage-led in every country, because consumption responds more strongly than investment.
- **Wage-led overall:** the UK, US, Japan, euro area, Germany, France, Italy, Turkey and Korea.
- **Profit-led:** Canada, Australia, Argentina, Mexico, China, India and South Africa. Several of these still contract if all countries cut wages together.
- **The world as a whole** is wage-led. A coordinated rise in wage shares raises global GDP by 3.05% in their scenario.

**The disagreement** (Blecker 2016):

- Aggregative approaches (systems or VAR estimation) tend to find profit-led demand; structural single-equation approaches tend to find wage-led demand.
- His reconciliation: demand is more profit-led in the short run and more wage-led in the long run.
- So the UK "wage-led" result is method-dependent.

**Relevance.** This underpins the paper's wage claims (PDF p. 21): a rising labour share raises Q through consumption.

## 5. Wages raising productivity: Storm & Naastepad's productivity regime

- **The equation:**

$$\hat{\lambda} = \beta_0 + \beta_1\,\hat{x} + \beta_2\,\hat{w}$$

  Productivity growth depends on output growth $\hat{x}$ (Kaldor–Verdoorn) and real wage growth $\hat{w}$ (labour-saving innovation induced by dearer labour).
- **Parameter values.** They take both coefficients as about 0.4, as "stylised facts" from econometric studies (as reported by J.W. Mason, who doubts they have "made a decisive case"). Confidence: low to medium.
- **Implication.** Wage restraint can slow productivity growth. Naastepad (2006) applies this to the Dutch productivity slowdown.
- **Relevance.** This is a second wage channel, alongside the demand channel. It acts on physical output per worker rather than on Q.

## 6. Hysteresis: temporary demand shocks, permanent losses

- **Cerra, Fatás & Saxena (2023, JEL):**
  - GDP levels depend on the history of shocks.
  - After the 2008 crisis, GDP in advanced economies stayed far below pre-crisis trends for over a decade.
  - Policy should act harder in recessions to avoid scarring, and a "high-pressure economy" may have permanent benefits.
- **Blanchard, Cerutti & Summers (2015):** of 122 recessions in 23 countries over 50 years, "a high proportion" were followed by lower output, or even lower growth, than the pre-recession trend.
- **Fatás & Summers (2018):** the fiscal consolidations of 2010–11 had large, persistent negative effects on GDP. They were very likely self-defeating, raising debt-to-GDP ratios.
- **Relevance.** This is the strongest support for the paper's austerity claim (PDF pp. 4, 21, 23). It also links a demand shock to the "persistent" supply-side factors in section 2.
- **Confidence.** These are prominent papers, but the size of hysteresis effects is debated.

## 7. Steindl and stagnation

- **The argument as the paper presents it** (footnote 19, PDF pp. 24–25):
  - in mature oligopolies, price competition is avoided;
  - excess capacity dampens investment;
  - sunk costs and market power make firms risk-averse rather than price-aggressive;
  - debt makes them hesitant to borrow;
  - together these produce slow growth and stagnation.
- **In model terms:**
  - investment depends on capacity utilisation and the profit rate (section 1);
  - rising markups that leave capacity idle lower investment;
  - slower investment means slower embodied technical progress, and so slower growth in physical productivity.
- **The paper's link.** The paper ties this to high profits letting oligopolies cut investment (PDF p. 20).

## 8. UK productivity numbers for orientation

- **The paper's figures** (PDF p. 19) match ONS's *International comparisons of productivity, first estimates: 2015* (published 6 October 2016). In 2015, output per hour was below a continuation of its 1997–2007 trend by:
  - UK about 18 points;
  - France 14, US 9, Germany 8, Japan 8, Italy 6, Canada 4;
  - rest-of-G7 average about 9.
- **The final estimates for 2015** revised the UK gap to 15.2%, against a rest-of-G7 average of 7.5%. The paper's numbers are the first estimates.
- **ONS on 2017 Q1:** UK output per hour would be about 20% higher had the pre-downturn trend continued.
- **Longer run** (Scottish Government, *Labour Productivity Statistics 2024*): UK labour productivity growth averaged 1.8% a year in 1998–2008 and 0.4% a year in 2008–2024.
- **Caution.** UK productivity figures are revised often, including revisions to labour input. Check the latest ONS release before quoting any of these.

## 9. A minimal dynamic skeleton (my synthesis for the next stage)

This is one way the pieces could fit around the paper's identity. It is a starting point to interrogate, not a recommendation.

1. **Aggregate demand.** Spending $Y$ comes from wages (spent at a high rate), profits (spent at a low rate), government spending $G$ and exports. Austerity lowers $G$; a lower wage share lowers consumption; immigration and population raise the number of spenders.
2. **Firm demand.** Firm $i$'s quantity is its share of spending divided by its price, $Q_i = s_i\,Y / S_i$. The share $s_i$ follows one of the rules in the firm-pricing note: logit, replicator or customer network.
3. **Employment.** Workers adjust toward $Q_i / q_i$ with separate hiring and firing speeds. Slow firing is labour hoarding, so measured $Q/L$ falls in downturns.
4. **Physical productivity.** $q_i$ grows with output growth (Kaldor–Verdoorn, coefficient about 0.3–1.0). It may also grow with wage growth (Storm–Naastepad, about 0.4) and with investment (Steindl).
5. **Prices and margins.** $S_i$ and the margin $m_i = S_i - C_i$ follow the pricing rules in the firm-pricing note.
6. **Measurement.** Measured GVA per worker is $m_i \times Q_i/L_i$. A deflation layer converts it to "real" terms as official statistics would (see the measurement note).
7. **Feedback.** Wages $wL$ and profits feed back into $Y$ in step 1.

## Sources

- Webber, D.J. & Huaccha, G. (2024), *Journal of Post Keynesian Economics* 47(1). `sources/Rethinking productivity the crucial role of demand.pdf`, PDF pp. 4, 19–21, 23–25.
- Hein, E. (2015) "The principle of effective demand – Marx, Kalecki, Keynes and beyond", IPE Berlin Working Paper 60/2015, pp. 11–18: https://www.ipe-berlin.org/fileadmin/institut-ipe/Dokumente/Working_Papers/ipe_working_paper_60.pdf
- Barnett, A., Batten, S., Chiu, A., Franklin, J. & Sebastiá-Barriel, M. (2014) "The UK productivity puzzle", *Bank of England Quarterly Bulletin* 2014 Q2, summary table and Charts 1–2: https://www.bankofengland.co.uk/quarterly-bulletin/2014/q2/the-uk-productivity-puzzle
- McCombie, J. & Magacho, G. (2017) "Verdoorn's law and productivity dynamics: An empirical investigation into the demand and supply approaches", *JPKE* 40(4): https://ideas.repec.org/a/mes/postke/v40y2017i4p600-621.html
- Deleidi, M., Fontanari, C. & Gahn, S.J. (2023) "Autonomous demand and technical change: exploring the Kaldor–Verdoorn law on a global level", *Economia Politica*: https://pmc.ncbi.nlm.nih.gov/articles/PMC9845832/
- Onaran, Ö. & Galanis, G. (2013) "Income distribution and aggregate demand: A global Post-Keynesian model", PKSG Policy Note: https://postkeynesian.net/media/policy-notes/PN1304.pdf. Full paper: https://research.gold.ac.uk/id/eprint/30859
- Blecker, R. (2016) "Wage-led versus profit-led demand regimes: the long and the short of it", *Review of Keynesian Economics* 4(4): https://ideas.repec.org/a/elg/rokejn/v4y2016i4p373-390.html
- Storm & Naastepad's productivity regime, as reported by J.W. Mason, "Reading Notes: Demand and Productivity": https://jwmason.org/?p=2236
- Naastepad, C.W.M. (2006) "Technology, demand and distribution: a cumulative growth model with an application to the Dutch productivity growth slowdown", *Cambridge Journal of Economics* 30(3): https://ideas.repec.org/a/oup/cambje/v30y2006i3p403-434.html
- Cerra, V., Fatás, A. & Saxena, S. (2023) "Hysteresis and Business Cycles", *JEL* 61(1): https://www.aeaweb.org/doi/10.1257/jel.20211584
- Blanchard, O., Cerutti, E. & Summers, L. (2015) "Inflation and Activity – Two Explorations and Their Monetary Policy Implications", NBER Working Paper 21726: https://www.nber.org/papers/w21726
- Fatás, A. & Summers, L. (2018) "The permanent effects of fiscal consolidations", *Journal of International Economics* 112: https://repec.cepr.org/repec/cpr/ceprdp/DP13149.pdf
- ONS (2016) *International comparisons of UK productivity (ICP), first estimates: 2015*: https://www.ons.gov.uk/economy/economicoutputandproductivity/productivitymeasures/bulletins/internationalcomparisonsofproductivityfirstestimates/2015
- ONS (2017) *International comparisons of UK productivity (ICP), final estimates: 2015*: https://www.ons.gov.uk/economy/economicoutputandproductivity/productivitymeasures/bulletins/internationalcomparisonsofproductivityfinalestimates/2015
- ONS (2017) *UK productivity introduction: January to March 2017*: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/labourproductivity/articles/ukproductivityintroduction/jantomar2017
- Scottish Government (2024) *Labour Productivity Statistics 2024: longer term trends*: https://www.gov.scot/publications/labour-productivity-statistics-2024/pages/longer-term-trends/
