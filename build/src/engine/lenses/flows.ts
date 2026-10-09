/**
 * Flows between places, for the map view (views plan 8.2). The nodes are the domestic places,
 * the rest of the world and the government. Each flow type is a matrix: flows[from][to].
 *
 * - commuters: people living in `from` who work in `to`;
 * - wages: £ paid by workplaces in `from` to residents of `to` (commuters earn the same as locals);
 * - dividends: £ paid by producers in `from` to owners in `to`, and by the offshore IP holder
 *   (in the rest of the world) to its owners;
 * - purchases: £ paid by buyers in `from` to sellers in `to`: firms' bought-in inputs and
 *   investment goods, households' consumption, government purchases and exports;
 * - royalties: £ paid by the royalty payer to the IP holder;
 * - taxes and benefits: £ between residents or producers and the government.
 */

import type { Economy } from '../economy';
import { zeros, type Matrix } from '../linalg';
import type { PeriodResult } from '../period';

export const FLOW_TYPES = ['commuters', 'wages', 'dividends', 'purchases', 'royalties', 'taxes', 'benefits'] as const;
export type FlowType = (typeof FLOW_TYPES)[number];

export interface PlaceFlows {
  /** The domestic places, then the rest of the world, then 'Government'. */
  nodes: string[];
  flows: Record<FlowType, Matrix>;
}

export const GOVERNMENT_NODE = 'Government';

export function placeFlows(econ: Economy, result: PeriodResult): PlaceFlows {
  const nPlaces = econ.places.length;
  const W = nPlaces; // rest of the world
  const G = nPlaces + 1; // government
  const nodes = [...econ.places, econ.params.restOfWorld, GOVERNMENT_NODE];
  const size = nodes.length;
  const flows = Object.fromEntries(FLOW_TYPES.map((t) => [t, zeros(size, size)])) as Record<FlowType, Matrix>;
  const p = result.prices;
  const pr = result.producers;
  const n = econ.ids.length;
  const nodeOf = (j: number) => (j < econ.nDomestic ? econ.placeOf[j] : W);

  // Commuters and wages, through the commuting matrix Γ[w][r].
  const gamma = result.commuting;
  for (let w = 0; w < nPlaces; w++) {
    for (let r = 0; r < nPlaces; r++) {
      flows.commuters[r][w] += gamma[w][r] * result.workplaces.jobs[w];
      flows.wages[w][r] += gamma[w][r] * result.workplaces.wageBill[w];
    }
  }

  // Dividends from domestic producers, and from the IP holder abroad.
  for (let j = 0; j < econ.nDomestic; j++) {
    econ.ownerShares[j].forEach((share, g) => (flows.dividends[econ.placeOf[j]][g] += share * pr.dividends[j]));
  }
  result.ip.dividendsByOwner.forEach((amount, g) => (flows.dividends[W][g] += amount));

  // Purchases. Firms: bought-in inputs and investment goods (investment equals each producer's depreciation).
  for (let j = 0; j < econ.nDomestic; j++) {
    const buyer = econ.placeOf[j];
    for (let i = 0; i < n; i++) {
      if (econ.A[i][j] !== 0) flows.purchases[buyer][nodeOf(i)] += econ.A[i][j] * p[i] * pr.output[j];
    }
    for (const { producer, share } of econ.investmentShares) flows.purchases[buyer][nodeOf(producer)] += share * pr.depreciation[j];
  }
  // Households, government and exports.
  result.households.quantities.forEach((row, r) => row.forEach((q, k) => (flows.purchases[r][nodeOf(k)] += p[k] * q)));
  result.finalDemand.government.forEach((q, k) => (flows.purchases[G][nodeOf(k)] += p[k] * q));
  result.finalDemand.exports.forEach((q, k) => (flows.purchases[W][nodeOf(k)] += p[k] * q));

  // Royalties.
  if (econ.royaltyPayer >= 0) flows.royalties[econ.placeOf[econ.royaltyPayer]][W] += result.ip.royalties;

  // Taxes and benefits.
  result.households.incomeTax.forEach((tax, r) => (flows.taxes[r][G] += tax));
  for (let j = 0; j < econ.nDomestic; j++) flows.taxes[econ.placeOf[j]][G] += pr.profitTax[j];
  result.households.benefits.forEach((b, r) => (flows.benefits[G][r] += b));

  return { nodes, flows };
}
