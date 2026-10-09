/**
 * Totals by place and sector from one period's results, used by the experiments' checks,
 * the results tables and (from stage 7) the lenses.
 */

import type { Economy } from './economy';
import { filled, type Vector } from './linalg';
import type { PeriodResult } from './period';
import type { ProducerId } from './types';

/** Sums a per-producer vector over the domestic producers in each place. */
export function byPlace(econ: Economy, values: Vector): Vector {
  const out = filled(econ.places.length, 0);
  for (let j = 0; j < econ.nDomestic; j++) out[econ.placeOf[j]] += values[j];
  return out;
}

/** Sums a per-producer vector over a sector's domestic producers, optionally in one place only. */
export function bySector(econ: Economy, values: Vector, sector: string, place?: string): number {
  let total = 0;
  for (let j = 0; j < econ.nDomestic; j++) {
    if (econ.sectorOf[j] === sector && (place === undefined || econ.places[econ.placeOf[j]] === place)) total += values[j];
  }
  return total;
}

export function ofProducer(econ: Economy, values: Vector, id: ProducerId): number {
  const j = econ.index[id];
  if (j === undefined) throw new Error(`Unknown producer "${id}"`);
  return values[j];
}

/** GVA by workplace, with each producer's GVA recorded where it produces. */
export function gvaByPlace(econ: Economy, result: PeriodResult): Vector {
  return byPlace(econ, result.producers.gva);
}

export function gvaPerJobByPlace(econ: Economy, result: PeriodResult): Vector {
  return gvaByPlace(econ, result).map((gva, w) => gva / result.workplaces.jobs[w]);
}

/** Lens 5: disposable income left after essentials, per resident. */
export function residualIncomePerResident(result: PeriodResult): Vector {
  const hh = result.households;
  return hh.disposableIncome.map((yd, r) => (yd - hh.essentialSpend[r]) / hh.population[r]);
}

/** Lens 7: access to public services, as units per resident adjusted for quality q_r. */
export function servicesPerResident(econ: Economy, result: PeriodResult): Vector {
  return econ.places.map(
    (place, r) => (result.government.provisionQuantity[r] * (econ.params.government.quality[place] ?? 1)) / result.households.population[r],
  );
}

/** GVA per unit of output (at base prices) of one producer. */
export function gvaPerUnit(econ: Economy, result: PeriodResult, id: ProducerId): number {
  return ofProducer(econ, result.producers.gva, id) / ofProducer(econ, result.producers.output, id);
}
