/**
 * §13 lenses 4–6: what residents end up with, by place of residence.
 * - Lens 4: gross disposable household income (GDHI) per resident, next to workplace GVA per
 *   resident and per job.
 * - Lens 5: residual income per resident, (YD − essentials)/N.
 * - Lens 6 (§10): wealth. Rents are capitalised at y_h and after-tax profits at y_e, for
 *   reporting only. Firms listed in `wealth.excludeFromEquity` (the landlords) are left out
 *   of equity wealth, because housing wealth already counts them (decided 3 October 2026).
 *   The offshore IP holder's profit counts as part of its owner firm's.
 */

import { gvaPerJobByPlace, gvaByPlace, residualIncomePerResident } from '../aggregates';
import { filled, type Vector } from '../linalg';
import type { PeriodRecord } from '../run';

export interface Wealth {
  /** Of the households in each place. */
  money: Vector;
  housing: Vector;
  equity: Vector;
  total: Vector;
  perResident: Vector;
  /** Housing and equity wealth of every owner group (the places, then the rest of the world). */
  housingByOwner: Vector;
  equityByOwner: Vector;
}

export interface PlaceIncomes {
  gdhiPerResident: Vector;
  gvaPerResident: Vector;
  gvaPerJob: Vector;
  residualIncomePerResident: Vector;
  wealth: Wealth;
}

export function wealth(record: PeriodRecord): Wealth {
  const { econ, result, money } = record;
  const { params } = econ;
  const pr = result.producers;
  const nGroups = econ.ownerGroups.length;
  const housingByOwner = filled(nGroups, 0);
  const equityByOwner = filled(nGroups, 0);

  const afterTaxProfit: Record<string, number> = {};
  for (let j = 0; j < econ.nDomestic; j++) {
    const firm = econ.firmOf[j];
    if (firm === null || econ.isGovernment[j]) continue;
    if (econ.sectorOf[j] === params.wealth.housingSector) {
      const value = pr.revenue[j] / params.wealth.housingYield;
      econ.ownerShares[j].forEach((share, g) => (housingByOwner[g] += share * value));
    }
    afterTaxProfit[firm] = (afterTaxProfit[firm] ?? 0) + pr.netProfit[j] - pr.profitTax[j];
  }
  if (params.royalty.ownerFirm !== null) {
    afterTaxProfit[params.royalty.ownerFirm] = (afterTaxProfit[params.royalty.ownerFirm] ?? 0) + result.ip.royalties;
  }
  for (const [firm, profit] of Object.entries(afterTaxProfit)) {
    if (params.wealth.excludeFromEquity.includes(firm)) continue;
    for (const [group, share] of Object.entries(params.firms[firm].owners)) {
      equityByOwner[econ.ownerGroups.indexOf(group)] += (share * profit) / params.wealth.equityYield;
    }
  }

  const places = econ.places.map((_, r) => r);
  const housing = places.map((r) => housingByOwner[r]);
  const equity = places.map((r) => equityByOwner[r]);
  const total = places.map((r) => money.households[r] + housing[r] + equity[r]);
  return {
    money: money.households.slice(),
    housing,
    equity,
    total,
    perResident: total.map((w, r) => w / result.households.population[r]),
    housingByOwner,
    equityByOwner,
  };
}

export function placeIncomes(record: PeriodRecord): PlaceIncomes {
  const { econ, result } = record;
  const hh = result.households;
  return {
    gdhiPerResident: hh.disposableIncome.map((yd, r) => yd / hh.population[r]),
    gvaPerResident: gvaByPlace(econ, result).map((gva, w) => gva / hh.population[w]),
    gvaPerJob: gvaPerJobByPlace(econ, result),
    residualIncomePerResident: residualIncomePerResident(result),
    wealth: wealth(record),
  };
}
