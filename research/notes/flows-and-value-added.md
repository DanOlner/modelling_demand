# How GVA emerges from flows: input–output, vertical integration and social accounting

Webber & Huaccha (2024) look at one firm's rectangle at a time. But every firm's bought-in cost C is other firms' revenue. And every firm's GVA is paid out as wages, profits and taxes to people and institutions somewhere else.

This note sets out the accounting frameworks that treat GVA as what is left over from a web of flows. They are the foundation for the larger project: how GVA and productivity emerge from flows of goods, labour, capital and income, and how that varies by place.

## 1. The input–output view

**The tables.** ONS publishes supply and use tables and annual input–output analytical tables (IOATs).

- They come in product-by-product and industry-by-industry forms.
- Each includes an input–output table, a matrix of coefficients, the "Leontief inverse", effects and multipliers.
- ONS describes them as a tool for exploring "the interconnectivity and dependency of industries and products".

**The basic algebra** (standard Leontief accounting, in my notation):

- $x_j$ is the gross output of industry $j$, $z_{ij}$ its purchases from industry $i$, $m_j$ its imported inputs and $v_j$ its value added.
- $f_i$ is final demand for industry $i$'s output: consumption, investment, government spending and exports.
- **Row (where output goes):** $x_i = \sum_j z_{ij} + f_i$.
- **Column (what output costs):** $x_j = \sum_i z_{ij} + m_j + v_j$.
- **Coefficients and the Leontief inverse:** with $a_{ij} = z_{ij}/x_j$, output needed to meet final demand is $x = (I - A)^{-1} f$.
- **Summing over the whole economy:** total value added = total final demand − total imports. This is the economy-wide version of the supply-chain identity in `supply-chains-buyer-power-and-gva.md`: payments between firms cancel out, and only final sales and imported inputs remain.

**The paper's firm in these terms.**

- Its revenue $S \cdot Q$ is $x_j$.
- Its bought-in cost $C \cdot Q$ is $\sum_i z_{ij} + m_j$.
- Its GVA is $v_j$.
- Its Q depends on its row: purchases by other firms plus final demand. Demand for any final product reaches every supplier behind it through the Leontief inverse. So the paper's point that "demand matters" applies to every firm in the chain, not just the one selling to consumers.

**Multipliers** (standard definitions). A Type I multiplier counts the direct effect plus supply-chain (indirect) effects. A Type II multiplier also counts "induced" effects, as workers' wages are spent, by treating households as part of the system.

## 2. Vertical integration: productivity of the whole chain behind a final product

- **The idea.** Pasinetti (1973) regroups industries into "vertically integrated sectors". Each one produces a single final product and includes all the direct and indirect inputs behind it.
- **Labour behind a final product.** With $l_j$ the labour per unit of output in industry $j$, total labour needed per unit of each final product is $\lambda' = l'\,(I - A)^{-1}$. This is standard; the notation is mine. Its inverse is the labour productivity of the whole chain.
- **An application.** Garbellini & Wirkierman (2014) build a physical productivity accounting framework in these terms directly from supply and use tables. Applied to Italy in 1999–2007, they find:
  - only 60% of productivity growth went to real wages;
  - mechanisation increased;
  - the most dynamic sectors were the most consolidated;
  - technical change almost always raised capital intensity.
- **Why it matters here** (my reading):
  - *The yoghurt chain.* The dairy, factory and shop jointly make one final product. The chain's productivity is final output per total chain worker. The three stages' different GVA per worker reflects how the chain's value is divided (transfer prices, market power) and each stage's labour intensity. It doesn't show that one stage is "more productive" in any chain sense.
  - *Cupertino and its suppliers.* The same logic applies globally. The labour behind an iPhone includes the Chinese assembly workers. Apple's on-site GVA per worker reflects how much of the chain's value is recorded there (see `where-gva-is-recorded.md`).
  - *Theory.* This lens fits the paper's capital-controversy sympathies: Pasinetti was on the Cambridge, England side.

## 3. Trade in value added

- **What it measures.** The OECD–WTO Trade in Value Added (TiVA) database splits gross exports into domestic and foreign value added. This removes the double counting in gross trade statistics, where intermediate goods crossing borders several times are counted each time.
- **What it shows.** How much a country takes part in global value chains, both "backward" (imported inputs in its exports) and "forward" (its value added in other countries' exports).
- **The iPhone 3G as an example** (Xing & Detert 2010):
  - foreign value added was 96.4% of the production cost;
  - China's value added was about $6.50 per phone;
  - in gross terms the iPhone added $1.9bn to the 2009 US–China trade deficit, which mostly isn't Chinese value added.

## 4. Social accounting matrices: following the money after value added

- **What they are.** A social accounting matrix (SAM) is a square table of all transactions in an economy. Each account has a row for receipts and a column for spending.
- **The accounts:** production activities, factors (labour, capital), institutions (households by type, firms, government), a capital account and the rest of the world.
- **The circular flow it captures:** production generates value added; value added is paid to factors as wages and profits; that income goes to institutions; institutions spend it, which drives production again.
- **Origins.** Pyatt and Thorbecke developed SAMs, mainly at the World Bank, as a framework for policy and planning.
- **Why it matters.** An input–output table stops at value added. A SAM carries on to who receives value added (household types, places, firms, government, foreign owners) and how they spend it. That is the bridge from productivity to people's incomes and wealth (see `productivity-incomes-and-wealth.md`).
- **Stock-flow consistent models** (Godley–Lavoie; see `agent-based-firm-demand-models.md`) are dynamic versions of this accounting that add stocks: money, debt, wealth.

## 5. Regional flow data for the UK

- **National tables.** National IOATs and supply and use tables exist.
- **Scotland and Wales.** Both have their own, relatively up-to-date input–output tables. Researchers have used them to build three-region models: Scotland, Wales, and the rest of the UK.
- **Trade between UK regions.** ONS published estimates for 2019 and 2020 in January–February 2025, as "official statistics in development".
  - They cover the twelve ITL1 regions and nations.
  - They combine devolved administrations' surveys, ONS business survey microdata and administrative and commercial data.
  - In 2020, trade between UK regions totalled £1,350.3bn: £756.1bn in goods and £594.2bn in services.
  - London was the largest exporter to the rest of the UK, at £379.9bn or 28.1% of the total.
  - 2020 was an unusual pandemic year. Details come via a summary of the bulletin, so confidence is medium.
- **Academic datasets** (not read):
  - a UK multi-regional input–output dataset for 2017–2022 with 12 ITL1 regions and 105 sectors (IIOA conference papers);
  - a multi-regional SAM for the UK from Strathclyde.
- **Known gaps.** ESCoE (2018) found the biggest gap is in data on trade in services between regions.

## 6. Other flows: materials, energy and emissions

If the project's "other in/outs" include physical flows, environmentally extended multi-regional input–output databases add energy, emissions and materials to the monetary tables. FIGARO-E3 is one, consistent with Eurostat's FIGARO tables. I haven't read it; this is noted as a possible extension.

## 7. What this gives the model

- **An accounting skeleton.** A network of establishments with a matrix of flows between them. Each node's GVA is revenue minus purchases, and incomes flow onward through a SAM-like structure. The paper's 2D rectangle becomes the view of a single node.
- **Three productivity lenses from the same flows:**
  - GVA per worker at each node (the official lens);
  - productivity of the whole chain behind each final product;
  - income per resident, once SAM-style income flows are added.
- **Later calibration** could use ONS IOATs, regional accounts and the new estimates of trade between UK regions.

## Sources

- ONS, "Input-output analytical tables: guidance for use": https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/articles/inputoutputanalyticaltables/guidanceforuse; and "methods and application to UK national accounts": https://www.ons.gov.uk/economy/nationalaccounts/supplyandusetables/articles/inputoutputanalyticaltables/methodsandapplicationtouknationalaccounts
- Garbellini, N. & Wirkierman, A.L. (2014) "Productivity Accounting in Vertically (Hyper-)integrated Terms: Bridging the Gap between Theory and Empirics", *Metroeconomica* 65(1): 154–190 (summary only): https://research.gold.ac.uk/id/eprint/24478. Builds on Pasinetti, L. (1973) "The notion of vertical integration in economic analysis", *Metroeconomica*.
- OECD, Trade in Value-Added (TiVA): https://www.oecd.org/en/tiva.html; WTO explanatory notes: https://www.tralac.org/images/docs/8937/trade-in-value-added-and-gvcs-statistical-profiles-explanatory-notes-wto-january-2016.pdf
- Xing, Y. & Detert, N. (2010) "How the iPhone widens the United States trade deficit with the People's Republic of China", ADBI Working Paper 257 (via summaries): https://www.bespacific.com/?p=26788 and https://grips.repo.nii.ac.jp/record/1722/files/DP19-21(rev.).pdf
- Social accounting matrix overview: https://en.wikipedia.org/wiki/Social_accounting_matrix; Thorbecke's notes: https://thorbecke.economics.cornell.edu/docs/SAM.pdf
- ONS, *Interregional trade in goods and services, UK: 2019 and 2020*: https://www.ons.gov.uk/businessindustryandtrade/internationaltrade/bulletins/interregionaltradeingoodsandservicesuk/latest; methodology: https://www.ons.gov.uk/businessindustryandtrade/internationaltrade/methodologies/experimentalmethodologyforproducingukinterregionaltradeestimates
- Greig, A., Lisenkova, K. & Roy, G. (2018) "A Data Map of Existing UK Data Sources Related to Regional Trade", ESCoE DP 2018-03: https://www.escoe.ac.uk/publications/a-data-map-of-existing-uk-data-sources-related-to-regional-trade/
- UK multi-regional input–output work (not read): https://iioa.org/conferences/31st/papers/files/5422.pdf; multi-regional SAM for the UK: https://data.mendeley.com/datasets/zzkjsm2ggk
- FIGARO-E3 (not read): https://research.science.eus/documentos/68182211239bca77aca1bf3a
