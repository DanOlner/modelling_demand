/**
 * §13 lenses 7 and 8.
 * - Lens 7, sector groups: each group's share of jobs and GVA in each place and nationally,
 *   and access to public services per resident, adjusted for quality.
 * - Lens 8, local retention: the share of the GVA produced in each place that becomes income
 *   for its residents (wages to resident workers, dividends to resident owners); and the
 *   share of each producer's purchases bought from producers in its own place.
 */

import { gvaByPlace, servicesPerResident } from '../aggregates';
import type { Economy } from '../economy';
import { filled, sum, type Vector } from '../linalg';
import type { PeriodResult } from '../period';

export interface SectorGroup {
  name: string;
  sectors: string[];
}

export interface SectorGroupShares {
  name: string;
  /** By place: the group's share of the place's jobs and GVA. */
  jobsShare: Vector;
  gvaShare: Vector;
  nationalJobsShare: number;
  nationalGvaShare: number;
}

export interface Structure {
  groups: SectorGroupShares[];
  servicesPerResident: Vector;
  localRetention: Vector;
  /** By producer (domestic only): the share of bought-in inputs, by value, bought from its own place. */
  localPurchaseShare: Vector;
}

export function localPurchaseShares(econ: Economy, result: PeriodResult): Vector {
  const p = result.prices;
  return econ.ids.slice(0, econ.nDomestic).map((_, j) => {
    let local = 0;
    let all = 0;
    for (let i = 0; i < econ.ids.length; i++) {
      const value = econ.A[i][j] * p[i];
      all += value;
      if (i < econ.nDomestic && econ.placeOf[i] === econ.placeOf[j]) local += value;
    }
    return all === 0 ? 0 : local / all;
  });
}

export function localRetention(econ: Economy, result: PeriodResult): Vector {
  const pr = result.producers;
  const gamma = result.commuting;
  const gva = gvaByPlace(econ, result);
  const retained = econ.places.map((_, w) => gamma[w][w] * result.workplaces.wageBill[w]);
  for (let j = 0; j < econ.nDomestic; j++) {
    const w = econ.placeOf[j];
    retained[w] += econ.ownerShares[j][w] * pr.dividends[j];
  }
  return retained.map((income, w) => income / gva[w]);
}

export function structure(econ: Economy, result: PeriodResult, groups: SectorGroup[]): Structure {
  const pr = result.producers;
  const nPlaces = econ.places.length;
  const jobsAt = result.workplaces.jobs;
  const gvaAt = gvaByPlace(econ, result);
  const shares = groups.map(({ name, sectors }) => {
    const jobs = filled(nPlaces, 0);
    const gva = filled(nPlaces, 0);
    for (let j = 0; j < econ.nDomestic; j++) {
      if (!sectors.includes(econ.sectorOf[j])) continue;
      jobs[econ.placeOf[j]] += pr.jobs[j];
      gva[econ.placeOf[j]] += pr.gva[j];
    }
    return {
      name,
      jobsShare: jobs.map((x, w) => x / jobsAt[w]),
      gvaShare: gva.map((x, w) => x / gvaAt[w]),
      nationalJobsShare: sum(jobs) / sum(jobsAt),
      nationalGvaShare: sum(gva) / sum(gvaAt),
    };
  });
  return {
    groups: shares,
    servicesPerResident: servicesPerResident(econ, result),
    localRetention: localRetention(econ, result),
    localPurchaseShare: localPurchaseShares(econ, result),
  };
}
