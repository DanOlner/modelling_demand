# How GVA and productivity are measured, and what that means for the model

Webber & Huaccha (2024) work almost entirely in current prices. Official productivity statistics are in constant prices: GVA is deflated by price indices and then divided by jobs or hours. This note covers the official definitions, what firm data can and can't identify, and how deflation changes which of the paper's effects show up in official numbers. It is a light-touch overview; microdata access routes are not covered. Published figures are for orientation, not calibration.

## 1. GVA in the national accounts

- **Output side.** GVA = output − intermediate consumption, where intermediate consumption is the goods and services used up in production. GDP = GVA + taxes on products − subsidies on products. The paper (PDF p. 2) and Webber & Tiwasing (2025, footnote 1) say the same.
- **Income side** (standard national-accounts definition, System of National Accounts 2008; not checked against a fetched source this round):
  - GVA at basic prices = compensation of employees + gross operating surplus and mixed income + taxes less subsidies on production;
  - depreciation (consumption of fixed capital) sits inside gross operating surplus.
- **Comparison with the paper's figures.**
  - The paper's bands (net profit, labour, depreciation, "other"; Figures 2–3, PDF pp. 12–13) roughly match this split.
  - Taxes on production, such as business rates, are missing.
  - "Other" expenses such as utilities are placed *inside* GVA.
- **Where utilities belong.** In official firm statistics, purchases are "the value of all goods and services purchased during the year" (Annual Business Survey definitions). So purchased utilities are subtracted with other purchases and belong in C, not in GVA.
  - Confidence: medium-high. The definition is explicit about "all goods and services", though it doesn't list utilities.
  - Correcting this in the paper's yoghurt chain changes stage GVAs from 110/150/300 to 100/130/220.

## 2. Approximate GVA (aGVA) in the UK Annual Business Survey

**The ONS formula:**

aGVA = total turnover
+ movement in total stocks
+ work of a capital nature by own staff
+ insurance claims received
+ other subsidies received
+ business rates paid
+ vehicle excise duty paid
+ own-account software and databases
− total purchases
− Work Programme receipts
− total net taxes (for service industries, total taxes).

- **Turnover** is the value of sales of goods produced, goods bought and resold unprocessed, work done and industrial services, and non-industrial services.
- **It is approximate.** It doesn't fully follow national-accounts treatment of taxes, subsidies and income in kind.
- **Coverage.** It covers the non-financial business economy, about three quarters of the economy (paper footnote 12, PDF p. 24, citing Ayoubkhani 2014).

## 3. What standard firm data can and can't identify

| Quantity | In the paper's notation | From Annual Business Survey-type data? |
|---|---|---|
| Turnover | $SQ$ | Yes |
| Purchases of goods and services | $CQ$ (including "other") | Yes |
| GVA | $(S - C)Q$ | Yes (aGVA) |
| Value-added share of sales | $(S - C)/S$ | Yes: aGVA ÷ turnover |
| Price-to-cost ratio (the isoGVA axis) | $S/C$ | Yes: turnover ÷ purchases (approximately) |
| Labour share | $wL / GVA$ | Yes, using employment costs |
| Price, unit cost, quantity separately | $S$, $C$, $Q$ | No |

**Other data that add prices or quantities:**

- **Prodcom.** ONS's survey of manufacturers' sales by product gives value, volume and unit value (value per unit of volume) for each product heading, for mining, quarrying and manufacturing (SIC 2007 sections B and C). Unit values give S for manufactured products. UK manufacturers' product sales were £452.0bn in 2025.
- **Barcode (scanner) data.** These give prices and quantities for consumer goods. Hottman, Redding & Weinstein (2016) used Nielsen data.
- **Producer price index microdata** might give firm-level prices for sampled products. I haven't checked access or coverage.

**Implication for the model.** The paper says data on S, C and Q are missing (PDF p. 22). But standard data still give two of the three things needed: a firm's GVA and its S/C ratio. One unknown remains, which is where along its isoGVA curve the firm sits. Knowing Q, or any one price, settles it. A model can generate S, C and Q and then show only what a statistician would see.

## 4. Real versus nominal: double deflation

- **The method.** Since Blue Book 2021, ONS has used double deflation. Each industry's output is deflated by an output price index and its intermediate consumption by an input price index, and real GVA = deflated output − deflated intermediate consumption.
- **What it replaced.** Before this, intermediate consumption was implicitly deflated by output prices.
- **Input deflators.** Intermediate consumption uses weighted domestic output and import prices at a detailed product level.
- **Firm-level research** usually deflates each firm's revenue by an *industry* price index. So a firm's price relative to its industry stays inside its "real output" (Klette & Griliches 1996; see the revenue-vs-physical note).

## 5. Shrinkflation in UK price indices

- **The scale.** ONS (2017) found 2,529 products got smaller between 2012 and 2017, against 614 that got bigger, mostly in food and especially confectionery. A spike came in April 2014, with 87 size changes at once.
- **The adjustment.** CPIH treats a size cut at an unchanged price as a price rise. It recomputes the base price per unit of weight ("what the price … would have been in January, if the chocolate bar had then weighed 80 grams").
- **The impact.** Shrinkflation added about 0.03 percentage points to CPIH since 2012. Confectionery alone saw 1.22 percentage points, but it is about 1% of the basket.
- **Producer side.** I haven't checked whether producer price indices adjust for size the same way.

## 6. Which of the paper's effects survive deflation (my analysis)

The paper's effects come through three channels. Deflation treats them differently.

1. **Volume (Q).** Demand changes that alter the quantity sold, such as austerity, immigration or higher wages raising consumption, are volume effects. They show up fully in real GVA and real productivity. This channel is robust to the measurement critique.
2. **Price redistribution along a chain** (a buyer squeezing a supplier, collective price rises, status pricing):
   - If deflators captured each firm's own prices exactly, these would vanish from real GVA. Only prices change, not volumes.
   - With industry-level deflators, a firm's price relative to its industry stays in its measured real output. So the effects appear in firm-level and regional productivity statistics, and in industry aggregates to the extent the industry index misses them.
   - So these effects are real for firm-level and regional comparisons (the paper's rural–urban argument) and smaller for national real productivity.
3. **Shrinkflation and product changes.** In nominal firm GVA they raise the margin. Where price indices adjust for size, as CPIH does, they are recorded as price rises, so deflated output doesn't rise.

**The paper's position** (footnote 15, PDF p. 24). It calls inflation adjustment "a veil of sophistication" that misses industrial power struggles. That is a fair warning for firm and regional data deflated with national industry indices, and a weaker point for national aggregates.

**What the model needs.** A measurement layer offering three views of the same simulated economy:

- nominal GVA per worker;
- "real" GVA per worker using industry-wide deflators, as ONS-style statistics do;
- physical output per worker.

The gaps between the three views show which of the paper's claims depend on how productivity is measured.

## 7. Productivity statistics

UK productivity-gap numbers and long-run growth rates are in the demand-dynamics note, section 8. UK figures are revised often, so check the latest ONS release before quoting.

## Sources

- Webber, D.J. & Huaccha, G. (2024), *Journal of Post Keynesian Economics* 47(1). `sources/Rethinking productivity the crucial role of demand.pdf`, PDF pp. 2, 12–13, 22, 24.
- Webber, D.J. & Tiwasing, P. (2025), accepted manuscript, footnote 1: https://eprints.whiterose.ac.uk/id/eprint/232807
- aGVA formula, as given in ONS Annual Business Survey material (via search summary):
  - https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/bulletins/uknonfinancialbusinesseconomy/2013-11-14
  - https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/adhocs/2836annualbusinesssurveyagvadatafornuts2andmarineplanareas2022and2023
- Scottish Government, *Scottish Annual Business Statistics: definitions* (turnover, purchases): https://www.gov.scot/publications/scottish-annual-business-statistics/pages/definitions/
- ONS (2022) "Double deflation and the supply and use framework in the UK national accounts": https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/articles/doubledeflationandthesupplyanduseframeworkintheuknationalaccounts/2022-12-02
- ONS, "Impact of double deflation on industry chain volume measure annual estimates" (Blue Book 2021): https://www.ons.gov.uk/economy/nationalaccounts/uksectoraccounts/articles/impactofdoubledeflationonindustrychainvolumemeasureannualestimates1997to2018/bluebook2021
- ONS (2017) "The impact of shrinkflation on CPIH, UK: January 2012 to June 2017": https://www.ons.gov.uk/economy/inflationandpriceindices/articles/theimpactofshrinkflationoncpihuk/january2012tojune2017
- ONS, *UK manufacturers' sales by product (PRODCOM): 2025*: https://www.ons.gov.uk/businessindustryandtrade/manufacturingandproductionindustry/bulletins/ukmanufacturerssalesbyproductprodcom/2025
- Klette, T.J. & Griliches, Z. (1996), *Journal of Applied Econometrics* 11(4): https://ideas.repec.org/a/jae/japmet/v11y1996i4p343-61.html
- Hottman, C., Redding, S. & Weinstein, D. (2016), *QJE*: https://www.nber.org/papers/w20436
