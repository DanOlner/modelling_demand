/**
 * Measures the views can show: for the economy as a whole, or for one place. Each says
 * whether official statistics show it (views plan 8.3); the official view offers only those.
 *
 * GVA by place follows the booking switch (S1) in nominal terms. The real views (S3) book each
 * producer's GVA where it is produced; wage-bill and true booking coincide in E1–E8 anyway.
 */

import type { PeriodRecord } from '../../../src/engine/run';
import type { Unit } from './format';
import { lensesOf } from './model';
import type { Switches } from './settings';

export interface Measure {
  id: string;
  label: string;
  unit: Unit;
  scope: 'economy' | 'place';
  official: boolean;
  /** What it shows, in one line. */
  caption: string;
  /** `w` is the place's index; economy-wide measures ignore it. */
  value: (r: PeriodRecord, w: number, s: Switches) => number;
}

function placeGva(r: PeriodRecord, w: number, s: Switches): number {
  const l = lensesOf(r);
  return s.measure === 'nominal' ? l.workplaceGva.gva[s.booking][w] : l.measurement.byPlace[s.measure][s.convention][w];
}

export const MEASURES: Measure[] = [
  { id: 'gdp', label: 'GDP', unit: 'gbp', scope: 'economy', official: true, caption: 'Total GVA, £ a year', value: (r) => r.result.macro.gdpProduction },
  { id: 'gni', label: 'GNI', unit: 'gbp', scope: 'economy', official: true, caption: 'GDP plus property income from abroad, less that paid abroad', value: (r) => r.result.macro.gni },
  { id: 'unemployment', label: 'Unemployment rate', unit: 'rate', scope: 'economy', official: true, caption: 'Share of the labour force out of work', value: (r) => r.result.macro.unemploymentRate },
  { id: 'governmentBalance', label: 'Government balance', unit: 'gbp', scope: 'economy', official: true, caption: 'Tax revenue less spending; negative is a deficit', value: (r) => r.result.government.balance },
  { id: 'currentAccount', label: 'Current account', unit: 'gbp', scope: 'economy', official: true, caption: 'Net receipts from the rest of the world', value: (r) => r.result.macro.currentAccount },
  {
    id: 'gvaPerJob',
    label: 'GVA per job',
    unit: 'gbpPerPerson',
    scope: 'place',
    official: true,
    caption: 'Workplace GVA divided by the jobs there: the official productivity measure',
    value: (r, w, s) => placeGva(r, w, s) / r.result.workplaces.jobs[w],
  },
  {
    id: 'gvaPerResident',
    label: 'GVA per resident',
    unit: 'gbpPerPerson',
    scope: 'place',
    official: true,
    caption: 'Workplace GVA divided by residents: distorted by commuting',
    value: (r, w, s) => placeGva(r, w, s) / r.result.households.population[w],
  },
  {
    id: 'gdhiPerResident',
    label: 'Disposable income per resident',
    unit: 'gbpPerPerson',
    scope: 'place',
    official: true,
    caption: 'Household income after tax and benefits, by place of residence (GDHI)',
    value: (r, w) => lensesOf(r).incomes.gdhiPerResident[w],
  },
  {
    id: 'unemploymentPlace',
    label: 'Unemployment rate',
    unit: 'rate',
    scope: 'place',
    official: true,
    caption: 'Residents out of work, as a share of the labour force',
    value: (r, w) => r.result.households.unemployed[w] / r.result.households.labourForce[w],
  },
  {
    id: 'residualIncome',
    label: 'Residual income per resident',
    unit: 'gbpPerPerson',
    scope: 'place',
    official: false,
    caption: 'Disposable income left after housing, utilities and everyday basics',
    value: (r, w) => lensesOf(r).incomes.residualIncomePerResident[w],
  },
  {
    id: 'wealthPerResident',
    label: 'Wealth per resident',
    unit: 'gbpPerPerson',
    scope: 'place',
    official: false,
    caption: 'Money, plus housing and shares valued from rents and profits',
    value: (r, w) => lensesOf(r).incomes.wealth.perResident[w],
  },
  {
    id: 'localRetention',
    label: 'Local retention',
    unit: 'share',
    scope: 'place',
    official: false,
    caption: 'Share of the GVA made here that becomes income for residents here',
    value: (r, w) => lensesOf(r).structure.localRetention[w],
  },
];

export const measureById = (id: string): Measure => {
  const m = MEASURES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown measure "${id}"`);
  return m;
};
