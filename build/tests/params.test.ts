import { describe, expect, it } from 'vitest';
import { compile } from '../src/engine/economy';
import { applyChange, canonicalJson, hash53, paramsAt, type Scenario } from '../src/engine/scenario';
import type { Params } from '../src/engine/types';
import { minimalEconomy } from '../src/params/minimal';
import { COST_TABLE, PLACES, specV1Base } from '../src/params/spec-v1';

/** The spec economy with stand-in values for the three calibrated unknowns. */
function specWithStandIns(): Params {
  const params = specV1Base();
  params.population.mainShare = 0.3;
  params.government.incomeTaxRate = 0.25;
  params.exports.total = 2e10;
  return params;
}

/** True if `value` rounds to the number as printed in the spec, e.g. '7.333e-6' or '54,545'. */
function matchesPrinted(value: number, printed: string): boolean {
  const [mantissa, exponent = '0'] = printed.replace(/,/g, '').split('e');
  const decimals = mantissa.split('.')[1]?.length ?? 0;
  const halfUnit = 0.5 * 10 ** (Number(exponent) - decimals);
  return Math.abs(value - Number(printed.replace(/,/g, ''))) <= halfUnit * (1 + 1e-9);
}

const sectorsByPlace: Record<string, string[]> = {
  C: ['HQ', 'BIZ', 'RET', 'UTL', 'PRV', 'HSG'],
  M: ['CMP', 'FOD', 'RET', 'UTL', 'PRV', 'HSG'],
  R: ['AGR', 'RET', 'UTL', 'PRV', 'HSG'],
};

describe('§5 cost structures', () => {
  const params = specV1Base();

  it('has 17 domestic producers and two foreign suppliers', () => {
    const econ = compile(specWithStandIns());
    expect(econ.nDomestic).toBe(17);
    expect(econ.ids.slice(17)).toEqual(['W.GEN', 'W.ASM']);
    for (const place of PLACES) {
      expect(econ.ids.filter((id) => id.startsWith(`${place}.`)).map((id) => id.slice(2))).toEqual(sectorsByPlace[place]);
    }
  });

  it('sums every row to 1', () => {
    for (const place of PLACES) {
      for (const sector of sectorsByPlace[place]) {
        const row = COST_TABLE[sector];
        const inputs = Object.values(row.inputs(place)).reduce((s, x) => s + x, 0);
        expect(inputs + row.wages + row.depreciation + row.netProfit, `${place}.${sector}`).toBeCloseTo(1, 14);
      }
    }
  });

  it('reproduces the table of jobs per unit of output', () => {
    const printed: Record<string, string> = {
      AGR: '1.2e-5',
      FOD: '7.333e-6',
      CMP: '8.333e-6',
      HQ: '2.0e-6',
      BIZ: '9.0909e-6',
      RET: '1.48148e-5',
      UTL: '7.8947e-6',
      PRV: '2.34375e-5',
      HSG: '7.142857e-7',
    };
    for (const [id, p] of Object.entries(params.producers)) {
      if (p.place === 'W') continue;
      expect(matchesPrinted(p.jobsPerUnit, printed[p.sector]), `${id}: ${p.jobsPerUnit}`).toBe(true);
    }
  });

  it('reproduces the table of base GVA per job', () => {
    const printed: Record<string, string> = {
      HQ: '300,000',
      BIZ: '97,900',
      UTL: '91,200',
      CMP: '63,600',
      FOD: '54,545',
      AGR: '54,167',
      RET: '40,500',
      HSG: '1,260,000',
    };
    for (const [id, p] of Object.entries(params.producers)) {
      if (p.place === 'W') continue;
      const inputs = Object.values(p.inputs).reduce((s, x) => s + x, 0);
      const gvaPerJob = (1 - inputs) / p.jobsPerUnit;
      if (p.sector === 'PRV') expect(gvaPerJob / 35_000, id).toBeCloseTo(1, 2); // "about £35,000"
      else expect(matchesPrinted(gvaPerJob, printed[p.sector]), `${id}: ${gvaPerJob}`).toBe(true);
    }
  });

  it('reproduces the table of base markups (§6)', () => {
    const printed: Record<string, string> = {
      AGR: '0.538462',
      FOD: '0.219512',
      CMP: '0.298701',
      BIZ: '0.639344',
      RET: '0.25',
      UTL: '0.724138',
    };
    for (const [id, p] of Object.entries(params.producers)) {
      if (p.pricing === 'markup') expect(matchesPrinted(p.markup, printed[p.sector]), `${id}: ${p.markup}`).toBe(true);
    }
  });

  it('has display units consistent with the cost table', () => {
    const { producers, households, demography } = params;
    // Each £700 gadget uses one £140 component set and one £56 assembly.
    expect(producers['C.HQ'].displayPrice * producers['C.HQ'].inputs['M.CMP']).toBeCloseTo(producers['M.CMP'].displayPrice, 10);
    expect(producers['C.HQ'].displayPrice * producers['C.HQ'].inputs['W.ASM']).toBeCloseTo(producers['W.ASM'].displayPrice, 10);
    expect(producers['R.AGR'].displayPrice).toBe(0.35);
    expect(producers['M.FOD'].displayPrice).toBe(0.5);
    // A dwelling-year costs rent per resident times persons per dwelling.
    for (const place of PLACES) {
      expect(producers[`${place}.HSG`].displayPrice).toBeCloseTo(households.essentialsPerResident.HSG[place] * demography[place].personsPerDwelling, 8);
    }
  });
});

describe('compiling a parameter set', () => {
  it('compiles the minimal economy', () => {
    const econ = compile(minimalEconomy());
    expect(econ.ids).toEqual(['A.F', 'A.S']);
    expect(econ.A[0][1]).toBe(0.5);
  });

  it('splits the population as §3 says', () => {
    const econ = compile(specWithStandIns());
    expect(econ.population[0]).toBeCloseTo(0.3 * 1.8e6, 6);
    expect(econ.population[1]).toBeCloseTo((2 / 3) * 0.7 * 1.8e6, 6);
    expect(econ.population[2]).toBeCloseTo((1 / 3) * 0.7 * 1.8e6, 6);
    expect(econ.labourForce[0]).toBeCloseTo(0.3 * 1.8e6 * 0.66 * 0.8, 6);
    expect(econ.nonWorking[2]).toBeCloseTo((1 / 3) * 0.7 * 1.8e6 * (1 - 0.58), 6);
  });

  it('reports every problem it finds', () => {
    const params = specWithStandIns();
    params.producers['C.BIZ'].inputs['C.XYZ'] = 0.1;
    params.firms.FoodCo.owners.W = 0.3;
    expect(() => compile(params)).toThrow(/unknown supplier "C.XYZ"[\s\S]*FoodCo: ownership shares sum to 1\.1/);
  });
});

describe('§14 scenarios', () => {
  it('sets and scales values without changing the original', () => {
    const base = specWithStandIns();
    const squeezed = applyChange(base, { period: 5, path: ['producers', 'R.AGR', 'markup'], set: 0.4 });
    expect(squeezed.producers['R.AGR'].markup).toBe(0.4);
    expect(base.producers['R.AGR'].markup).toBeCloseTo(0.538462, 6);
    const dearer = applyChange(base, { period: 5, path: ['producers', 'C.HSG', 'fixedPrice'], scale: 1.3 });
    expect(dearer.producers['C.HSG'].fixedPrice).toBeCloseTo(1.3, 15);
    const local = applyChange(base, { period: 5, path: ['producers', 'M.PRV', 'inputs', 'M.RET'], add: 0.02 });
    expect(local.producers['M.PRV'].inputs['M.RET']).toBeCloseTo(0.06, 15);
  });

  it('rejects unknown paths and malformed changes', () => {
    const base = specWithStandIns();
    expect(() => applyChange(base, { period: 5, path: ['producers', 'R.AGR', 'markpu'], set: 0.4 })).toThrow(/Unknown parameter: producers.R.AGR.markpu/);
    expect(() => applyChange(base, { period: 5, path: ['producers', 'R.AGR', 'markup'] })).toThrow(/exactly one/);
    expect(() => applyChange(base, { period: 5, path: ['producers', 'R.AGR', 'markup'], set: 0.4, add: 0.1 })).toThrow(/exactly one/);
    expect(() => applyChange(base, { period: 5, path: ['producers', 'R.AGR', 'description'], scale: 2 })).toThrow(/isn't a number/);
  });

  it('applies changes from their period onwards, in order', () => {
    const base = specWithStandIns();
    const scenario: Scenario = {
      name: 'test',
      description: 'two changes to the same value',
      changes: [
        { period: 8, path: ['government', 'profitTaxRate'], scale: 2 },
        { period: 5, path: ['government', 'profitTaxRate'], set: 0.3 },
      ],
    };
    expect(paramsAt(base, scenario, 4).government.profitTaxRate).toBe(0.25);
    expect(paramsAt(base, scenario, 5).government.profitTaxRate).toBe(0.3);
    expect(paramsAt(base, scenario, 40).government.profitTaxRate).toBeCloseTo(0.6, 15);
  });

  it("doesn't let a scenario change the base year", () => {
    const scenario: Scenario = { name: 'bad', description: '', changes: [{ period: 0, path: ['exports', 'total'], scale: 2 }] };
    expect(() => paramsAt(specWithStandIns(), scenario, 3)).toThrow(/changes start from period 1/);
  });

  it('fingerprints parameters regardless of key order', () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 3, c: 4 }] })).toBe('{"a":[2,{"c":4,"d":3}],"b":1}');
    expect(hash53(canonicalJson({ a: 1, b: 2 }))).toBe(hash53(canonicalJson({ b: 2, a: 1 })));
    expect(hash53('a')).not.toBe(hash53('b'));
  });
});
