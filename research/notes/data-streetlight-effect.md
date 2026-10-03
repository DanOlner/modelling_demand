# The streetlight effect: what UK economic data see well and what they miss

The streetlight effect is looking for something where it is easiest to look, rather than where it is. UK economic statistics are built mostly around production units (establishments and firms) and the places people work. That makes GVA per worker by place easy to calculate, and the flows that produce it hard to see. This includes:

- who buys from whom;
- who owns what;
- where profits go;
- what households actually end up with.

This note maps the lit and unlit areas. It supports the larger project's aim of understanding how productivity relates to people's actual wealth.

## 1. Under the light: well-measured things

- **Production data.**
  - The Annual Business Survey (ABS) covers turnover, purchases, approximate GVA and employment costs.
  - The Business Register and Employment Survey (BRES) gives employment by workplace.
  - There are workplace-based regional GVA and productivity by industry and region.
- **Economy-wide structure.** National supply and use tables and input–output analytical tables.
- **Household income by place of residence.** Regional gross disposable household income (GDHI), annual, with 2024 the latest year (published August 2026).

## 2. In the dark, or dimly lit

1. **Flows between firms.**
   - Who buys from whom, and at what prices, is rarely observed.
   - Firm-level prices exist only for some manufactured products (Prodcom unit values) and sampled producer prices.
   - Webber & Huaccha's complaint that only SQ and CQ are observed is one instance of this.
2. **Trade between UK regions.**
   - ONS first estimated this in 2025, for 2019 and 2020 only, at the level of the twelve ITL1 regions and nations, as "official statistics in development".
   - ESCoE (2018) found the biggest gap is in trade in services between regions.
3. **Ownership and profit flows.**
   - At the end of 2024, 58.8% of the value of UK quoted shares (£2.54 trillion in total) was owned overseas, a record. UK individuals owned 11.6%.
   - Regional GVA spreads a multi-region firm's profits using wage-bill indicators, at least in finance and insurance (see `where-gva-is-recorded.md`).
   - Globally, about 36% of multinational profits are shifted to tax havens (Tørsløv, Wier & Zucman 2023).
   - Where profits finally land, and who receives them as income, is largely invisible in place-based data.
4. **Intangibles, IP and booking.**
   - Contract manufacturing and IP ownership let output be recorded far from where the work happens; Ireland after 2015 is the clearest case.
   - Lead researchers on the iPhone chain say "inadequate data collected by trade and other statistical agencies" left them with "educated guesses" (Kraemer et al. 2011).
5. **Non-market output.**
   - Public services are about 20% of GDP (National Statistician's review, March 2025). Their output has no market price.
   - Until the 1990s, output was assumed equal to inputs, so productivity growth was zero by assumption.
   - The Atkinson Review (2005) introduced measuring the quantity and quality of services directly. The 2025 review updated those principles and added experimental "nowcasts" and quarterly healthcare estimates.
   - Measured productivity in these services still depends heavily on conventions.
6. **Unpaid household work.**
   - The ONS household satellite account values unpaid household services at £1.7 trillion, about 61% of GDP, in 2023. It peaked at 66% in 2020.
   - Unpaid adult care rose 81% in value between 2019 and 2023.
   - None of this is in GVA.
7. **Wealth.**
   - The Wealth and Assets Survey gives median household wealth of £293,700 for April 2020 to March 2022.
   - But its official accreditation has been suspended from that round onward, while ONS improves quality, especially for detailed breakdowns.
   - So the last link from productivity to people's actual wealth has the weakest data.
8. **Prices and deflation.** Firm and regional productivity statistics use national industry price indices, so local and firm-level price differences stay hidden inside "real output" (see `measuring-gva-and-productivity.md`).

## 3. Why it matters

**The Stiglitz–Sen–Fitoussi Commission (2009)** made these points about GDP-type measures:

- Recommendation 1: "When evaluating material well-being, look at income and consumption rather than production."
- Recommendation 2: "Emphasise the household perspective."
- Further recommendations (paraphrased): consider income and consumption together with wealth; give more prominence to how income, consumption and wealth are distributed; and broaden income measures to non-market activities.
- It favoured a dashboard of indicators over a single number.

**How the streetlight shapes policy** (my reading, building on the foundational-economy literature):

- Productivity targets for places are judged on workplace GVA per worker.
- So places dominated by care, education, retail and other foundational work look "unproductive", whatever the services contribute to living standards (see `foundational-economy-and-sector-linkages.md`).
- And places that host head offices or IP look productive, whatever their residents earn.

## 4. What this gives the model (mine)

- **Know everything inside the model.** Build it so every flow is known: goods and services, labour, income, ownership, unpaid work and wealth.
- **Then generate what an official observer would see:** workplace GVA by place with ONS-like allocation rules, deflated output, GDHI by residence, and survey-style wealth.
- **The streetlight becomes a toggle.** One view shows what the lamp shows; the other shows what's actually there. The gaps between them are the project's findings.
- **Order of building.** The model can be developed in the order of the dark areas above. Inter-firm and inter-regional flows and ownership come first, because they drive the Cupertino-type gap between where GVA is booked and where income lands.

## Sources

- Webber, D.J. & Huaccha, G. (2024), *JPKE* 47(1). `sources/Rethinking productivity the crucial role of demand.pdf`, PDF p. 22.
- ONS, *Interregional trade in goods and services, UK: 2019 and 2020*: https://www.ons.gov.uk/businessindustryandtrade/internationaltrade/bulletins/interregionaltradeingoodsandservicesuk/latest
- Greig, Lisenkova & Roy (2018), ESCoE DP 2018-03: https://www.escoe.ac.uk/publications/a-data-map-of-existing-uk-data-sources-related-to-regional-trade/
- ONS, *Ownership of UK quoted shares: 2024*: https://www.ons.gov.uk/economy/investmentspensionsandtrusts/bulletins/ownershipofukquotedshares/2024; and *2022*: https://www.ons.gov.uk/economy/investmentspensionsandtrusts/bulletins/ownershipofukquotedshares/2022
- Tørsløv, Wier & Zucman (2023): https://www.restud.com/the-missing-profits-of-nations/
- Kraemer, Linden & Dedrick (2011), p. 6: https://monthlyreview.org/wp-content/uploads/2015/07/10.1.1.466.3897.pdf
- UK Statistics Authority (2025) *National Statistician's Independent Review of the Measurement of Public Services Productivity*: https://uksa.statisticsauthority.gov.uk/publication/national-statisticians-independent-review-of-the-measurement-of-public-services-productivity/pages/2
- Atkinson Review (2005), final report: https://researchonline.lse.ac.uk/id/eprint/33553; context: https://www.progressive-policy.net/publications/metrics-that-matter
- ONS, *Household satellite account, UK: 2023*: https://www.ons.gov.uk/economy/nationalaccounts/satelliteaccounts/bulletins/householdsatelliteaccountuk/2023
- ONS, *Household total wealth in Great Britain: April 2020 to March 2022*: https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/bulletins/totalwealthingreatbritain/april2020tomarch2022
- Stiglitz–Sen–Fitoussi recommendations, as listed in ESDN and UN documents: https://www.esdn.eu/fileadmin/pdf/Workshops/6th_Workshop_2010/Presentations/12_Stiglitz-Sen-Fitoussi_Commission_Recommendations.pdf and https://unstats.un.org/unsd/nationalaccount/aeg/2012/M7-71.pdf; INSEE illustrations: https://www.insee.fr/en/statistiques/1380966
- ONS, *Regional gross disposable household income: 2024*: https://www.ons.gov.uk/economy/regionalaccounts/grossdisposablehouseholdincome/bulletins/regionalgrossdisposablehouseholdincomegdhi/latest
