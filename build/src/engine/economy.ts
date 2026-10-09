/**
 * Compiles a parameter set into the indexed arrays and matrices the solver works with,
 * checking it on the way. Producers keep their IDs ('C.HQ'); inside the engine they are
 * numbered, domestic producers first, then rest-of-world suppliers.
 */

import { filled, zeros, type Matrix, type Vector } from './linalg';
import type { FirmId, OwnerGroup, Params, PlaceId, PricingRule, ProducerId } from './types';

export interface Economy {
  params: Params;
  places: PlaceId[];
  /** Owner groups: the domestic places, then the rest of the world. */
  ownerGroups: OwnerGroup[];
  /** Producer IDs: domestic producers first (in parameter order), then rest-of-world suppliers. */
  ids: ProducerId[];
  nDomestic: number;
  index: Record<ProducerId, number>;
  /** Index into `places` for each producer; −1 for rest-of-world suppliers. */
  placeOf: number[];
  sectorOf: string[];
  /** a_ij, over all producers. */
  A: Matrix;
  pricing: PricingRule[];
  markup: Vector;
  fixedPrice: Vector;
  jobsPerUnit: Vector;
  wagePerJob: Vector;
  depreciation: Vector;
  payout: Vector;
  firmOf: (FirmId | null)[];
  /** Producers owned by a public body. */
  isGovernment: boolean[];
  /** Each producer's owners' shares of its dividends, by owner group. */
  ownerShares: Vector[];
  /** By place. */
  population: Vector;
  labourForce: Vector;
  nonWorking: Vector;
  /** By place of residence: essential purchases and the local producer for discretionary spending. */
  essentials: { producer: number; unitsPerResident: number }[][];
  localDiscretionary: number[];
  gadget: number;
  /** By place: the local producer of public services. */
  provision: number[];
  investmentShares: { producer: number; share: number }[];
  /** Export quantity by producer. */
  exportQuantities: Vector;
  /** The producer paying the royalty, or −1. */
  royaltyPayer: number;
  /** Shares of the IP holder's dividends, by owner group. */
  ipOwnerShares: Vector;
}

const SHARE_TOLERANCE = 1e-9;

/** Rounds away floating-point noise for messages: 1.0999999999999999 becomes 1.1. */
const tidy = (x: number) => Number(x.toPrecision(12));

export function compile(params: Params): Economy {
  const problems: string[] = [];
  const problem = (message: string) => problems.push(message);
  // JSON copies turn NaN into null, which arithmetic would quietly treat as 0, so insist on finite numbers.
  const finite = (value: unknown, what: string) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) problem(`${what} must be a finite number, not ${value}`);
  };
  finite(params.population.mainShare, 'population.mainShare (s_C, set by calibration)');
  finite(params.government.incomeTaxRate, 'government.incomeTaxRate (θ, set by calibration)');
  finite(params.exports.total, 'exports.total (X, set by calibration)');

  const { places, restOfWorld } = params;
  const ownerGroups = [...places, restOfWorld];
  const allIds = Object.keys(params.producers);
  const domesticIds = allIds.filter((id) => params.producers[id].place !== restOfWorld);
  const foreignIds = allIds.filter((id) => params.producers[id].place === restOfWorld);
  const ids = [...domesticIds, ...foreignIds];
  const n = ids.length;
  const index: Record<ProducerId, number> = {};
  ids.forEach((id, i) => (index[id] = i));
  const has = (id: ProducerId | null | undefined): id is ProducerId => id != null && Object.hasOwn(index, id);

  const A = zeros(n, n);
  const placeOf: number[] = [];
  const sectorOf: string[] = [];
  const pricing: PricingRule[] = [];
  const firmOf: (FirmId | null)[] = [];
  const isGovernment: boolean[] = [];
  const ownerShares: Vector[] = [];

  ids.forEach((id, j) => {
    const p = params.producers[id];
    if (id !== `${p.place}.${p.sector}`) problem(`Producer ${id}: its ID should be "${p.place}.${p.sector}"`);
    const domestic = p.place !== restOfWorld;
    if (domestic && !places.includes(p.place)) problem(`Producer ${id}: unknown place "${p.place}"`);
    placeOf.push(domestic ? places.indexOf(p.place) : -1);
    sectorOf.push(p.sector);
    pricing.push(p.pricing);
    for (const key of ['markup', 'fixedPrice', 'jobsPerUnit', 'wagePerJob', 'depreciation', 'payout'] as const) finite(p[key], `Producer ${id}: ${key}`);
    for (const [supplier, coefficient] of Object.entries(p.inputs)) {
      finite(coefficient, `Producer ${id}: input from ${supplier}`);
      if (!has(supplier)) problem(`Producer ${id}: unknown supplier "${supplier}"`);
      else A[index[supplier]][j] = coefficient;
    }
    const shares = filled(ownerGroups.length, 0);
    let government = false;
    if (domestic) {
      const firm = p.firm === null ? undefined : params.firms[p.firm];
      if (!firm) problem(`Producer ${id}: unknown firm "${p.firm}"`);
      else {
        government = firm.government;
        if (!government) {
          for (const [group, share] of Object.entries(firm.owners)) {
            const g = ownerGroups.indexOf(group);
            if (g < 0) problem(`Firm ${p.firm}: unknown owner group "${group}"`);
            else shares[g] = share;
          }
        }
      }
    } else {
      if (p.firm !== null) problem(`Rest-of-world supplier ${id} shouldn't belong to a firm`);
      if (p.pricing !== 'fixed') problem(`Rest-of-world supplier ${id} must have a fixed price`);
    }
    firmOf.push(p.firm);
    isGovernment.push(government);
    ownerShares.push(shares);
  });

  for (const [name, firm] of Object.entries(params.firms)) {
    if (firm.headOffice !== null && !places.includes(firm.headOffice)) problem(`Firm ${name}: unknown head-office place "${firm.headOffice}"`);
    const total = Object.values(firm.owners).reduce((s, x) => s + x, 0);
    if (!firm.government && Math.abs(total - 1) > SHARE_TOLERANCE) problem(`Firm ${name}: ownership shares sum to ${tidy(total)}, not 1`);
  }

  // Population (§3): the main place's share is s_C; the rest splits by the other places' weights.
  const { population: pop } = params;
  const mainIndex = places.indexOf(pop.mainPlace);
  if (mainIndex < 0) problem(`Population: unknown main place "${pop.mainPlace}"`);
  const otherWeightTotal = places
    .filter((place) => place !== pop.mainPlace)
    .reduce((s, place) => s + (pop.otherWeights[place] ?? 0), 0);
  const population = places.map((place) =>
    place === pop.mainPlace
      ? pop.mainShare * pop.total
      : (1 - pop.mainShare) * pop.total * ((pop.otherWeights[place] ?? 0) / otherWeightTotal),
  );
  const labourForce: Vector = [];
  const nonWorking: Vector = [];
  places.forEach((place, r) => {
    const d = params.demography[place];
    if (!d) {
      problem(`No demography for place "${place}"`);
      labourForce.push(0);
      nonWorking.push(0);
      return;
    }
    labourForce.push(population[r] * d.workingAgeShare * d.participation);
    nonWorking.push(population[r] * (1 - d.workingAgeShare));
  });

  // Households (§7).
  const hh = params.households;
  const localProducer = (place: PlaceId, sector: string, what: string): number => {
    const id = `${place}.${sector}`;
    if (!has(id)) {
      problem(`${what}: no producer "${id}"`);
      return -1;
    }
    return index[id];
  };
  const essentials = places.map((place) =>
    Object.entries(hh.essentialsPerResident)
      .map(([sector, byPlace]) => ({ sector, units: byPlace[place] ?? 0 }))
      .filter(({ units }) => units !== 0)
      .map(({ sector, units }) => ({ producer: localProducer(place, sector, 'Essentials'), unitsPerResident: units })),
  );
  const localDiscretionary = places.map((place) => localProducer(place, hh.localSector, 'Discretionary spending'));
  if (hh.gadgetShare > 0 && !has(hh.gadgetProducer)) problem(`Unknown gadget producer "${hh.gadgetProducer}"`);
  const gadget = has(hh.gadgetProducer) ? index[hh.gadgetProducer] : -1;

  // Government (§7).
  const provision = places.map((place) => localProducer(place, params.government.provisionSector, 'Public services'));

  // Investment (§7): needed only if anything depreciates.
  const investmentShares = Object.entries(params.investment.shares).map(([id, share]) => {
    if (!has(id)) problem(`Investment: unknown producer "${id}"`);
    return { producer: has(id) ? index[id] : -1, share };
  });
  const depreciates = domesticIds.some((id) => params.producers[id].depreciation !== 0);
  const investmentTotal = investmentShares.reduce((s, x) => s + x.share, 0);
  if (depreciates && Math.abs(investmentTotal - 1) > SHARE_TOLERANCE) problem(`Investment shares sum to ${tidy(investmentTotal)}, not 1`);

  // Exports (§7): fixed quantities, X times the mix.
  const exportQuantities = filled(n, 0);
  for (const [id, share] of Object.entries(params.exports.mix)) {
    if (!has(id) || params.producers[id].place === restOfWorld) problem(`Exports: "${id}" is not a domestic producer`);
    else exportQuantities[index[id]] = params.exports.total * share;
  }

  // The offshore IP holder (§6, §8).
  const { royalty } = params;
  const royaltyPayer = has(royalty.payer) ? index[royalty.payer] : -1;
  if (royalty.payer !== null && royaltyPayer < 0) problem(`Royalty: unknown payer "${royalty.payer}"`);
  const ipOwnerShares = filled(ownerGroups.length, 0);
  if (royalty.ownerFirm !== null) {
    const firm = params.firms[royalty.ownerFirm];
    if (!firm) problem(`Royalty: unknown owner firm "${royalty.ownerFirm}"`);
    else for (const [group, share] of Object.entries(firm.owners)) ipOwnerShares[ownerGroups.indexOf(group)] = share;
  } else if (royalty.payer !== null) problem('Royalty: a payer needs an owner firm to receive the dividends');

  const override = params.commuting.override;
  if (override !== null) {
    if (override.length !== places.length || override.some((row) => row.length !== places.length)) {
      problem(`Commuting override must be ${places.length} × ${places.length}`);
    } else if (override.some((row) => Math.abs(row.reduce((s, x) => s + x, 0) - 1) > SHARE_TOLERANCE)) {
      problem('Each row of the commuting override must sum to 1');
    }
  }

  if (problems.length > 0) throw new Error(`Invalid parameters "${params.name}":\n  ${problems.join('\n  ')}`);

  const field = (pick: (id: ProducerId) => number) => ids.map(pick);
  return {
    params,
    places,
    ownerGroups,
    ids,
    nDomestic: domesticIds.length,
    index,
    placeOf,
    sectorOf,
    A,
    pricing,
    markup: field((id) => params.producers[id].markup),
    fixedPrice: field((id) => params.producers[id].fixedPrice),
    jobsPerUnit: field((id) => params.producers[id].jobsPerUnit),
    wagePerJob: field((id) => params.producers[id].wagePerJob),
    depreciation: field((id) => (params.producers[id].place === restOfWorld ? 0 : params.producers[id].depreciation)),
    payout: field((id) => params.producers[id].payout),
    firmOf,
    isGovernment,
    ownerShares,
    population,
    labourForce,
    nonWorking,
    essentials,
    localDiscretionary,
    gadget,
    provision,
    investmentShares,
    exportQuantities,
    royaltyPayer,
    ipOwnerShares,
  };
}
