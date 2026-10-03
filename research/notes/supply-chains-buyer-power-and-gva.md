# Supply chains, buyer power and where GVA gets recorded

Webber & Huaccha (2024) argue that market power along a supply chain moves GVA between firms and places. In their example, an urban retailer squeezes a manufacturer on the urban fringe, who squeezes a rural dairy. So rural GVA per worker can be lower even if the physical ratio of inputs to outputs is the same (paper PDF pp. 12–15). This note collects the accounting, ways to model bargaining, UK evidence, and the authors' follow-up chapter that makes the argument spatial. Published figures are for orientation, not calibration.

## 1. The chain identity (my formalisation of the paper's yoghurt example)

**Setting up the chain.** Take a chain of stages $k = 1, \dots, K$, where each unit of final product needs one unit from each stage, as in the yoghurt example.

- Stage $k$ sells at $S_k$ per unit and buys the previous stage's output at $S_{k-1}$.
- It also buys "other" inputs $O_k$ per unit. In national accounts these, such as utilities, are intermediate consumption.
- Its margin per unit is $m_k = S_k - S_{k-1} - O_k$.

**Summing over the chain**, the intermediate prices cancel:

$$\sum_{k=1}^{K} m_k = S_K - S_0 - \sum_k O_k$$

where $S_0$ is the first stage's bought-in primary inputs.

**What follows:**

- **Transfer prices only move GVA around.** The prices between stages ($S_1 \dots S_{K-1}$) decide how chain GVA is split between firms, and so between places. They don't change the total.
- **The total changes only if** the final price $S_K$, the primary inputs, the bought-in "other" inputs or the volume $Q$ change.
- **In the paper's yoghurt chain** (Figure 3, PDF p. 13), chain GVA is 570 − 10 = 560. The paper counts "other" inside GVA. Treating "other" as intermediate consumption, chain GVA would be 450.
- **In the paper's supermarket squeeze** (PDF p. 14), the transfer price falls by $0.10 and the final price by $0.05. At unchanged Q, chain GVA falls by $0.05 per litre and the retailer's share rises. If the price cut raises Q, the total can rise.

## 2. Ways to model who gets what

**a. Bargaining over the transfer price.**

- **Draganska, Klapper & Villas-Boas (2010)** model wholesale prices as the outcome of Nash bargaining between manufacturer and retailer. Each side's margin depends on demand and on their relative bargaining power.
  - In German ground coffee, size is a key driver of bargaining power.
  - The growth of retailers has probably strengthened their hand.
- **A simple version** (standard asymmetric Nash bargaining; my statement, not from a fetched source):
  - The joint margin $M$ on a unit is split so that the supplier gets its outside option plus a share $\beta$ of the surplus over both outside options, and the buyer gets the rest.
  - $\beta$ is the supplier's bargaining power.
  - In the paper's story, a large urban retailer has low $\beta$ for its suppliers and a better outside option.

**b. Markups at each stage.** Each stage marks up its own costs, Kalecki-style (see the firm-pricing note).

- The final price then compounds the markups ("double marginalisation").
- Compared with case a, a squeeze at one stage partly passes through to final prices.

**c. Explicit power rules.** Firms with power cut their bought-in cost C by a set fraction, with pass-through to their own price below 100%. This is the paper's supermarket example.

- **Pass-through decides the sign.** As shown in the firm-pricing note, pass-through decides whether the squeezing firm's GVA rises.

## 3. UK evidence on buyer power in groceries and dairy

- **Competition Commission (2008), groceries market investigation:**
  - Large grocery retailers used buyer power through practices that "transfer excessive risks and unexpected costs" to suppliers.
  - Remedies included a strengthened Groceries Supply Code of Practice (GSCOP, under the 2009 Order) and a recommended ombudsman, which became the Groceries Code Adjudicator.
- **Dairy margins**, from trade-press reports of DairyCo and the Milk Development Council (MDC). These are medium-confidence secondary reports, and the numbers are from the 2000s to 2011:
  - the retailer margin on liquid milk rose from 18.8p per litre in 2008/09 to 22.4p, apparently in 2009/10 (the report summary doesn't give the end year clearly), while the average retail price rose only 0.2p;
  - farmers received just under 24p per litre in 2009/10, 2p less than the season before;
  - processors' gross margins averaged 45% of selling prices over 2001/02–2010/11, falling to 35% in 2010/11;
  - an earlier MDC finding: supermarket margins on liquid milk and dairy products rose 8–10p per litre over ten years while farmgate prices fell about 6p.
  - This is the paper's mechanism in real data.
- **CMA (2023), groceries during the cost-of-living crisis:**
  - Across 11 retailers, operating profits and margins fell in 2022/23. Retailers had not passed all cost increases on to consumers.
  - Some branded suppliers raised prices by more than their costs.
  - Branded manufacturers' margins fell after 2021, mainly because shoppers switched to own-label.
  - Aggregate grocery inflation did not appear to be driven by weak competition between retailers.
  - So who squeezes whom changes over time. In 2022/23, retailers absorbed some of the cost increases.

## 4. The spatial argument: Webber & Tiwasing (2025)

This chapter (accepted manuscript, CC BY-NC) applies the 2D GVA idea to the rural–urban productivity gap. Its key moves:

- **Territories.**
  - Each firm sells within a "territory", a catchment shaped by geography, transport, habit and convenience.
  - Effective demand in a territory depends on the number of consumers and their incomes, both higher in urban areas.
  - Customers in the core of a territory stay loyal; those at the edges switch between sellers.
- **Measurement location.** GVA is recorded where the business is, not where its customers live. A firm can serve another council's residents, and an online seller can serve everyone. So an area's GVA reflects where firms sit within overlapping territories.
- **Scale (Q).**
  - More competitors in a territory means lower markups, smaller market shares and smaller GVA rectangles.
  - Rural firms have fewer potential customers, which limits Q.
  - Firm closures cut local workers' spending, which pushes Q down further, a cumulative process.
- **Price (S).**
  - Fewer nearby competitors can allow a higher S in rural areas.
  - But stronger implicit contracts with a small local customer base may hold S down.
  - Quiet collusion (not competing on price, not entering each other's territories) raises GVA.
- **Cost (C).** Market power over suppliers lowers C. Inter-firm cooperation, such as joint bulk buying, can raise rural firms' GVA.
- **The isoGVA curve.**
  - The chapter labels the rectangle's height H (= S − C) and width W (= Q), and says W and H are "inversely related" along the isoGVA curve.
  - That matches the margin-based reading in the main note, although its figure still plots S/C on the vertical axis.
  - Rural firms are said to resemble Firm A (low Q, because density is low); urban firms resemble Firm B.
- **Policy, and a difference from the 2024 paper.**
  - The chapter suggests raising Firm B's price and markup (increasing H) and removing barriers to Firm A's scale (increasing W).
  - The 2024 paper says firms should "play to their strengths", some scaling up and others raising their markup (PDF p. 18).
  - The chapter's pairing seems to strengthen each firm's weaker side instead. Worth checking in the next stage. Confidence that the texts say this: high. That they actually conflict: medium.
- **Conclusion.** Firm-level productivity is meaningful only within the firm's territory. Area-level GVA reflects consumption patterns, not just efficiency.
- **Other related work by the first author** (not read):
  - Webber (2016), ONS productivity workshop, and Webber (2019) conference paper, both on two-dimensional firm-level productivity;
  - Webber & Dymski (2021) on Covid-19, demand, supply and firm-level productivity, in McCann & Vorley (eds) *Productivity and the Pandemic*.

**Official rural–urban figures** (Defra, *Statistical Digest of Rural England: Rural Economic Bulletin*, February 2026):

- Rural areas produced £259bn of GVA in 2023, 12.2% of England's total.
- GVA per workforce job in majority-rural local authorities was about 92% of the England average excluding London in 2023, down from 96% in 2001.
- The gap is largest where most people live further from a major town or city: 82% in 2023 (92% in 2001). Where they live nearer: 97% (99% in 2001). Intermediate rural authorities: 97% (100% in 2001).
- Many rural residents work in urban areas, so these workplace-based figures describe rural economic activity, not rural residents.
- For comparison, Webber & Tiwasing cite Defra (2022): 2020 GVA was £253bn in predominantly rural areas, £750bn in predominantly urban areas excluding London, and £470bn in London.

**What the model could do with this** (mine). Give each chain stage a location, sum GVA and jobs by location, and compare a "fair-price" chain with a "power" chain. The rural–urban gap in GVA per worker can then open with no change in any physical ratio.

## 5. The "smile curve"

- **The idea.** In global value chains, value added is said to be higher at the upstream stages (research, design) and the downstream stages (marketing, retail, services) than in the middle (manufacturing, assembly).
- **Measurement.** Ye, Meng & Wei measure smile curves using inter-country input–output tables (World Input-Output Database, 1995–2011). Cases include electronics exports from China and Mexico and car exports from Japan and Germany.
- **Relevance.** The paper's yoghurt chain, where the retailer earns 300 of the 560 GVA, is a domestic version of the downstream end of the smile.
- **Confidence.** The smile curve is a widely used stylised idea; measured shapes vary by chain and period.

## 6. What this gives the model

- **An exact accounting rule.** Chain GVA = final sales − primary and other bought-in inputs, and transfer prices only redistribute it. This is a check the model should pass at every step.
- **Three ways to set transfer prices:** bargaining weights, stage markups, or squeezes with partial pass-through. Pass-through decides the signs.
- **A spatial layer.** Stage locations, territories and customer catchments, in the spirit of Webber & Tiwasing.
- **Orientation:**
  - rural–urban GVA per job gap of about 8% on average and about 18% in remote rural areas;
  - retail margins on milk in the 2000s were about as large as the farmgate price;
  - who squeezes whom changes over time (CMA 2023).

## Sources

- Webber, D.J. & Huaccha, G. (2024), *Journal of Post Keynesian Economics* 47(1). `sources/Rethinking productivity the crucial role of demand.pdf`, PDF pp. 12–15, 18; Figure 3 read from the PDF.
- Webber, D.J. & Tiwasing, P. (2025) "An alternative explanation of the rural–urban productivity gap", ch. 6 in Bosworth et al. (eds) *Rural Entrepreneurship: Harvesting Ideas and Sowing New Seeds*, Emerald. Accepted manuscript pp. 1–12: https://eprints.whiterose.ac.uk/id/eprint/232807; DOI https://doi.org/10.1108/S2040-724620250000020006
- Citing works of the 2024 paper, from OpenAlex (checked 3 October 2026): https://api.openalex.org/works?filter=cites:W4380768070
- Draganska, M., Klapper, D. & Villas-Boas, S. (2010) "A Larger Slice or a Larger Pie? An Empirical Investigation of Bargaining Power in the Distribution Channel", *Marketing Science* 29(1): https://ageconsearch.umn.edu/record/6054/files/wp071046.pdf
- Competition Commission (2008) groceries market investigation, as summarised in the CMA's response to a BEIS statutory consultation on the Groceries Code Adjudicator (GCA): https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1113122/BEIS_statutory_consultation_on_the_GCA_-_CMA_response.pdf
- Dairy margins, trade press (medium confidence):
  - Farmers Weekly, "Retailers accused of hoarding dairy margins": https://www.fwi.co.uk/business/markets-and-trends/dairy-markets/retailers-accused-of-hoarding-dairy-margins
  - Farmers Weekly, "Dairy supply chain margins in the spotlight": https://www.fwi.co.uk/business/dairy-supply-chain-margins-in-the-spotlight
  - The Cattle Site, "Dairy Processor Margins Falling": https://www.thecattlesite.com/news/39085/dairy-processor-margins-falling
- CMA (2023) *Competition, choice and rising prices in groceries*: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/1172290/Competition__choice_and_rising_prices_in_groceries.pdf and the manufacturing and supply update: https://assets.publishing.service.gov.uk/media/6566e9e475007400131ded9d/__Price_inflation_and_competition_in_food_and_grocery_manufacturing_and_supply____.pdf
- Defra (2026) *Statistical Digest of Rural England: 7 – Rural Economic Bulletin*, February 2026, pp. 58–59: https://assets.publishing.service.gov.uk/media/698db176492ea446ea7f42f8/7_Rural_Economic_Bulletin_11_02_2026_v2.pdf
- Ye, M., Meng, B. & Wei, S.-J. "Measuring smile curves in global value chains", IDE Discussion Paper 530: https://www.ide.go.jp/English/Publish/Reports/Dp/530.html
