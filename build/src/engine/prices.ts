/**
 * §6: prices. They are solved first in each period, and in v1 they don't depend on quantities.
 *
 * - markup producers: p_j = (1 + μ_j)(Σ_i a_ij p_i + ω_j ℓ_j), a markup on prime cost;
 * - cost-price producers (public services): p_j = Σ_i a_ij p_i + ω_j ℓ_j + δ_j;
 * - fixed-price producers: p_j = p̄_j.
 */

import type { Economy } from './economy';
import { filled, solve, zeros, maxRelativeChange, type Vector } from './linalg';

export const PRICE_TOLERANCE = 1e-12;
const MAX_ITERATIONS = 10_000;

function unitLabourCost(econ: Economy, j: number): number {
  return econ.wagePerJob[j] * econ.jobsPerUnit[j];
}

function priceGiven(econ: Economy, j: number, p: Vector): number {
  if (econ.pricing[j] === 'fixed') return econ.fixedPrice[j];
  let inputs = 0;
  for (let i = 0; i < p.length; i++) inputs += econ.A[i][j] * p[i];
  const primeCost = inputs + unitLabourCost(econ, j);
  return econ.pricing[j] === 'markup' ? (1 + econ.markup[j]) * primeCost : primeCost + econ.depreciation[j];
}

/** Iterates the price equations from `start` (normally last period's prices) until the relative change is below 10⁻¹², as §6 says. */
export function solvePrices(econ: Economy, start: Vector = filled(econ.ids.length, 1)): Vector {
  let p = start.slice();
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const next = p.map((_, j) => priceGiven(econ, j, p));
    if (maxRelativeChange(next, p) < PRICE_TOLERANCE) return next;
    p = next;
  }
  throw new Error(`Prices did not converge in ${MAX_ITERATIONS} iterations: are the markups too high for the input coefficients?`);
}

/** Solves the same price equations directly, as one linear system. Used to check `solvePrices`. */
export function solvePricesDirect(econ: Economy): Vector {
  const n = econ.ids.length;
  const m = zeros(n, n);
  const b = filled(n, 0);
  for (let j = 0; j < n; j++) {
    m[j][j] = 1;
    if (econ.pricing[j] === 'fixed') {
      b[j] = econ.fixedPrice[j];
      continue;
    }
    const k = econ.pricing[j] === 'markup' ? 1 + econ.markup[j] : 1;
    for (let i = 0; i < n; i++) m[j][i] -= k * econ.A[i][j];
    b[j] = k * unitLabourCost(econ, j) + (econ.pricing[j] === 'cost' ? econ.depreciation[j] : 0);
  }
  return solve(m, b);
}
