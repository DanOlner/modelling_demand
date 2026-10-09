/**
 * §13 lens 1: workplace GVA, the "official" view, by place, per job and per resident.
 * Switch S1 chooses how a firm's net profit is booked:
 * - 'true': each producer's own GVA, where it produces;
 * - 'headOffice': the net-profit part of each producer's GVA is booked where its firm's
 *   head office is;
 * - 'wageBill': each firm's total net profit is shared among its producers in proportion to
 *   their wage bills. ONS documents this rule only for finance and insurance, so applying it
 *   here is a stylised generalisation.
 * Wages and depreciation always stay where they occur. The offshore IP holder's profit is
 * never domestic GVA. Only firms with producers in several places (RetailCo, UtilityCo and
 * the public services) can look different under the three conventions.
 */

import type { Economy } from '../economy';
import { filled, type Vector } from '../linalg';
import type { PeriodResult } from '../period';

export type Booking = 'true' | 'headOffice' | 'wageBill';
export const BOOKINGS: readonly Booking[] = ['true', 'headOffice', 'wageBill'];

export interface WorkplaceGva {
  /** GVA booked in each place, under each convention. */
  gva: Record<Booking, Vector>;
  gvaPerJob: Record<Booking, Vector>;
  gvaPerResident: Record<Booking, Vector>;
  jobs: Vector;
  residents: Vector;
}

export function workplaceGva(econ: Economy, result: PeriodResult): WorkplaceGva {
  const pr = result.producers;
  const nPlaces = econ.places.length;
  const gva: Record<Booking, Vector> = { true: filled(nPlaces, 0), headOffice: filled(nPlaces, 0), wageBill: filled(nPlaces, 0) };

  const firmProfit: Record<string, number> = {};
  const firmWages: Record<string, number> = {};
  for (let j = 0; j < econ.nDomestic; j++) {
    const firm = econ.firmOf[j];
    if (firm === null) continue;
    firmProfit[firm] = (firmProfit[firm] ?? 0) + pr.netProfit[j];
    firmWages[firm] = (firmWages[firm] ?? 0) + pr.wageBill[j];
  }

  for (let j = 0; j < econ.nDomestic; j++) {
    const w = econ.placeOf[j];
    const firm = econ.firmOf[j];
    // GVA = wages + depreciation + net profit (taxes on production are zero in v1).
    const stays = pr.wageBill[j] + pr.depreciation[j];
    gva.true[w] += pr.gva[j];

    const headOffice = firm === null ? null : econ.params.firms[firm].headOffice;
    gva.headOffice[w] += stays;
    gva.headOffice[headOffice === null ? w : econ.places.indexOf(headOffice)] += pr.netProfit[j];

    const allocated = firm !== null && firmWages[firm] !== 0 ? (firmProfit[firm] * pr.wageBill[j]) / firmWages[firm] : pr.netProfit[j];
    gva.wageBill[w] += stays + allocated;
  }

  const jobs = result.workplaces.jobs.slice();
  const residents = result.households.population.slice();
  const per = (denominator: Vector) => (values: Vector) => values.map((v, w) => v / denominator[w]);
  const perJob = per(jobs);
  const perResident = per(residents);
  return {
    gva,
    gvaPerJob: { true: perJob(gva.true), headOffice: perJob(gva.headOffice), wageBill: perJob(gva.wageBill) },
    gvaPerResident: { true: perResident(gva.true), headOffice: perResident(gva.headOffice), wageBill: perResident(gva.wageBill) },
    jobs,
    residents,
  };
}
