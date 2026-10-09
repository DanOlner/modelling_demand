import { describe, expect, it } from 'vitest';
import { compile } from '../src/engine/economy';
import { solvePrices, solvePricesDirect } from '../src/engine/prices';
import { applyChange } from '../src/engine/scenario';
import type { Params } from '../src/engine/types';
import { minimalEconomy } from '../src/params/minimal';
import { specV1Base } from '../src/params/spec-v1';

/** Prices don't depend on the calibrated unknowns, but compiling needs values for them. */
function specWithStandIns(): Params {
  const params = specV1Base();
  params.population.mainShare = 0.3;
  params.government.incomeTaxRate = 0.25;
  params.exports.total = 2e10;
  return params;
}

const relative = (actual: number, expected: number) => Math.abs(actual / expected - 1);

describe('§6 price solve', () => {
  it('T9: doubling the farm wage in the minimal economy gives p_F = 2 and p_S = 1.625', () => {
    const params = applyChange(minimalEconomy(), { period: 1, path: ['producers', 'A.F', 'wagePerJob'], scale: 2 });
    const econ = compile(params);
    const p = solvePrices(econ);
    expect(relative(p[econ.index['A.F']], 2)).toBeLessThan(1e-9);
    expect(relative(p[econ.index['A.S']], 1.625)).toBeLessThan(1e-9);
  });

  it('gives base prices of 1 in the minimal economy', () => {
    solvePrices(compile(minimalEconomy())).forEach((p) => expect(relative(p, 1)).toBeLessThan(1e-12));
  });

  it('gives every base price as exactly 1 in the spec economy', () => {
    const econ = compile(specWithStandIns());
    const p = solvePrices(econ);
    p.forEach((price, j) => expect(relative(price, 1), econ.ids[j]).toBeLessThan(1e-12));
  });

  it('agrees with a direct linear solve, at base and after a markup change', () => {
    const base = specWithStandIns();
    const changed = applyChange(applyChange(base, { period: 1, path: ['producers', 'R.AGR', 'markup'], set: 0.4 }), {
      period: 1,
      path: ['producers', 'C.UTL', 'wagePerJob'],
      scale: 1.2,
    });
    for (const params of [base, changed]) {
      const econ = compile(params);
      const iterated = solvePrices(econ);
      const direct = solvePricesDirect(econ);
      iterated.forEach((p, j) => expect(relative(p, direct[j]), econ.ids[j]).toBeLessThan(1e-12));
    }
  });

  it('gives the E2 supermarket-squeeze prices exactly (checked again in T5)', () => {
    let params = specWithStandIns();
    for (const [id, markup] of [['R.AGR', 0.4], ['M.FOD', 0.1], ['C.RET', 0.28], ['M.RET', 0.28], ['R.RET', 0.28]] as const) {
      params = applyChange(params, { period: 5, path: ['producers', id, 'markup'], set: markup });
    }
    const econ = compile(params);
    const p = solvePrices(econ);
    expect(relative(p[econ.index['R.AGR']], 0.91)).toBeLessThan(1e-9);
    expect(relative(p[econ.index['M.FOD']], 0.8624)).toBeLessThan(1e-9);
    for (const place of ['C', 'M', 'R']) expect(relative(p[econ.index[`${place}.RET`]], 1.28 * 0.777984)).toBeLessThan(1e-9);
  });
});
