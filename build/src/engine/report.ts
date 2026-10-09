/**
 * Results as tidy rows (one value per row), for writing to CSV and reading into R, Python
 * or a spreadsheet. Units: £ a year for money, persons for people and jobs, base-£ units
 * for output, index (base year = 1) for prices.
 */

import { gvaByPlace, residualIncomePerResident, servicesPerResident } from './aggregates';
import { BOOKINGS, MEASUREMENT_VIEWS, SERVICE_CONVENTIONS, type PeriodLenses } from './lenses';
import type { PeriodRecord } from './run';

export interface Row {
  t: number;
  /** 'economy', 'place', 'producer' or 'money'. */
  table: string;
  entity: string;
  variable: string;
  value: number;
}

export function periodRows(record: PeriodRecord): Row[] {
  const { t, econ, result: r, money } = record;
  const rows: Row[] = [];
  const add = (table: string, entity: string, values: Record<string, number>) => {
    for (const [variable, value] of Object.entries(values)) rows.push({ t, table, entity, variable, value });
  };

  add('economy', 'all', {
    gdp: r.macro.gdpProduction,
    gni: r.macro.gni,
    consumption: r.macro.consumption,
    government_spending: r.macro.governmentSpend,
    investment: r.macro.investment,
    exports: r.macro.exportsValue,
    imports_including_royalties: r.macro.importsValue,
    current_account: r.macro.currentAccount,
    government_balance: r.government.balance,
    income_tax: r.government.incomeTax,
    profit_tax: r.government.profitTax,
    benefits: r.government.benefits,
    royalties: r.ip.royalties,
    dividends_to_overseas_owners: r.restOfWorld.dividendsReceived,
    ip_dividends_to_domestic_owners: r.restOfWorld.ipDividendsPaid,
    unemployment_rate: r.macro.unemploymentRate,
  });

  const gva = gvaByPlace(econ, r);
  const residual = residualIncomePerResident(r);
  const services = servicesPerResident(econ, r);
  const hh = r.households;
  econ.places.forEach((place, w) => {
    add('place', place, {
      residents: hh.population[w],
      labour_force: hh.labourForce[w],
      jobs_at_workplace: r.workplaces.jobs[w],
      gva_at_workplace: gva[w],
      gva_per_job: gva[w] / r.workplaces.jobs[w],
      employed_residents: hh.employed[w],
      unemployed: hh.unemployed[w],
      unemployment_rate: hh.unemployed[w] / hh.labourForce[w],
      wages_received: hh.wagesReceived[w],
      dividends_received: hh.dividendsReceived[w],
      gross_income: hh.grossIncome[w],
      income_tax: hh.incomeTax[w],
      benefits: hh.benefits[w],
      disposable_income: hh.disposableIncome[w],
      essential_spending: hh.essentialSpend[w],
      consumption: hh.consumption[w],
      saving: hh.saving[w],
      residual_income_per_resident: residual[w],
      public_services_per_resident: services[w],
      household_money: money.households[w],
    });
  });

  const p = r.producers;
  econ.ids.forEach((id, j) => {
    if (j >= econ.nDomestic) {
      add('producer', id, { price: r.prices[j], imports: p.output[j], import_payments: p.revenue[j] });
      return;
    }
    add('producer', id, {
      price: r.prices[j],
      output: p.output[j],
      revenue: p.revenue[j],
      inputs_cost: p.inputsCost[j],
      royalty: p.royalty[j],
      gva: p.gva[j],
      jobs: p.jobs[j],
      wage_bill: p.wageBill[j],
      depreciation: p.depreciation[j],
      net_profit: p.netProfit[j],
      profit_tax: p.profitTax[j],
      dividends: p.dividends[j],
      retained: p.retained[j],
    });
  });

  add('money', 'all', {
    households: money.households.reduce((s, x) => s + x, 0),
    firms: money.firms,
    government: money.government,
    rest_of_world: money.restOfWorld,
  });
  return rows;
}

/** 'headOffice' → 'head_office', 'everyday economy' → 'everyday_economy'. */
const snake = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

/** The lenses' results (§13) as tidy rows, added to the same tables as `periodRows`. */
export function lensRows(record: PeriodRecord, lenses: PeriodLenses): Row[] {
  const { t, econ } = record;
  const rows: Row[] = [];
  const add = (table: string, entity: string, values: Record<string, number>) => {
    for (const [variable, value] of Object.entries(values)) rows.push({ t, table, entity, variable, value });
  };
  const { workplaceGva: booked, incomes, structure, measurement: m, accounts, chains, rectangles } = lenses;

  econ.places.forEach((place, w) => {
    const values: Record<string, number> = {};
    for (const booking of BOOKINGS) {
      values[`gva_booked_${snake(booking)}`] = booked.gva[booking][w];
      values[`gva_per_job_booked_${snake(booking)}`] = booked.gvaPerJob[booking][w];
    }
    values.gva_per_resident = incomes.gvaPerResident[w];
    values.gdhi_per_resident = incomes.gdhiPerResident[w];
    values.wealth_money = incomes.wealth.money[w];
    values.wealth_housing = incomes.wealth.housing[w];
    values.wealth_equity = incomes.wealth.equity[w];
    values.wealth_total = incomes.wealth.total[w];
    values.wealth_per_resident = incomes.wealth.perResident[w];
    values.local_retention = structure.localRetention[w];
    for (const group of structure.groups) {
      values[`jobs_share_${snake(group.name)}`] = group.jobsShare[w];
      values[`gva_share_${snake(group.name)}`] = group.gvaShare[w];
    }
    for (const view of MEASUREMENT_VIEWS) {
      for (const convention of SERVICE_CONVENTIONS) {
        values[`gva_${snake(view)}_${convention}`] = m.byPlace[view][convention][w];
        values[`gva_per_job_${snake(view)}_${convention}`] = m.perJobByPlace[view][convention][w];
      }
    }
    add('place', place, values);
  });

  const economy: Record<string, number> = {
    gni_from_primary_incomes: accounts.primaryIncome.total,
    primary_income_households: accounts.primaryIncome.households,
    primary_income_corporations: accounts.primaryIncome.corporations,
    primary_income_government: accounts.primaryIncome.government,
    input_deflator: m.deflators.inputs,
  };
  for (const [sector, deflator] of Object.entries(m.deflators.output)) economy[`output_deflator_${snake(sector)}`] = deflator;
  for (const view of MEASUREMENT_VIEWS) {
    for (const convention of SERVICE_CONVENTIONS) {
      economy[`gdp_${snake(view)}_${convention}`] = m.national[view][convention];
      economy[`public_services_gva_per_job_${snake(view)}_${convention}`] = m.publicServicesPerJob[view][convention];
    }
  }
  add('economy', 'all', economy);

  chains.forEach((chain, k) => {
    const rect = rectangles[k];
    const values: Record<string, number> = {
      chain_jobs_per_unit: chain.chainJobsPerUnit,
      value_per_chain_worker: chain.valuePerChainWorker,
      on_site_gva_per_job: chain.onSiteGvaPerJob,
      local_purchase_share: structure.localPurchaseShare[k],
      rectangle_S: rect.S,
      rectangle_C: rect.C,
      rectangle_Q: rect.Q,
      rectangle_margin: rect.margin,
      rectangle_ratio: rect.ratio,
      band_wages: rect.bands.wages,
      band_depreciation: rect.bands.depreciation,
      band_net_profit: rect.bands.netProfit,
    };
    for (const [place, value] of Object.entries(chain.captureByPlace)) values[`value_capture_share_${place}`] = value / chain.price;
    add('producer', chain.product, values);
  });
  return rows;
}

export function toCsv(rows: Row[]): string {
  const quote = (text: string) => (/[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text);
  const lines = rows.map((row) => [row.t, quote(row.table), quote(row.entity), quote(row.variable), row.value].join(','));
  return ['t,table,entity,variable,value', ...lines].join('\n') + '\n';
}

/** The same rows nested as period → table → entity → variable → value, for JavaScript readers. */
export function toNested(rows: Row[]): Record<number, Record<string, Record<string, Record<string, number>>>> {
  const nested: Record<number, Record<string, Record<string, Record<string, number>>>> = {};
  for (const row of rows) {
    const byTable = (nested[row.t] ??= {});
    const byEntity = (byTable[row.table] ??= {});
    (byEntity[row.entity] ??= {})[row.variable] = row.value;
  }
  return nested;
}
