/**
 * §12: the plausibility check. Base-year results are reported against expected ranges.
 * Nothing is tuned to meet them except the three calibrated unknowns; results outside a
 * range go back to the user.
 */

import type { Economy } from './economy';
import { sum } from './linalg';
import type { PeriodResult } from './period';

export interface PlausibilityRow {
  label: string;
  value: number;
  /** For checks that are a comparison rather than a range, a description of the values compared. */
  detail?: string;
  min?: number;
  max?: number;
  ok: boolean;
}

export function plausibilityReport(econ: Economy, result: PeriodResult): PlausibilityRow[] {
  const { params, nDomestic: nd } = econ;
  const { producers: pr, macro, households: hh } = result;
  const gdp = macro.gdpProduction;
  const sectorGva = (sector: string) => {
    let total = 0;
    for (let j = 0; j < nd; j++) if (econ.sectorOf[j] === sector) total += pr.gva[j];
    return total;
  };

  return params.plausibility.map((check): PlausibilityRow => {
    if (check.metric === 'mainPlaceHasHighestGvaPerJob') {
      const gvaAt = econ.places.map(() => 0);
      for (let j = 0; j < nd; j++) gvaAt[econ.placeOf[j]] += pr.gva[j];
      const perJob = gvaAt.map((gva, w) => gva / result.workplaces.jobs[w]);
      const main = econ.places.indexOf(params.population.mainPlace);
      const ok = perJob.every((value, w) => w === main || perJob[main] > value);
      const detail = econ.places.map((place, w) => `${place} £${Math.round(perJob[w]).toLocaleString('en-GB')}`).join(', ');
      return { label: check.label, value: perJob[main], detail, ok };
    }
    let value: number;
    switch (check.metric) {
      case 'incomeTaxRate':
        value = params.government.incomeTaxRate;
        break;
      case 'mainShare':
        value = params.population.mainShare;
        break;
      case 'gdpPerResident':
        value = gdp / sum(hh.population);
        break;
      case 'disposableIncomeToGdp':
        value = sum(hh.disposableIncome) / gdp;
        break;
      case 'labourShareOfGva':
        value = sum(pr.wageBill) / gdp;
        break;
      case 'exportsToGdp':
        value = macro.exportsValue / gdp;
        break;
      case 'overseasDividendsToGdp':
        value = result.restOfWorld.dividendsReceived / gdp;
        break;
      case 'sectorShareOfGva':
        value = sectorGva(check.sector) / gdp;
        break;
      case 'producerShareOfGdp':
        value = pr.gva[econ.index[check.producer]] / gdp;
        break;
    }
    return { label: check.label, value, min: check.min, max: check.max, ok: value >= check.min && value <= check.max };
  });
}
