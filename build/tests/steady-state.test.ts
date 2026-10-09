import { describe, expect, it } from 'vitest';
import { run, type PeriodRecord } from '../src/engine/run';
import type { Scenario } from '../src/engine/scenario';
import { specV1 } from '../src/params/spec-v1-calibrated';

function expectSameVector(actual: number[], expected: number[], label: string, tolerance = 1e-9) {
  actual.forEach((value, i) => {
    const scale = Math.max(Math.abs(expected[i]), 1e-300);
    expect(Math.abs(value - expected[i]) / scale, `${label}[${i}]`).toBeLessThan(tolerance);
  });
}

/** Everything that should be steady in a steady state: flows, prices and stocks. */
function expectSamePeriod(record: PeriodRecord, base: PeriodRecord) {
  const { result: r, money } = record;
  const { result: b } = base;
  const label = (what: string) => `t = ${record.t}: ${what}`;
  expectSameVector(r.prices, b.prices, label('prices'));
  expectSameVector(r.producers.output, b.producers.output, label('output'));
  expectSameVector(r.producers.gva, b.producers.gva, label('GVA'));
  expectSameVector(r.producers.jobs, b.producers.jobs, label('jobs'));
  expectSameVector(r.households.disposableIncome, b.households.disposableIncome, label('disposable income'));
  expectSameVector(r.households.consumption, b.households.consumption, label('consumption'));
  expectSameVector(r.households.unemployed, b.households.unemployed, label('unemployed'));
  expectSameVector(money.households, base.money.households, label('household money'));
  expectSameVector([money.government], [base.money.government], label('government money'));
  const gdp = b.macro.gdpProduction;
  expect(Math.abs(r.macro.gdpProduction / gdp - 1), label('GDP')).toBeLessThan(1e-9);
  // Balances that are zero in the base year stay zero.
  for (const [what, value] of [
    ['current account', r.macro.currentAccount],
    ['government balance', r.government.balance],
    ['firms money', money.firms],
    ['rest-of-world money', money.restOfWorld],
  ] as const) {
    expect(Math.abs(value) / gdp, label(what)).toBeLessThan(1e-9);
  }
}

describe('§16 T3: steady state', () => {
  it('reproduces period 0 in every period from 1 to 40 when nothing changes', () => {
    const records = run(specV1(), null, { periods: 40 });
    expect(records).toHaveLength(41);
    for (const record of records.slice(1)) expectSamePeriod(record, records[0]);
  });

  it('settles each period in a few iterations, starting from the last', () => {
    const records = run(specV1(), null, { periods: 3 });
    for (const record of records.slice(1)) expect(record.result.iterations).toBeLessThanOrEqual(3);
  });
});

describe('S15: freeze-consumption mode', () => {
  const freeze = { period: 1, path: ['households', 'freezeConsumption'], set: true };

  it('changes nothing on its own', () => {
    const records = run(specV1(), { name: 'freeze', description: 'freeze only', changes: [freeze] }, { periods: 10 });
    for (const record of records.slice(1)) expectSamePeriod(record, records[0]);
  });

  it("holds every household's quantities at base-year levels when something else changes", () => {
    const slump: Scenario = { name: 'frozen slump', description: '', changes: [freeze, { period: 5, path: ['exports', 'total'], scale: 0.8 }] };
    const records = run(specV1(), slump, { periods: 8 });
    const base = records[0].result.households.quantities;
    for (const record of records.slice(1)) {
      record.result.households.quantities.forEach((row, r) => expectSameVector(row, base[r], `t = ${record.t}: quantities of place ${r}`, 1e-15));
    }
    // Exports did fall, so output fell even though households' quantities didn't.
    expect(records[5].result.macro.gdpProduction).toBeLessThan(records[4].result.macro.gdpProduction);
  });
});

describe('§14 scenario timing', () => {
  it('leaves the periods before a change untouched and applies the change from its period on', () => {
    const slump: Scenario = { name: 'slump', description: '', changes: [{ period: 5, path: ['exports', 'total'], scale: 0.8 }] };
    const records = run(specV1(), slump, { periods: 6 });
    for (const record of records.slice(1, 5)) expectSamePeriod(record, records[0]);
    expect(records[5].params.exports.total).toBeCloseTo(0.8 * records[0].params.exports.total, 3);
    expect(records[6].params.exports.total).toBe(records[5].params.exports.total);
  });
});
