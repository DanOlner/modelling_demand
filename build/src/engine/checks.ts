/**
 * §16 T1: the accounting identities, checked in every period of every run. A run that
 * breaks one stops with an error, since every result after it would be suspect.
 */

import type { Economy } from './economy';
import type { PeriodResult } from './period';
import type { MoneyStocks } from './run';

/** Identities must hold to within this share of GDP (§2). */
export const IDENTITY_TOLERANCE = 1e-6;

export interface IdentityCheck {
  name: string;
  /** The absolute error as a share of GDP. */
  error: number;
}

export function identityChecks(econ: Economy, result: PeriodResult, money: MoneyStocks): IdentityCheck[] {
  const { producers: pr, macro, finalDemand: fd, prices: p } = result;
  const scale = Math.abs(macro.gdpProduction) || 1;

  let producerError = 0;
  for (let j = 0; j < econ.nDomestic; j++) {
    const costs = pr.inputsCost[j] + pr.royalty[j] + pr.wageBill[j] + pr.depreciation[j] + pr.netProfit[j];
    producerError = Math.max(producerError, Math.abs(pr.revenue[j] - costs));
  }

  let finalDemandValue = 0;
  p.forEach((price, k) => (finalDemandValue += price * (fd.households[k] + fd.government[k] + fd.investment[k] + fd.exports[k])));

  const sectorBalances = result.households.saving.reduce((s, x) => s + x, 0) + result.firms.retained + result.government.balance + result.restOfWorld.balance;
  const moneyTotal = money.households.reduce((s, x) => s + x, 0) + money.firms + money.government + money.restOfWorld;

  return [
    { name: 'Each producer: revenue = inputs + royalty + wages + depreciation + net profit', error: producerError / scale },
    { name: 'GDP by production = GDP by expenditure', error: Math.abs(macro.gdpProduction - macro.gdpExpenditure) / scale },
    { name: 'GDP by production = GDP by income', error: Math.abs(macro.gdpProduction - macro.gdpIncome) / scale },
    { name: 'Total GVA = final demand − imports', error: Math.abs(macro.gdpProduction - (finalDemandValue - macro.importsValue)) / scale },
    { name: 'Sector balances sum to zero', error: Math.abs(sectorBalances) / scale },
    { name: 'Money stocks sum to zero', error: Math.abs(moneyTotal) / scale },
  ];
}

export function assertIdentities(t: number, econ: Economy, result: PeriodResult, money: MoneyStocks): void {
  const failures = identityChecks(econ, result, money).filter((check) => !(check.error <= IDENTITY_TOLERANCE));
  if (failures.length > 0) {
    throw new Error(
      `Period ${t}: accounting identities fail:\n  ${failures.map((f) => `${f.name}: error ${f.error.toExponential(2)} of GDP`).join('\n  ')}`,
    );
  }
}
