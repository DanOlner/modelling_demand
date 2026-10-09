/**
 * §16 T8 and T9: the minimal test economy for checking the solver. One place (A), two
 * producers: a farm F with no bought-in inputs, and a shop S that buys 0.5 of F per unit.
 * Households own everything; the government buys G = 20 of S and taxes all income at 20%.
 * No profit tax and no rest of the world.
 *
 * Wages per job are set to 1, so jobs per unit equal the wage shares. A population of 100
 * with g = 0.2 per resident gives G = 20; benefits are zero, so unemployment has no effect.
 * Households spend everything on S, which is what the spec's expected values imply.
 */

import type { Params, ProducerParams } from '../engine/types';

function producer(sector: string, description: string, inputs: Record<string, number>, wageShare: number, markup: number): ProducerParams {
  return {
    place: 'A',
    sector,
    description,
    firm: 'Owners',
    pricing: 'markup',
    markup,
    fixedPrice: 1,
    inputs,
    jobsPerUnit: wageShare,
    wagePerJob: 1,
    depreciation: 0,
    payout: 1,
    displayPrice: 1,
    displayUnit: 'unit',
  };
}

export function minimalEconomy(): Params {
  return {
    name: 'minimal test economy (T8, T9)',
    places: ['A'],
    restOfWorld: 'W',
    population: { total: 100, mainPlace: 'A', mainShare: 1, otherWeights: {} },
    demography: { A: { workingAgeShare: 1, participation: 1, personsPerDwelling: 1 } },
    producers: {
      // Wage share 0.5, profit share 0.5, markup 1.
      'A.F': producer('F', 'Farm', {}, 0.5, 1),
      // Buys 0.5 of F per unit; wage share 0.3, profit share 0.2, markup 0.25.
      'A.S': producer('S', 'Shop', { 'A.F': 0.5 }, 0.3, 0.25),
    },
    firms: { Owners: { description: 'Households, who own everything', headOffice: 'A', owners: { A: 1 }, government: false } },
    households: {
      alpha1: 0.6,
      alpha2: 0.4,
      essentialsPerResident: {},
      gadgetShare: 0,
      gadgetProducer: 'A.S',
      localSector: 'S',
      freezeConsumption: false,
    },
    government: {
      incomeTaxRate: 0.2,
      profitTaxRate: 0,
      benefitNonWorking: 0,
      benefitUnemployed: 0,
      provisionSector: 'S',
      provisionPerResident: 0.2,
      provisionMultiplier: { A: 1 },
      quality: { A: 1 },
    },
    investment: { shares: {} },
    exports: { total: 0, mix: {} },
    royalty: { payer: null, rate: 0, payout: 1, ownerFirm: null },
    commuting: { override: null },
    wealth: { housingSector: null, housingYield: 0.04, equityYield: 0.06, excludeFromEquity: [] },
    calibration: null,
    plausibility: [],
  };
}
