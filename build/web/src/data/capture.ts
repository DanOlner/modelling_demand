/** Value capture per final product (views plan 8.4), from lenses 2 and 3. */

import type { PeriodRecord } from '../../../src/engine/run';
import { lensesOf } from './model';

export const CAPTURE_PLACES = ['C', 'M', 'R', 'W'] as const;

export interface CaptureSegment {
  place: string;
  /** Per £1 of final price, or £ per physical unit, depending on `perUnit`. */
  value: number;
  share: number;
  /** The producers inside the segment, largest first. */
  detail: { id: string; value: number }[];
}

export interface CaptureBar {
  product: string;
  price: number;
  /** £ per physical unit: S. */
  unitPrice: number;
  unit: string;
  segments: CaptureSegment[];
  valuePerChainWorker: number;
  onSiteGvaPerJob: number;
  chainJobsAbroadShare: number;
}

export function captureBar(record: PeriodRecord, product: string, perUnit: boolean): CaptureBar {
  const chain = lensesOf(record).chains.find((c) => c.product === product);
  if (!chain) throw new Error(`"${product}" is not a final product`);
  const p = record.params.producers[product];
  const unitPrice = chain.price * p.displayPrice;
  const scale = perUnit ? p.displayPrice : 1 / chain.price;
  const placeOf = (id: string) => id.split('.')[0];
  const segments = CAPTURE_PLACES.map((place) => {
    const detail = Object.entries(chain.captureByProducer)
      .filter(([id, v]) => placeOf(id) === place && Math.abs(v) > 1e-12)
      .map(([id, v]) => ({ id, value: v * scale }))
      .sort((a, b) => b.value - a.value);
    const total = chain.captureByPlace[place] ?? 0;
    return { place, value: total * scale, share: total / chain.price, detail };
  });
  return {
    product,
    price: chain.price,
    unitPrice,
    unit: p.displayUnit,
    segments,
    valuePerChainWorker: chain.valuePerChainWorker,
    onSiteGvaPerJob: chain.onSiteGvaPerJob,
    chainJobsAbroadShare: (chain.chainJobsByPlace.W ?? 0) / chain.chainJobsPerUnit,
  };
}

/** The products shown by default: a gadget, a basket and an hour of public services in each place. */
export const FEATURED_PRODUCTS = ['C.HQ', 'C.RET', 'M.RET', 'R.RET', 'C.PRV', 'M.PRV', 'R.PRV'];
