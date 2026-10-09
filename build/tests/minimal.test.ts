import { describe, expect, it } from 'vitest';
import { compile } from '../src/engine/economy';
import { identityChecks } from '../src/engine/checks';
import { run, type PeriodRecord } from '../src/engine/run';
import type { Scenario } from '../src/engine/scenario';
import { minimalEconomy } from '../src/params/minimal';

const S = compile(minimalEconomy()).index['A.S'];
const F = compile(minimalEconomy()).index['A.F'];

function expectRelative(actual: number, expected: number, tolerance = 1e-9) {
  expect(Math.abs(actual / expected - 1), `${actual} vs ${expected}`).toBeLessThan(tolerance);
}

const totals = (record: PeriodRecord) => {
  const { producers, households } = record.result;
  const add = (v: number[]) => v.reduce((s, x) => s + x, 0);
  return {
    shop: producers.output[S],
    farm: producers.output[F],
    wages: add(producers.wageBill),
    profits: add(producers.netProfit),
    taxes: add(households.incomeTax),
    disposableIncome: households.disposableIncome[0],
    consumption: households.consumption[0],
    money: record.money.households[0],
  };
};

describe('§16 T8: the minimal test economy', () => {
  it('reproduces the base year: S = 100, F = 50, wages 55, profits 45, taxes 20, YD = 80, money 80', () => {
    const [base] = run(minimalEconomy(), null, { periods: 0 });
    const v = totals(base);
    expectRelative(v.shop, 100);
    expectRelative(v.farm, 50);
    expectRelative(v.wages, 55);
    expectRelative(v.profits, 45);
    expectRelative(v.taxes, 20);
    expectRelative(v.disposableIncome, 80);
    expectRelative(v.money, 80);
    expect(base.result.commuting).toEqual([[1]]);
  });

  const governmentUp: Scenario = {
    name: 'T8',
    description: 'Government purchases rise from 20 to 25 at t = 1',
    changes: [{ period: 1, path: ['government', 'provisionPerResident'], set: 0.25 }],
  };

  it('reproduces period 1 after G rises to 25', () => {
    const records = run(minimalEconomy(), governmentUp, { periods: 1 });
    const v = totals(records[1]);
    // S = C + G with C = 0.6·YD + 0.4·80 and YD = 0.8·S, so S = 57/0.52.
    const shop = 57 / 0.52;
    expectRelative(v.shop, shop); // 109.6154
    expectRelative(v.farm, shop / 2); // 54.8077
    expectRelative(v.disposableIncome, 0.8 * shop); // 87.6923
    expectRelative(v.consumption, 0.6 * 0.8 * shop + 32); // 84.6154
    expectRelative(v.money, 80 + 0.8 * shop - (0.6 * 0.8 * shop + 32)); // 83.0769
    // And against the figures as the spec prints them.
    expect(v.shop).toBeCloseTo(109.6154, 4);
    expect(v.farm).toBeCloseTo(54.8077, 4);
    expect(v.disposableIncome).toBeCloseTo(87.6923, 4);
    expect(v.consumption).toBeCloseTo(84.6154, 4);
    expect(v.money).toBeCloseTo(83.0769, 4);
  });

  it('converges in the long run to S = 125, YD = 100 and money of 100', () => {
    // Money converges geometrically, by a factor of about 0.85 a period, so 300 periods is plenty.
    const records = run(minimalEconomy(), governmentUp, { periods: 300 });
    const v = totals(records[300]);
    expectRelative(v.shop, 125);
    expectRelative(v.disposableIncome, 100);
    expectRelative(v.money, 100);
  });

  it('keeps every accounting identity in every period', () => {
    for (const record of run(minimalEconomy(), governmentUp, { periods: 40 })) {
      for (const check of identityChecks(record.econ, record.result, record.money)) {
        expect(check.error, `t = ${record.t}: ${check.name}`).toBeLessThan(1e-12);
      }
    }
  });
});

describe('extra check: the Godley–Lavoie SIM path', () => {
  it('starting from zero money with G = 20, output follows 38.4615, 47.9290, 55.9399', () => {
    // From agent-based-firm-demand-models.md: SIM with α₁ = 0.6, α₂ = 0.4, θ = 0.2 and G = 20.
    // Here output S plays the part of SIM's Y, since all income goes to households.
    const records = run(minimalEconomy(), null, { periods: 3, initialHouseholdMoney: [0] });
    let money = 0;
    for (const t of [1, 2, 3]) {
      const shop = (20 + 0.4 * money) / (1 - 0.6 * 0.8);
      const disposable = 0.8 * shop;
      money += disposable - (0.6 * disposable + 0.4 * money);
      expectRelative(totals(records[t]).shop, shop);
      expectRelative(totals(records[t]).money, money);
    }
    expect(totals(records[1]).shop).toBeCloseTo(38.461538, 6);
    expect(totals(records[2]).shop).toBeCloseTo(47.928994, 6);
    expect(totals(records[3]).shop).toBeCloseTo(55.939918, 6);
  });
});
