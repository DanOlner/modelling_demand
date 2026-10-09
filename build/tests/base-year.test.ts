import { describe, expect, it } from 'vitest';
import { baseFingerprint, calibrate, solveBaseYear } from '../src/engine/calibrate';
import { identityChecks } from '../src/engine/checks';
import { baseYearCommuting, inCommutingShare } from '../src/engine/commuting';
import { compile } from '../src/engine/economy';
import { matVec, sum, transpose } from '../src/engine/linalg';
import { plausibilityReport } from '../src/engine/plausibility';
import { run } from '../src/engine/run';
import { specV1Base } from '../src/params/spec-v1';
import { specV1 } from '../src/params/spec-v1-calibrated';
import { specV1Calibration } from '../src/params/spec-v1.calibration';

const relative = (actual: number, expected: number) => Math.abs(actual / expected - 1);

describe('§9 base-year commuting rule', () => {
  it('works through a hand example', () => {
    // 170 jobs and a labour force of 190, so every place's target employment rate is 170/190.
    const jobs = [100, 50, 20];
    const labourForce = [80, 60, 50];
    const gamma = baseYearCommuting(jobs, labourForce);
    const target = labourForce.map((lf) => (lf * 170) / 190);
    // Places 2 and 3 fill their own jobs and send their surplus residents to place 1.
    expect(gamma[0][0]).toBeCloseTo(target[0] / 100, 14);
    expect(gamma[0][1]).toBeCloseTo((target[1] - 50) / 100, 14);
    expect(gamma[0][2]).toBeCloseTo((target[2] - 20) / 100, 14);
    expect(gamma[1]).toEqual([0, 1, 0]);
    expect(gamma[2]).toEqual([0, 0, 1]);
    gamma.forEach((row) => expect(sum(row)).toBeCloseTo(1, 14));
    // Employed residents by place, Γᵀ·jobs, hit the targets exactly.
    matVec(transpose(gamma), jobs).forEach((employed, r) => expect(employed).toBeCloseTo(target[r], 12));
    expect(inCommutingShare(gamma, 0)).toBeCloseTo(1 - target[0] / 100, 14);
  });
});

describe('§12 base-year calibration', () => {
  it('refuses to run the uncalibrated parameters', () => {
    expect(() => compile(specV1Base())).toThrow(/set by calibration/);
  });

  it('has a stored calibration that matches the current base parameters', () => {
    expect(specV1Calibration.fingerprint).toBe(baseFingerprint(specV1Base()));
    expect(() => specV1()).not.toThrow();
  });

  it('reproduces the stored values when calibrated again from scratch', () => {
    const fresh = calibrate(specV1Base());
    expect(relative(fresh.exportsTotal, specV1Calibration.exportsTotal)).toBeLessThan(1e-9);
    expect(relative(fresh.incomeTaxRate, specV1Calibration.incomeTaxRate)).toBeLessThan(1e-9);
    expect(relative(fresh.mainShare, specV1Calibration.mainShare)).toBeLessThan(1e-9);
  }, 60_000);
});

describe('§16 T2: the base year', () => {
  const { econ, result } = solveBaseYear(specV1());
  const gdp = result.macro.gdpProduction;

  it('has every price at 1', () => {
    result.prices.forEach((p, j) => expect(relative(p, 1), econ.ids[j]).toBeLessThan(1e-12));
  });

  it('has a current account and government balance of zero', () => {
    expect(Math.abs(result.macro.currentAccount) / gdp).toBeLessThan(1e-9);
    expect(Math.abs(result.government.balance) / gdp).toBeLessThan(1e-9);
  });

  it('has 5% unemployment in every place', () => {
    result.households.unemployed.forEach((u, r) => expect(relative(u / result.households.labourForce[r], 0.05), econ.places[r]).toBeLessThan(1e-9));
  });

  it('has 15% of city jobs filled by in-commuters', () => {
    expect(relative(inCommutingShare(result.commuting, econ.places.indexOf('C')), 0.15)).toBeLessThan(1e-9);
  });

  it('is a steady state: households spend their income and firms pay out all profit', () => {
    result.households.saving.forEach((s, r) => expect(Math.abs(s) / result.households.disposableIncome[r]).toBeLessThan(1e-9));
    expect(Math.abs(result.firms.retained) / gdp).toBeLessThan(1e-12);
    expect(Math.abs(result.macro.investment - sum(result.producers.depreciation)) / gdp).toBeLessThan(1e-12);
    expect(result.flags).toEqual([]);
  });

  it('T1: satisfies every accounting identity', () => {
    const [record] = run(specV1(), null, { periods: 0 });
    // §12: households start with steady-state money, which is one year's disposable income with the defaults.
    record.money.households.forEach((m, r) => expect(relative(m, record.result.households.disposableIncome[r])).toBeLessThan(1e-12));
    for (const check of identityChecks(record.econ, record.result, record.money)) expect(check.error, check.name).toBeLessThan(1e-9);
  });

  it('is inside every plausibility range (§12: results outside a range go back to the user, not into tuning)', () => {
    for (const row of plausibilityReport(econ, result)) expect(row.ok, `${row.label}: ${row.detail ?? row.value}`).toBe(true);
  });
});
