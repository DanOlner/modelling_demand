# Where GVA gets recorded: value capture, booking rules and place

The motivating example is Apple's Cupertino campus. It shows very high GVA per worker on site, while the distant suppliers who make the products show very little.

This note collects evidence and accounting rules that decide where value added appears: across a global chain, between countries, and between UK regions. The short version is that GVA's location reflects market power, ownership of intellectual property (IP), legal and tax structures, and statistical allocation rules, as well as where work is done.

## 1. Value capture in a global chain: the iPhone

**Kraemer, Linden & Dedrick (2011)**, "Capturing Value in Global Networks", split the 2010 sales price of an iPhone like this:

| Share of iPhone sales price (2010) | % |
|---|---|
| Apple profits | 58.5 |
| Non-Apple US profits | 2.4 |
| South Korean profits | 4.7 |
| EU profits | 1.1 |
| Japanese profits | 0.5 |
| Taiwanese profits | 0.5 |
| Unidentified profits | 5.3 |
| Materials | 21.9 |
| Non-China labour | 3.5 |
| China labour | 1.8 |

- **The low-end iPad ($499)** splits as: Apple 30%, distribution and retail 15%, materials 31%, Korea 7%, Taiwan 2%, Japan 1%, non-Apple US 2%, unidentified 5%, non-China labour 5%, China labour 2%.
- **China's share.** Their estimate is "$10 or less" of Chinese wages per iPhone or iPad. Yet each unit adds $229–275, its estimated factory cost, to the US–China trade deficit in gross terms.
- **Booking is itself a convention.** Suppliers' profits are assigned to the country of their corporate headquarters.
- **Market power.** "With its control over the supply chain, Apple has the power to make and break the fortunes of many of its suppliers."
- **Who benefits.** Apple's success benefits "its shareholders, workers, and the U.S. economy", because design, software, product management and marketing stay in the US.
- **A streetlight remark in their own words:** "because of the inadequate data collected by trade and other statistical agencies, we are left with educated guesses".

**Xing & Detert (2010)**, on the iPhone 3G:

- China's value added was about $6.50 per phone;
- foreign value added was 96.4% of the production cost.

**In the paper's terms** (my reading). This is the yoghurt chain at global scale.

- Apple's rectangle has a very large S − C: the price it receives minus components and assembly fees.
- The assembler's rectangle is the assembly fee per unit minus its own bought-in costs, which is thin.
- The prices between them, set by Apple's bargaining power, decide where the chain's value added shows up. The chain total doesn't change.

## 2. Where the lead firm's own value added is booked: IP, tax and Ireland

**Ownership rule.** National accounts follow economic ownership (ESA 2010 and BPM6).

- In contract manufacturing, the company that owns the IP and the inputs, the "principal", records the output and the sale.
- The foreign contract manufacturer only supplies a processing service, which is recorded as a service import for the principal.
- So if an Irish-resident subsidiary owns the IP, goods assembled in China under contract can appear in Irish output and exports, even though nothing is made in Ireland. This is the Irish statistics office's (CSO's) own explanation.

**Ireland 2015 ("leprechaun economics").**

- Irish GDP growth for 2015 was first published at 26.3%, later revised to 24.6%. It is widely attributed to multinationals moving assets and IP to Ireland, including Apple's restructuring of its Irish subsidiary in January 2015.
- My sources for the Apple link are secondary (Wikipedia and commentary), so confidence on that detail is medium.
- In 2017 Ireland adopted "modified GNI" (GNI*) as a headline measure of its domestic economy.

**Profit shifting.** Tørsløv, Wier & Zucman (2023), "The Missing Profits of Nations", estimate:

- about 36% of multinational profits are shifted to tax havens globally;
- US multinationals shift twice as much as others, relative to their foreign earnings;
- reallocating the shifted profits would raise domestic profits by about 20% in high-tax EU countries, 10% in the US and 5% in developing countries, and cut tax havens' profits by 55%.

**Implication** (mine). Where GVA appears is partly a legal and tax choice. Even "Cupertino's GVA" is partly booked in other countries. So GVA by place measures where value is booked: not necessarily where it is created, and not where people benefit from it.

## 3. Within the UK: how regional GVA is assigned

- **It is workplace-based.** Regional GVA is recorded where production happens. Household income (gross disposable household income, GDHI) is recorded where people live.
- **Firms operating in several regions.** ONS's income-based regional GVA allocates income to regions using indicators.
  - In finance and insurance (ONS 2018), both compensation of employees (about 60% of the industry's income-based GVA) and gross trading profits (about 30%) are allocated using employees × average earnings, from the Business Register and Employment Survey (BRES) and the Annual Survey of Hours and Earnings (ASHE).
  - So a multi-region firm's profits are spread wherever its wage bill is, not wherever the profits arise. ONS itself notes that this means "areas with higher employment figures would be allocated more GVA, which might not be accurate".
  - That article covers finance and insurance only. I haven't checked the rules for other industries, so confidence that this is general is medium.
- **Commuting.** GVA per head divides workplace GVA by residents, so it is distorted by commuting; the City of London is the extreme case. ONS advises using GVA per hour worked or per job filled for productivity, and household income for living standards.
- **The household-income contrast** (GDHI per head, 2024, published August 2026):
  - UK £25,965;
  - London £36,487, the highest region;
  - North East £20,562, the lowest;
  - Westminster and City of London £84,292, the highest local area;
  - Leicester £16,786, the lowest.
- **Rural–urban.** See `supply-chains-buyer-power-and-gva.md`: majority-rural areas had about 92% of England's GVA per workforce job, excluding London, in 2023.
- **A plausible inference, not checked.** Head offices, IP holders and high earners are concentrated in London and the South East. Combined with allocation by wage bill, that would lift measured GVA per worker there, beyond what the physical activity in those regions alone would produce.

## 4. What this gives the model

**Booking rules as explicit switches.** Profits could be recorded:

- where the IP or head office sits;
- apportioned by wage bill, as ONS does in finance and insurance;
- where physical production happens, as a counterfactual "where value is created" view;
- across the whole chain behind each final product, the vertically integrated view (see `flows-and-value-added.md`).

**A "Cupertino experiment".**

- Hold physical production, employment and wages fixed. Change who owns the IP, or the prices between chain stages.
- Regional GVA per worker swings a lot.
- Residents' incomes barely move, unless the profits are paid to local owners.
- This makes the point that place-based GVA can move independently of living standards.

## Sources

- Kraemer, K.L., Linden, G. & Dedrick, J. (2011) "Capturing Value in Global Networks: Apple's iPad and iPhone", pp. 2, 4–6 and Figures 1–2: https://monthlyreview.org/wp-content/uploads/2015/07/10.1.1.466.3897.pdf
- Xing, Y. & Detert, N. (2010), ADBI Working Paper 257, via summaries: https://www.bespacific.com/?p=26788 and https://cepr.org/voxeu/columns/how-iphone-widens-us-trade-deficit-china-case-iphone-x (the second could not be fetched)
- CSO (Ireland), "Contract Manufacturing" note: https://www.cso.ie/en/media/csoie/methods/internationalaccounts/Contract_Manufacturing_-_rebrand.pdf; CSO 2014 press release on ESA 2010 and BPM6: https://www.cso.ie/en/csolatestnews/pressreleases/2014pressreleases/implementingnewinternationalstandardsfornationalaccountsandbalanceofpaymentsstatistics/
- "Leprechaun economics" (secondary): https://en.wikipedia.org/wiki/Leprechaun_economics; SPERI blog "Ireland and GDP": https://speri-blog.sites.sheffield.ac.uk/blog/2016/ireland-and-gdp
- Tørsløv, T., Wier, L. & Zucman, G. (2023) "The Missing Profits of Nations", *Review of Economic Studies*: https://www.restud.com/the-missing-profits-of-nations/ and https://gabriel-zucman.eu/files/TWZ2022.pdf
- ONS (2018) "Measurement of the finance and insurance industries in estimates of regional gross value added": https://www.ons.gov.uk/economy/grossvalueaddedgva/articles/measurementofthefinanceandinsuranceindustriesinestimatesofregionalgrossvalueadded/2018-04-09
- ONS guidance on GVA per head vs productivity, via ONS blog "Mind the gap": https://blog.ons.gov.uk/2018/11/23/mind-the-gap-why-the-uk-might-not-be-the-most-regionally-unequal-country/ and ONS "Regional and sub-regional productivity in the UK: February 2018": https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/labourproductivity/articles/regionalandsubregionalproductivityintheuk/february2018
- ONS, *Regional gross disposable household income: 2024* (19 August 2026): https://www.ons.gov.uk/economy/regionalaccounts/grossdisposablehouseholdincome/bulletins/regionalgrossdisposablehouseholdincomegdhi/latest
