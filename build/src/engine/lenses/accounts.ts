/**
 * §13 lens 10: the macro accounts. GDP is measured three ways. GNI is computed as GDP plus net
 * property income from abroad, and again by adding up each domestic sector's primary income,
 * which checks it independently:
 * - households: wages received plus dividends received, including the IP holder's;
 * - corporations: net profit less dividends paid (retained earnings plus profit tax);
 * - government: any surplus of publicly owned producers;
 * - plus depreciation, since GNI is gross.
 */

import type { Economy } from '../economy';
import { sum, type Vector } from '../linalg';
import type { PeriodResult } from '../period';
import type { MoneyStocks } from '../run';

export interface Accounts {
  gdp: { production: number; expenditure: number; income: number };
  gni: number;
  primaryIncome: { households: number; corporations: number; government: number; depreciation: number; total: number };
  currentAccount: number;
  governmentBalance: number;
  unemploymentRate: Vector;
  money: MoneyStocks;
}

export function accounts(econ: Economy, result: PeriodResult, money: MoneyStocks): Accounts {
  const pr = result.producers;
  let corporations = 0;
  for (let j = 0; j < econ.nDomestic; j++) if (!econ.isGovernment[j]) corporations += pr.netProfit[j] - pr.dividends[j];
  const households = sum(result.households.grossIncome);
  const government = result.government.enterpriseSurplus;
  const depreciation = sum(pr.depreciation);
  return {
    gdp: { production: result.macro.gdpProduction, expenditure: result.macro.gdpExpenditure, income: result.macro.gdpIncome },
    gni: result.macro.gni,
    primaryIncome: { households, corporations, government, depreciation, total: households + corporations + government + depreciation },
    currentAccount: result.macro.currentAccount,
    governmentBalance: result.government.balance,
    unemploymentRate: result.households.unemployed.map((u, r) => u / result.households.labourForce[r]),
    money,
  };
}
