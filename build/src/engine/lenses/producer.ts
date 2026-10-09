/**
 * §13 lens 11: the single-producer view, Webber & Huaccha's 2D rectangle, in physical units.
 * - S = p_j·π⁰_j, the price per physical unit;
 * - C = (Σ_i a_ij·p_i + royalty per unit)·π⁰_j, bought-in cost per physical unit;
 * - Q = x_j/π⁰_j, physical units sold; L = jobs.
 * Revenue is S·Q and GVA is (S − C)·Q. The margin S − C splits into bands per unit for
 * wages, depreciation and net profit (taxes on production are zero in v1).
 *
 * isoGVA curves join the (Q, height) points with the same GVA. With the margin S − C as the
 * height the curve is margin = GVA/Q. In the paper's version the height is S/C, and the
 * curve is S/C = 1 + GVA/(C·Q), which depends on C, so it holds C at the producer's value.
 */

import type { Economy } from '../economy';
import type { PeriodResult } from '../period';
import type { ProducerId } from '../types';

export interface ProducerRectangle {
  producer: ProducerId;
  unit: string;
  S: number;
  C: number;
  Q: number;
  L: number;
  revenue: number;
  gva: number;
  /** S − C, GVA per physical unit. */
  margin: number;
  /** S/C, the paper's vertical axis. */
  ratio: number;
  /** Per physical unit; they sum to the margin. */
  bands: { wages: number; depreciation: number; netProfit: number };
  gvaPerJob: number;
}

export function producerRectangle(econ: Economy, result: PeriodResult, id: ProducerId): ProducerRectangle {
  const j = econ.index[id];
  if (j === undefined || j >= econ.nDomestic) throw new Error(`"${id}" is not a domestic producer`);
  const p = result.prices;
  const pr = result.producers;
  const displayPrice = econ.params.producers[id].displayPrice;
  let unitInputs = 0;
  for (let i = 0; i < econ.ids.length; i++) unitInputs += econ.A[i][j] * p[i];
  const royaltyPerUnit = j === econ.royaltyPayer ? econ.params.royalty.rate * p[j] : 0;
  const S = p[j] * displayPrice;
  const C = (unitInputs + royaltyPerUnit) * displayPrice;
  const wages = econ.wagePerJob[j] * econ.jobsPerUnit[j] * displayPrice;
  const depreciation = econ.depreciation[j] * displayPrice;
  return {
    producer: id,
    unit: econ.params.producers[id].displayUnit,
    S,
    C,
    Q: pr.output[j] / displayPrice,
    L: pr.jobs[j],
    revenue: pr.revenue[j],
    gva: pr.gva[j],
    margin: S - C,
    ratio: S / C,
    bands: { wages, depreciation, netProfit: S - C - wages - depreciation },
    gvaPerJob: pr.gva[j] / pr.jobs[j],
  };
}

export interface IsoGvaPoint {
  Q: number;
  /** The margin S − C at which GVA is unchanged. */
  margin: number;
  /** The paper's S/C at which GVA is unchanged, holding C fixed. */
  ratio: number;
}

/** Points on the isoGVA curve for a given GVA, in both forms; `unitCost` is the C held fixed in the S/C form. */
export function isoGvaCurve(gva: number, unitCost: number, quantities: number[]): IsoGvaPoint[] {
  return quantities.map((Q) => ({ Q, margin: gva / Q, ratio: 1 + gva / (unitCost * Q) }));
}
