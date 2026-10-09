/**
 * §12: calibrating the base year (period 0). Three unknowns are solved for:
 * - total exports X, so that the current account is zero;
 * - the income tax rate θ, so that national unemployment is u* (5%);
 * - the main place's population share s_C, so that in-commuters fill c* (15%) of its jobs.
 *
 * Nested root-finding, as §12 suggests: s_C on the outside, θ in the middle, X on the
 * inside. Each level uses Brent's method, which keeps a bracket like bisection does but
 * converges much faster. Each target pulls one way: more exports improve the current
 * account; a higher tax rate lowers consumption and raises unemployment; a smaller city
 * raises in-commuting.
 */

import { inCommutingShare } from './commuting';
import { compile, type Economy } from './economy';
import { filled, type Vector } from './linalg';
import { solvePeriod, type PeriodResult } from './period';
import { solvePrices } from './prices';
import { brent } from './rootfind';
import { canonicalJson, cloneJson, hash53 } from './scenario';
import type { Params } from './types';

export interface CalibratedValues {
  /** X: total exports at base prices. */
  exportsTotal: number;
  /** θ */
  incomeTaxRate: number;
  /** s_C */
  mainShare: number;
}

export interface Calibration extends CalibratedValues {
  /** Fingerprint of the base parameters the calibration was made for. */
  fingerprint: string;
}

export function withCalibration(params: Params, values: CalibratedValues): Params {
  const next = cloneJson(params);
  next.exports.total = values.exportsTotal;
  next.government.incomeTaxRate = values.incomeTaxRate;
  next.population.mainShare = values.mainShare;
  return next;
}

/** A fingerprint of everything in the base parameters except the three calibrated values. */
export function baseFingerprint(params: Params): string {
  return hash53(canonicalJson(withCalibration(params, { exportsTotal: 0, incomeTaxRate: 0, mainShare: 0 })));
}

export interface BaseYear {
  econ: Economy;
  prices: Vector;
  result: PeriodResult;
}

/** Period 0: households spend exactly their disposable income, and commuting follows the base-year rule. */
export function solveBaseYear(params: Params, start?: { output: Vector; disposableIncome: Vector }): BaseYear {
  const econ = compile(params);
  const prices = solvePrices(econ);
  const result = solvePeriod({
    econ,
    prices,
    mode: 'base',
    householdMoney: filled(econ.places.length, 0),
    commuting: null,
    frozenQuantities: null,
    start,
  });
  return { econ, prices, result };
}

/** Solves for X, θ and s_C. Throws if a target can't be reached inside the search ranges. */
export function calibrate(params: Params): Calibration {
  const settings = params.calibration;
  if (!settings) throw new Error(`"${params.name}" has no calibration settings`);
  const { targets } = settings;
  const main = params.places.indexOf(params.population.mainPlace);

  // Each solve starts from the previous one's solution, which saves most of the iterations.
  let warm: { output: Vector; disposableIncome: Vector } | undefined;
  const evaluate = (values: CalibratedValues): PeriodResult => {
    const { result } = solveBaseYear(withCalibration(params, values), warm);
    warm = { output: result.producers.output, disposableIncome: result.households.disposableIncome };
    return result;
  };

  let lastExports = 0;
  const solveExports = (mainShare: number, incomeTaxRate: number): number => {
    const gap = (exportsTotal: number) => evaluate({ exportsTotal, incomeTaxRate, mainShare }).macro.currentAccount - targets.currentAccount;
    // The current account rises with exports. With none it is in deficit; double from the
    // last solution until it is in surplus.
    let hi = lastExports > 0 ? 1.25 * lastExports : 1e9;
    for (let doublings = 0; gap(hi) < 0; doublings++) {
      if (doublings === 60) throw new Error('No level of exports balances the current account');
      hi *= 2;
    }
    lastExports = brent(gap, 0, hi, { xtol: 1e-13 * hi, label: `Exports X (s_C = ${mainShare}, θ = ${incomeTaxRate})` });
    return lastExports;
  };

  const solveTaxRate = (mainShare: number): number => {
    const [lo, hi] = settings.incomeTaxRateRange;
    const unemploymentGap = (incomeTaxRate: number) => {
      const exportsTotal = solveExports(mainShare, incomeTaxRate);
      return evaluate({ exportsTotal, incomeTaxRate, mainShare }).macro.unemploymentRate - targets.unemploymentRate;
    };
    return brent(unemploymentGap, lo, hi, { xtol: 1e-14, label: `Income tax rate θ (s_C = ${mainShare})` });
  };

  const inCommutingGap = (mainShare: number) => {
    const incomeTaxRate = solveTaxRate(mainShare);
    const exportsTotal = solveExports(mainShare, incomeTaxRate);
    const result = evaluate({ exportsTotal, incomeTaxRate, mainShare });
    return inCommutingShare(result.commuting, main) - targets.mainPlaceInCommuting;
  };

  const [lo, hi] = settings.mainShareRange;
  const mainShare = brent(inCommutingGap, lo, hi, { xtol: 1e-14, label: 'Population share of the main place s_C' });
  const incomeTaxRate = solveTaxRate(mainShare);
  const exportsTotal = solveExports(mainShare, incomeTaxRate);
  return { exportsTotal, incomeTaxRate, mainShare, fingerprint: baseFingerprint(params) };
}
