/**
 * §13 lenses 2 and 3: the whole supply chain behind each final product, through the Leontief
 * inverse L over all producers, domestic and foreign.
 *
 * Lens 2, value capture: producer j captures v_j·L_jk of each unit of final product k, where
 * v_j is j's GVA per unit (for foreign suppliers, their whole price). The offshore IP holder
 * captures the royalty per unit of the paying producer's output. Since p = (v + royalty)·L,
 * the captures sum to the product's price p_k.
 *
 * Lens 3, whole-chain productivity: λ_k = Σ_j ℓ_j·L_jk jobs per unit of k, foreign jobs
 * included, so p_k/λ_k is final value per chain worker, next to on-site GVA per job.
 */

import type { Economy } from '../economy';
import { leontiefInverse } from '../linalg';
import type { PeriodResult } from '../period';
import type { ProducerId } from '../types';

export interface ProductChain {
  product: ProducerId;
  price: number;
  /** Value captured per unit of the final product, by producer, with the IP holder as 'W.IP'. Sums to the price. */
  captureByProducer: Record<string, number>;
  /** The same grouped by place, with foreign suppliers and the IP holder under the rest of the world. */
  captureByPlace: Record<string, number>;
  /** λ_k: jobs in the whole chain per unit of the final product. */
  chainJobsPerUnit: number;
  chainJobsByPlace: Record<string, number>;
  /** p_k / λ_k */
  valuePerChainWorker: number;
  /** The producer's own GVA per job, for comparison. */
  onSiteGvaPerJob: number;
}

export function productChains(econ: Economy, result: PeriodResult): ProductChain[] {
  const p = result.prices;
  const n = econ.ids.length;
  const nd = econ.nDomestic;
  const L = leontiefInverse(econ.A);
  const { restOfWorld, royalty } = econ.params;
  const royaltyPerUnit = (j: number) => (j === econ.royaltyPayer ? royalty.rate * p[j] : 0);
  const gvaPerUnit = p.map((pj, j) => {
    if (j >= nd) return pj;
    let inputs = 0;
    for (let i = 0; i < n; i++) inputs += econ.A[i][j] * p[i];
    return pj - inputs - royaltyPerUnit(j);
  });
  const placeOf = (j: number) => (j < nd ? econ.places[econ.placeOf[j]] : restOfWorld);
  const ipId = `${restOfWorld}.IP`;

  return econ.ids.slice(0, nd).map((product, k) => {
    const captureByProducer: Record<string, number> = {};
    const captureByPlace: Record<string, number> = Object.fromEntries([...econ.places, restOfWorld].map((place) => [place, 0]));
    const chainJobsByPlace: Record<string, number> = { ...captureByPlace };
    let chainJobs = 0;
    for (let j = 0; j < n; j++) {
      const captured = gvaPerUnit[j] * L[j][k];
      captureByProducer[econ.ids[j]] = captured;
      captureByPlace[placeOf(j)] += captured;
      const jobs = econ.jobsPerUnit[j] * L[j][k];
      chainJobs += jobs;
      chainJobsByPlace[placeOf(j)] += jobs;
    }
    const ip = econ.royaltyPayer >= 0 ? royaltyPerUnit(econ.royaltyPayer) * L[econ.royaltyPayer][k] : 0;
    captureByProducer[ipId] = ip;
    captureByPlace[restOfWorld] += ip;
    return {
      product,
      price: p[k],
      captureByProducer,
      captureByPlace,
      chainJobsPerUnit: chainJobs,
      chainJobsByPlace,
      valuePerChainWorker: p[k] / chainJobs,
      onSiteGvaPerJob: gvaPerUnit[k] / econ.jobsPerUnit[k],
    };
  });
}
