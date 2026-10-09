/**
 * §10–§11: running the model over time. Period 0 is the base year. In each later period the
 * scenario's changes in force are applied, prices are solved from last period's, then
 * quantities and incomes, then the stocks are updated and the identities checked.
 */

import { assertIdentities } from './checks';
import { compile, type Economy } from './economy';
import { filled, sum, type Vector } from './linalg';
import { solvePeriod, type PeriodResult } from './period';
import { solvePrices } from './prices';
import { changesInForce, paramsAt, type Scenario } from './scenario';
import type { Params } from './types';

/** §10: the single financial asset, money, issued by the government. Stocks at the end of a period. */
export interface MoneyStocks {
  /** By place. */
  households: Vector;
  firms: number;
  /** Negative: government debt. */
  government: number;
  /** Includes the IP holder's retained royalties. */
  restOfWorld: number;
}

export interface PeriodRecord {
  t: number;
  params: Params;
  econ: Economy;
  result: PeriodResult;
  money: MoneyStocks;
  /** Base-year prices and wages per job, by producer: the measurement lens values volumes at these. */
  base: { prices: Vector; wagePerJob: Vector };
}

export interface RunOptions {
  /** The last period to run; default runs go to 40 (§2). */
  periods: number;
  /** Households' money at the end of the base year, by place. Defaults to the steady state of §12. */
  initialHouseholdMoney?: Vector;
}

export function run(base: Params, scenario: Scenario | null, options: RunOptions): PeriodRecord[] {
  const econ0 = compile(base);
  const nPlaces = econ0.places.length;
  const result0 = solvePeriod({
    econ: econ0,
    prices: solvePrices(econ0),
    mode: 'base',
    householdMoney: filled(nPlaces, 0),
    commuting: null,
    frozenQuantities: null,
  });
  // §12: households start with steady-state money, (1 − α₁)·YD/α₂; firms and the rest of the
  // world with none; the government owes the rest.
  const { alpha1, alpha2 } = base.households;
  const households0 = options.initialHouseholdMoney?.slice() ?? result0.households.disposableIncome.map((yd) => ((1 - alpha1) * yd) / alpha2);
  const money0: MoneyStocks = { households: households0, firms: 0, government: -sum(households0), restOfWorld: 0 };
  assertIdentities(0, econ0, result0, money0);
  const baseYear = { prices: result0.prices, wagePerJob: econ0.wagePerJob };
  const records: PeriodRecord[] = [{ t: 0, params: base, econ: econ0, result: result0, money: money0, base: baseYear }];

  // After the base year, commuting is fixed at the base-year matrix unless a scenario overrides it.
  const baseCommuting = result0.commuting;
  const baseQuantities = result0.households.quantities;
  let params = base;
  let econ = econ0;
  let inForce = 0;
  for (let t = 1; t <= options.periods; t++) {
    const count = changesInForce(scenario, t);
    if (count !== inForce) {
      params = paramsAt(base, scenario, t);
      econ = compile(params);
      inForce = count;
    }
    const previous = records[t - 1];
    const result = solvePeriod({
      econ,
      prices: solvePrices(econ, previous.result.prices),
      mode: 'normal',
      householdMoney: previous.money.households,
      commuting: params.commuting.override ?? baseCommuting,
      frozenQuantities: params.households.freezeConsumption ? baseQuantities : null,
      start: { output: previous.result.producers.output, disposableIncome: previous.result.households.disposableIncome },
    });
    const money: MoneyStocks = {
      households: previous.money.households.map((m, r) => m + result.households.saving[r]),
      firms: previous.money.firms + result.firms.retained,
      government: previous.money.government + result.government.balance,
      restOfWorld: previous.money.restOfWorld + result.restOfWorld.balance,
    };
    assertIdentities(t, econ, result, money);
    records.push({ t, params, econ, result, money, base: baseYear });
  }
  return records;
}
