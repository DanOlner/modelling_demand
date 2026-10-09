/**
 * §13 lens 9: measurement views. Switch S3 chooses the view:
 * - 'nominal': GVA at current prices;
 * - 'ownPrice': real GVA with each producer's output and inputs at its own base-year prices,
 *   x_j(1 − Σ_i a_ij) − r_IP·x_HQ when base prices are 1. This approximates physical output;
 * - 'sectorDeflated': real GVA as official statistics compute it, by double deflation. Each
 *   producer's output is deflated by its sector's output-weighted average price across
 *   places, Σp·x/Σp⁰·x (a Paasche index), and its inputs, royalties included, by one national
 *   average price of intermediate inputs.
 *
 * Switch S2 chooses how public services' (non-market) output volume is measured, in both real views:
 * - 'input': inputs at base prices, i.e. bought-in inputs plus labour (jobs × base-year wage)
 *   plus depreciation;
 * - 'indicator': service units × the quality index q_r.
 * Nominal GVA is the same under both conventions.
 */

import type { Economy } from '../economy';
import { filled, sum, type Vector } from '../linalg';
import type { PeriodRecord } from '../run';

export type MeasurementView = 'nominal' | 'ownPrice' | 'sectorDeflated';
export type ServiceConvention = 'input' | 'indicator';
export const MEASUREMENT_VIEWS: readonly MeasurementView[] = ['nominal', 'ownPrice', 'sectorDeflated'];
export const SERVICE_CONVENTIONS: readonly ServiceConvention[] = ['input', 'indicator'];

type ByVariant<T> = Record<MeasurementView, Record<ServiceConvention, T>>;

export interface Measurement {
  /** GVA by producer (domestic producers only). */
  byProducer: ByVariant<Vector>;
  byPlace: ByVariant<Vector>;
  perJobByPlace: ByVariant<Vector>;
  national: ByVariant<number>;
  /** Real GVA per public-service job, nationally. */
  publicServicesPerJob: ByVariant<number>;
  deflators: { output: Record<string, number>; inputs: number };
}

function variants<T>(make: (view: MeasurementView, convention: ServiceConvention) => T): ByVariant<T> {
  const out = {} as ByVariant<T>;
  for (const view of MEASUREMENT_VIEWS) {
    out[view] = {} as Record<ServiceConvention, T>;
    for (const convention of SERVICE_CONVENTIONS) out[view][convention] = make(view, convention);
  }
  return out;
}

function isPublicService(econ: Economy, j: number): boolean {
  return econ.isGovernment[j] && econ.sectorOf[j] === econ.params.government.provisionSector;
}

export function measurement(record: PeriodRecord): Measurement {
  const { econ, result, base } = record;
  const { params, nDomestic: nd } = econ;
  const pr = result.producers;
  const p = result.prices;
  const p0 = base.prices;
  const x = pr.output;
  const n = econ.ids.length;
  const royaltyRate = (j: number) => (j === econ.royaltyPayer ? params.royalty.rate : 0);

  // Bought-in inputs and royalties of each domestic producer, at base prices.
  const inputsAtBase = filled(nd, 0);
  const royaltyAtBase = filled(nd, 0);
  for (let j = 0; j < nd; j++) {
    let unit = 0;
    for (let i = 0; i < n; i++) unit += econ.A[i][j] * p0[i];
    inputsAtBase[j] = unit * x[j];
    royaltyAtBase[j] = royaltyRate(j) * p0[j] * x[j];
  }

  // Sector output deflators and the national input deflator.
  const current: Record<string, number> = {};
  const atBase: Record<string, number> = {};
  for (let j = 0; j < nd; j++) {
    const s = econ.sectorOf[j];
    current[s] = (current[s] ?? 0) + p[j] * x[j];
    atBase[s] = (atBase[s] ?? 0) + p0[j] * x[j];
  }
  const outputDeflator: Record<string, number> = {};
  for (const s of Object.keys(current)) outputDeflator[s] = atBase[s] === 0 ? 1 : current[s] / atBase[s];
  const inputsCurrent = sum(pr.inputsCost.slice(0, nd)) + sum(pr.royalty.slice(0, nd));
  const inputsBase = sum(inputsAtBase) + sum(royaltyAtBase);
  const inputDeflator = inputsBase === 0 ? 1 : inputsCurrent / inputsBase;

  const serviceVolume = (j: number, convention: ServiceConvention) =>
    convention === 'input'
      ? inputsAtBase[j] + base.wagePerJob[j] * pr.jobs[j] + econ.depreciation[j] * x[j]
      : x[j] * (params.government.quality[econ.places[econ.placeOf[j]]] ?? 1);

  const byProducer = variants((view, convention) =>
    econ.ids.slice(0, nd).map((_, j) => {
      if (view === 'nominal') return pr.gva[j];
      const realInputs = view === 'ownPrice' ? inputsAtBase[j] + royaltyAtBase[j] : (pr.inputsCost[j] + pr.royalty[j]) / inputDeflator;
      if (isPublicService(econ, j)) return serviceVolume(j, convention) - realInputs;
      const realOutput = view === 'ownPrice' ? p0[j] * x[j] : pr.revenue[j] / outputDeflator[econ.sectorOf[j]];
      return realOutput - realInputs;
    }),
  );

  const byPlace = variants((view, convention) => {
    const out = filled(econ.places.length, 0);
    byProducer[view][convention].forEach((gva, j) => (out[econ.placeOf[j]] += gva));
    return out;
  });
  let serviceJobs = 0;
  for (let j = 0; j < nd; j++) if (isPublicService(econ, j)) serviceJobs += pr.jobs[j];

  return {
    byProducer,
    byPlace,
    perJobByPlace: variants((view, convention) => byPlace[view][convention].map((gva, w) => gva / result.workplaces.jobs[w])),
    national: variants((view, convention) => sum(byProducer[view][convention])),
    publicServicesPerJob: variants((view, convention) => {
      let gva = 0;
      byProducer[view][convention].forEach((value, j) => {
        if (isPublicService(econ, j)) gva += value;
      });
      return gva / serviceJobs;
    }),
    deflators: { output: outputDeflator, inputs: inputDeflator },
  };
}
