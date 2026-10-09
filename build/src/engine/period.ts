/**
 * §7–§9 and §11 step 3: one period's quantities and incomes, solved together by fixed-point
 * iteration once prices are known. Each round builds final demand from households' current
 * disposable income, solves outputs, then works out jobs, wages, GVA, profits, taxes,
 * dividends, employment by residence, benefits and disposable income again.
 */

import { baseYearCommuting } from './commuting';
import type { Economy } from './economy';
import { filled, luDecompose, luSolve, maxRelativeChange, sum, zeros, type Matrix, type Vector } from './linalg';

export const QUANTITY_TOLERANCE = 1e-12;
const MAX_ITERATIONS = 10_000;

/**
 * 'base' is the base year: households spend exactly their disposable income, and commuting
 * follows the base-year rule. 'normal' is every later period.
 */
export type PeriodMode = 'base' | 'normal';

export interface PeriodInput {
  econ: Economy;
  prices: Vector;
  mode: PeriodMode;
  /** M^h_{r,t−1}: households' money at the end of last period, by place. Unused in the base year. */
  householdMoney: Vector;
  /** Γ, rows workplaces and columns places of residence. Unused in the base year. */
  commuting: Matrix | null;
  /** In freeze-consumption mode (S15): households' base-year quantities, by place then producer. */
  frozenQuantities: Matrix | null;
  /** Where to start iterating, normally last period's solution. */
  start?: { output: Vector; disposableIncome: Vector };
}

/**
 * Accounts by producer, indexed like `econ.ids`. For foreign suppliers, `output` is the
 * quantity imported and `revenue` the payments for it; their other entries are 0.
 */
export interface ProducerAccounts {
  output: Vector;
  revenue: Vector;
  inputsCost: Vector;
  royalty: Vector;
  gva: Vector;
  jobs: Vector;
  wageBill: Vector;
  depreciation: Vector;
  netProfit: Vector;
  profitTax: Vector;
  dividends: Vector;
  retained: Vector;
}

/** Accounts by place of residence. */
export interface HouseholdAccounts {
  population: Vector;
  labourForce: Vector;
  nonWorking: Vector;
  employed: Vector;
  /** Negative values are a labour shortage, which v1 reports but doesn't constrain. */
  unemployed: Vector;
  wagesReceived: Vector;
  /** From domestic firms and from the offshore IP holder. */
  dividendsReceived: Vector;
  grossIncome: Vector;
  incomeTax: Vector;
  benefits: Vector;
  disposableIncome: Vector;
  essentialSpend: Vector;
  consumption: Vector;
  saving: Vector;
  /** Quantities bought, by place then producer. */
  quantities: Matrix;
}

export interface PeriodResult {
  prices: Vector;
  producers: ProducerAccounts;
  /** Final demand quantities, by producer. Investment includes the imported investment goods. */
  finalDemand: { households: Vector; government: Vector; investment: Vector; exports: Vector };
  households: HouseholdAccounts;
  /** Dividends from domestic firms, by owner group (the places, then the rest of the world). */
  dividendsByOwner: Vector;
  /** The offshore IP holder, W.IP. */
  ip: { royalties: number; dividends: number; dividendsByOwner: Vector; retained: number };
  government: {
    incomeTax: number;
    profitTax: number;
    /** Any surplus of publicly owned producers; zero under cost pricing. */
    enterpriseSurplus: number;
    /** Public services bought, in units, by place. */
    provisionQuantity: Vector;
    provisionSpend: number;
    benefits: number;
    /** GB: revenue minus spending. */
    balance: number;
  };
  /** Flows between the domestic economy and the rest of the world, from its side. */
  restOfWorld: {
    importPayments: number;
    royalties: number;
    /** Dividends paid to overseas owners. */
    dividendsReceived: number;
    exportPayments: number;
    /** The IP holder's dividends to domestic owners. */
    ipDividendsPaid: number;
    /** RB: its net receipts. */
    balance: number;
  };
  firms: { retained: number };
  /** Jobs and wage bills by workplace. */
  workplaces: { jobs: Vector; wageBill: Vector };
  commuting: Matrix;
  macro: {
    gdpProduction: number;
    gdpExpenditure: number;
    gdpIncome: number;
    consumption: number;
    governmentSpend: number;
    investment: number;
    exportsValue: number;
    /** Including royalties. */
    importsValue: number;
    gni: number;
    currentAccount: number;
    unemploymentRate: number;
  };
  flags: string[];
  iterations: number;
}

interface HouseholdDemand {
  quantities: Matrix;
  total: Vector;
  consumption: Vector;
  essentialSpend: Vector;
  essentialsExceedPlanned: boolean[];
}

/** §7: households' purchases, given their disposable income. */
function householdDemand(input: PeriodInput, disposableIncome: Vector): HouseholdDemand {
  const { econ, prices: p, mode } = input;
  const hh = econ.params.households;
  const n = econ.ids.length;
  const quantities = zeros(econ.places.length, n);
  const consumption: Vector = [];
  const essentialSpend: Vector = [];
  const essentialsExceedPlanned: boolean[] = [];
  econ.places.forEach((_, r) => {
    const q = quantities[r];
    const residents = econ.population[r];
    let essentials = 0;
    for (const { producer, unitsPerResident } of econ.essentials[r]) essentials += p[producer] * unitsPerResident * residents;
    essentialSpend.push(essentials);
    if (input.frozenQuantities) {
      input.frozenQuantities[r].forEach((quantity, k) => (q[k] = quantity));
      consumption.push(q.reduce((s, quantity, k) => s + p[k] * quantity, 0));
      essentialsExceedPlanned.push(false);
      return;
    }
    for (const { producer, unitsPerResident } of econ.essentials[r]) q[producer] += unitsPerResident * residents;
    let planned = mode === 'base' ? disposableIncome[r] : hh.alpha1 * disposableIncome[r] + hh.alpha2 * input.householdMoney[r];
    // Households still buy their essentials; money holdings absorb the difference.
    const exceeds = planned < essentials;
    if (exceeds) planned = essentials;
    essentialsExceedPlanned.push(exceeds);
    const discretionary = planned - essentials;
    if (hh.gadgetShare !== 0) q[econ.gadget] += (hh.gadgetShare * discretionary) / p[econ.gadget];
    const local = econ.localDiscretionary[r];
    q[local] += ((1 - hh.gadgetShare) * discretionary) / p[local];
    consumption.push(planned);
  });
  const total = filled(n, 0);
  for (const row of quantities) row.forEach((quantity, k) => (total[k] += quantity));
  return { quantities, total, consumption, essentialSpend, essentialsExceedPlanned };
}

/**
 * §7: investment equals total depreciation at current output, spent in fixed shares. It is
 * folded into the input coefficients (B = A plus δ_j·share_i/p_i), so that investment equals
 * depreciation exactly at the solved output, not just at convergence.
 */
function withInvestment(econ: Economy, p: Vector): Matrix {
  const B = econ.A.map((row) => row.slice());
  for (const { producer: i, share } of econ.investmentShares) {
    for (let j = 0; j < econ.nDomestic; j++) B[i][j] += (share * econ.depreciation[j]) / p[i];
  }
  return B;
}

export function solvePeriod(input: PeriodInput): PeriodResult {
  const { econ, prices: p } = input;
  const { params, nDomestic: nd } = econ;
  const n = econ.ids.length;

  const B = withInvestment(econ, p);
  const leontief = luDecompose(Array.from({ length: nd }, (_, i) => Array.from({ length: nd }, (_, j) => (i === j ? 1 : 0) - B[i][j])));

  // Government purchases and exports don't depend on incomes.
  const provisionQuantity = econ.places.map(
    (place, r) => params.government.provisionPerResident * (params.government.provisionMultiplier[place] ?? 1) * econ.population[r],
  );
  const government = filled(n, 0);
  econ.provision.forEach((k, r) => (government[k] += provisionQuantity[r]));

  let output = input.start ? input.start.output.slice(0, nd) : filled(nd, 0);
  let disposableIncome = input.start ? input.start.disposableIncome.slice() : filled(econ.places.length, 0);
  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    const demand = householdDemand(input, disposableIncome);
    const finalDomestic = Array.from({ length: nd }, (_, k) => demand.total[k] + government[k] + econ.exportQuantities[k]);
    const nextOutput = luSolve(leontief, finalDomestic);
    const result = accounts(input, B, nextOutput, demand, government, provisionQuantity);
    const change = Math.max(
      maxRelativeChange(nextOutput, output),
      maxRelativeChange(result.households.disposableIncome, disposableIncome),
    );
    output = nextOutput;
    disposableIncome = result.households.disposableIncome;
    if (change < QUANTITY_TOLERANCE) return { ...result, iterations: iteration };
    if (Number.isNaN(change)) throw new Error(`Quantities and incomes became NaN in iteration ${iteration}`);
  }
  throw new Error(`Quantities and incomes did not converge in ${MAX_ITERATIONS} iterations`);
}

/** §8–§9: every flow implied by the domestic output x and the household demand behind it. */
function accounts(
  input: PeriodInput,
  B: Matrix,
  x: Vector,
  demand: HouseholdDemand,
  government: Vector,
  provisionQuantity: Vector,
): Omit<PeriodResult, 'iterations'> {
  const { econ, prices: p, mode } = input;
  const { params, nDomestic: nd } = econ;
  const n = econ.ids.length;
  const nPlaces = econ.places.length;
  const nGroups = econ.ownerGroups.length;
  const foreignGroup = nGroups - 1;
  const { government: gov, royalty } = params;

  // Output of domestic producers, and quantities imported from foreign suppliers.
  const output = filled(n, 0);
  for (let j = 0; j < nd; j++) output[j] = x[j];
  for (let i = nd; i < n; i++) {
    let quantity = demand.total[i] + government[i];
    for (let j = 0; j < nd; j++) quantity += B[i][j] * x[j];
    output[i] = quantity;
  }

  let investmentTotal = 0;
  for (let j = 0; j < nd; j++) investmentTotal += econ.depreciation[j] * x[j];
  const investment = filled(n, 0);
  for (const { producer, share } of econ.investmentShares) investment[producer] += (share * investmentTotal) / p[producer];

  const pr: ProducerAccounts = {
    output,
    revenue: filled(n, 0),
    inputsCost: filled(n, 0),
    royalty: filled(n, 0),
    gva: filled(n, 0),
    jobs: filled(n, 0),
    wageBill: filled(n, 0),
    depreciation: filled(n, 0),
    netProfit: filled(n, 0),
    profitTax: filled(n, 0),
    dividends: filled(n, 0),
    retained: filled(n, 0),
  };
  const dividendsByOwner = filled(nGroups, 0);
  let enterpriseSurplus = 0;
  for (let j = 0; j < nd; j++) {
    pr.revenue[j] = p[j] * x[j];
    let unitInputs = 0;
    for (let i = 0; i < n; i++) unitInputs += econ.A[i][j] * p[i];
    pr.inputsCost[j] = unitInputs * x[j];
    pr.royalty[j] = j === econ.royaltyPayer ? royalty.rate * pr.revenue[j] : 0;
    pr.gva[j] = pr.revenue[j] - pr.inputsCost[j] - pr.royalty[j];
    pr.jobs[j] = econ.jobsPerUnit[j] * x[j];
    pr.wageBill[j] = econ.wagePerJob[j] * pr.jobs[j];
    pr.depreciation[j] = econ.depreciation[j] * x[j];
    pr.netProfit[j] = pr.gva[j] - pr.wageBill[j] - pr.depreciation[j];
    if (econ.isGovernment[j]) {
      enterpriseSurplus += pr.netProfit[j];
      continue;
    }
    pr.profitTax[j] = gov.profitTaxRate * Math.max(pr.netProfit[j], 0);
    const afterTax = pr.netProfit[j] - pr.profitTax[j];
    // Negative dividends are allowed: owners then cover the losses.
    pr.dividends[j] = econ.payout[j] * afterTax;
    pr.retained[j] = afterTax - pr.dividends[j];
    for (let g = 0; g < nGroups; g++) dividendsByOwner[g] += econ.ownerShares[j][g] * pr.dividends[j];
  }
  for (let i = nd; i < n; i++) pr.revenue[i] = p[i] * output[i];

  // The offshore IP holder: its profit is the royalty, untaxed in the UK.
  const royalties = sum(pr.royalty);
  const ipDividends = royalty.payout * royalties;
  const ipDividendsByOwner = econ.ipOwnerShares.map((share) => share * ipDividends);

  // Employment and incomes by place of residence (§8, §9).
  const jobsAt = filled(nPlaces, 0);
  const wagesAt = filled(nPlaces, 0);
  for (let j = 0; j < nd; j++) {
    jobsAt[econ.placeOf[j]] += pr.jobs[j];
    wagesAt[econ.placeOf[j]] += pr.wageBill[j];
  }
  let gamma: Matrix;
  if (mode === 'base') gamma = baseYearCommuting(jobsAt, econ.labourForce);
  else if (input.commuting) gamma = input.commuting;
  else throw new Error('After the base year, a commuting matrix must be given');

  const hh: HouseholdAccounts = {
    population: econ.population.slice(),
    labourForce: econ.labourForce.slice(),
    nonWorking: econ.nonWorking.slice(),
    employed: filled(nPlaces, 0),
    unemployed: filled(nPlaces, 0),
    wagesReceived: filled(nPlaces, 0),
    dividendsReceived: filled(nPlaces, 0),
    grossIncome: filled(nPlaces, 0),
    incomeTax: filled(nPlaces, 0),
    benefits: filled(nPlaces, 0),
    disposableIncome: filled(nPlaces, 0),
    essentialSpend: demand.essentialSpend,
    consumption: demand.consumption,
    saving: filled(nPlaces, 0),
    quantities: demand.quantities,
  };
  for (let r = 0; r < nPlaces; r++) {
    for (let w = 0; w < nPlaces; w++) {
      hh.employed[r] += gamma[w][r] * jobsAt[w];
      hh.wagesReceived[r] += gamma[w][r] * wagesAt[w];
    }
    hh.unemployed[r] = hh.labourForce[r] - hh.employed[r];
    hh.dividendsReceived[r] = dividendsByOwner[r] + ipDividendsByOwner[r];
    hh.grossIncome[r] = hh.wagesReceived[r] + hh.dividendsReceived[r];
    hh.incomeTax[r] = gov.incomeTaxRate * hh.grossIncome[r];
    hh.benefits[r] = gov.benefitNonWorking * hh.nonWorking[r] + gov.benefitUnemployed * Math.max(hh.unemployed[r], 0);
    hh.disposableIncome[r] = hh.grossIncome[r] - hh.incomeTax[r] + hh.benefits[r];
    hh.saving[r] = hh.disposableIncome[r] - hh.consumption[r];
  }

  const value = (quantities: Vector) => quantities.reduce((s, q, k) => s + p[k] * q, 0);
  const incomeTax = sum(hh.incomeTax);
  const profitTax = sum(pr.profitTax);
  const provisionSpend = value(government);
  const benefits = sum(hh.benefits);

  let importPayments = 0;
  for (let i = nd; i < n; i++) importPayments += pr.revenue[i];
  const exportPayments = value(econ.exportQuantities);
  const ipDividendsPaid = sum(ipDividendsByOwner.slice(0, foreignGroup));
  const restOfWorld = {
    importPayments,
    royalties,
    dividendsReceived: dividendsByOwner[foreignGroup],
    exportPayments,
    ipDividendsPaid,
    balance: importPayments + royalties + dividendsByOwner[foreignGroup] - exportPayments - ipDividendsPaid,
  };

  let gdpProduction = 0;
  let gdpIncome = 0;
  for (let j = 0; j < nd; j++) {
    gdpProduction += pr.gva[j];
    gdpIncome += pr.wageBill[j] + pr.depreciation[j] + pr.netProfit[j];
  }
  const consumption = sum(hh.consumption);
  const importsValue = importPayments + royalties;

  const flags: string[] = [];
  econ.places.forEach((place, r) => {
    if (demand.essentialsExceedPlanned[r]) flags.push(`${place}: essentials exceed planned consumption`);
    if (hh.unemployed[r] < 0) flags.push(`${place}: labour shortage`);
  });

  return {
    prices: p.slice(),
    producers: pr,
    finalDemand: { households: demand.total, government, investment, exports: econ.exportQuantities.slice() },
    households: hh,
    dividendsByOwner,
    ip: { royalties, dividends: ipDividends, dividendsByOwner: ipDividendsByOwner, retained: royalties - ipDividends },
    government: {
      incomeTax,
      profitTax,
      enterpriseSurplus,
      provisionQuantity,
      provisionSpend,
      benefits,
      balance: incomeTax + profitTax + enterpriseSurplus - provisionSpend - benefits,
    },
    restOfWorld,
    firms: { retained: sum(pr.retained) },
    workplaces: { jobs: jobsAt, wageBill: wagesAt },
    commuting: gamma,
    macro: {
      gdpProduction,
      gdpExpenditure: consumption + provisionSpend + investmentTotal + exportPayments - importsValue,
      gdpIncome,
      consumption,
      governmentSpend: provisionSpend,
      investment: investmentTotal,
      exportsValue: exportPayments,
      importsValue,
      gni: gdpProduction + ipDividendsPaid - dividendsByOwner[foreignGroup],
      currentAccount: -restOfWorld.balance,
      unemploymentRate: sum(hh.unemployed) / sum(hh.labourForce),
    },
    flags,
  };
}
