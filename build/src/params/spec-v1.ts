/**
 * The defaults of /notes/model-spec-v1.md: a stylised economy of a core city (C), a
 * manufacturing town (M), a rural area (R) and the rest of the world (W). Section numbers
 * (§) refer to the spec. All values are the spec's stylised first guesses, not estimates.
 *
 * `specV1Base()` leaves the three calibrated values (X, θ and s_C) unset; `specV1()` in
 * ./spec-v1-calibrated.ts fills them in from the stored calibration.
 */

import type { LensConfig } from '../engine/lenses';
import type { FirmParams, Params, PlaceId, PricingRule, ProducerId, ProducerParams } from '../engine/types';

export const PLACES: PlaceId[] = ['C', 'M', 'R'];

/** §13 lens 7: the sector groups. Reporting settings, kept out of the parameters so they don't affect the calibration. */
export const SPEC_V1_LENSES: LensConfig = {
  sectorGroups: [
    { name: 'tradable', sectors: ['HQ', 'BIZ', 'CMP', 'FOD', 'AGR'] },
    { name: 'everyday economy', sectors: ['RET'] },
    { name: 'material foundational', sectors: ['UTL'] },
    { name: 'providential', sectors: ['PRV'] },
    { name: 'housing', sectors: ['HSG'] },
  ],
};

/**
 * §5: bought-in inputs per £1 of output at base prices, by supplier, and the split of the
 * rest of output value. `inputs(r)` gives the inputs of the producer in place r, since
 * some inputs come from the buyer's own place. Each row sums to 1.
 */
export interface CostRow {
  inputs: (place: PlaceId) => Record<ProducerId, number>;
  wages: number;
  depreciation: number;
  netProfit: number;
  wagePerJob: number;
}

export const COST_TABLE: Record<string, CostRow> = {
  AGR: { inputs: () => ({ 'W.GEN': 0.28, 'R.UTL': 0.05, 'C.BIZ': 0.02 }), wages: 0.3, depreciation: 0.15, netProfit: 0.2, wagePerJob: 25_000 },
  FOD: { inputs: () => ({ 'R.AGR': 0.4, 'W.GEN': 0.13, 'M.UTL': 0.04, 'C.BIZ': 0.03 }), wages: 0.22, depreciation: 0.07, netProfit: 0.11, wagePerJob: 30_000 },
  CMP: { inputs: () => ({ 'W.GEN': 0.38, 'M.UTL': 0.05, 'C.BIZ': 0.04 }), wages: 0.3, depreciation: 0.08, netProfit: 0.15, wagePerJob: 36_000 },
  HQ: { inputs: () => ({ 'M.CMP': 0.2, 'W.ASM': 0.08, 'W.GEN': 0.04, 'C.UTL': 0.02, 'C.BIZ': 0.06 }), wages: 0.2, depreciation: 0.05, netProfit: 0.35, wagePerJob: 100_000 },
  BIZ: { inputs: () => ({ 'W.GEN': 0.08, 'C.UTL': 0.03 }), wages: 0.5, depreciation: 0.05, netProfit: 0.34, wagePerJob: 55_000 },
  RET: { inputs: (r) => ({ 'M.FOD': 0.16, 'W.GEN': 0.16, [`${r}.UTL`]: 0.04, 'C.BIZ': 0.04 }), wages: 0.4, depreciation: 0.07, netProfit: 0.13, wagePerJob: 27_000 },
  UTL: { inputs: () => ({ 'W.GEN': 0.25, 'C.BIZ': 0.03 }), wages: 0.3, depreciation: 0.2, netProfit: 0.22, wagePerJob: 38_000 },
  PRV: { inputs: (r) => ({ [`${r}.UTL`]: 0.06, 'W.GEN': 0.06, [`${r}.RET`]: 0.04, 'C.BIZ': 0.02 }), wages: 0.75, depreciation: 0.07, netProfit: 0, wagePerJob: 32_000 },
  HSG: { inputs: (r) => ({ [`${r}.UTL`]: 0.05, 'W.GEN': 0.02, [`${r}.RET`]: 0.02, 'C.BIZ': 0.01 }), wages: 0.02, depreciation: 0.25, netProfit: 0.63, wagePerJob: 28_000 },
};

/** §5: jobs per £1 of output in the rest of the world, used only by the whole-chain productivity lens. */
const FOREIGN_JOBS_PER_UNIT = { GEN: 1.0e-5, ASM: 2.15e-5 };

function domestic(
  place: PlaceId,
  sector: string,
  description: string,
  firm: string,
  pricing: PricingRule,
  displayPrice: number,
  displayUnit: string,
): [ProducerId, ProducerParams] {
  const row = COST_TABLE[sector];
  const inputs = row.inputs(place);
  const inputsTotal = Object.values(inputs).reduce((s, x) => s + x, 0);
  return [
    `${place}.${sector}`,
    {
      place,
      sector,
      description,
      firm,
      pricing,
      // §6: base markups make every base price exactly 1.
      markup: pricing === 'markup' ? 1 / (inputsTotal + row.wages) - 1 : 0,
      fixedPrice: 1,
      inputs,
      jobsPerUnit: row.wages / row.wagePerJob,
      wagePerJob: row.wagePerJob,
      depreciation: row.depreciation,
      payout: 1,
      displayPrice,
      displayUnit,
    },
  ];
}

function foreign(sector: 'GEN' | 'ASM', description: string, displayPrice: number, displayUnit: string): [ProducerId, ProducerParams] {
  return [
    `W.${sector}`,
    {
      place: 'W',
      sector,
      description,
      firm: null,
      pricing: 'fixed',
      markup: 0,
      fixedPrice: 1,
      inputs: {},
      jobsPerUnit: FOREIGN_JOBS_PER_UNIT[sector],
      wagePerJob: 0, // Foreign wages aren't modelled; only foreign jobs are, for the whole-chain lens.
      depreciation: 0,
      payout: 0,
      displayPrice,
      displayUnit,
    },
  ];
}

const DWELLING_YEAR = { C: 13_800, M: 6_900, R: 8_050 } as Record<PlaceId, number>;

const everyPlace = (make: (place: PlaceId) => [ProducerId, ProducerParams]) => PLACES.map(make);

function producers(): Record<ProducerId, ProducerParams> {
  const byPlace: [ProducerId, ProducerParams][] = [
    domestic('C', 'HQ', 'Gadget brand: IP, design and head office ("Cupertino")', 'GadgetCo', 'fixed', 700, 'gadget'),
    domestic('C', 'BIZ', 'Business and financial services', 'BizCo', 'markup', 120, 'consultant hour'),
    domestic('M', 'CMP', 'Components and capital goods', 'CompCo', 'markup', 140, 'component set'),
    domestic('M', 'FOD', 'Food processing', 'FoodCo', 'markup', 0.5, 'pot'),
    domestic('R', 'AGR', 'Agriculture (milk and other produce)', 'Farms', 'markup', 0.35, 'litre'),
    ...everyPlace((r) => domestic(r, 'RET', 'Everyday goods and services: retail, hospitality, personal services', 'RetailCo', 'markup', 10, 'basket')),
    ...everyPlace((r) => domestic(r, 'UTL', 'Utilities and transport (material foundational economy)', 'UtilityCo', 'markup', 1, 'service unit')),
    ...everyPlace((r) => domestic(r, 'PRV', 'Health, education and care (providential foundational economy), publicly funded', 'Government', 'cost', 30, 'service hour')),
    ...everyPlace((r) => domestic(r, 'HSG', 'Housing services (rent)', `Landlords${r}`, 'fixed', DWELLING_YEAR[r], 'dwelling-year')),
  ];
  // List domestic producers by place, as the spec's tables do, then the foreign suppliers.
  const ordered = PLACES.flatMap((place) => byPlace.filter(([, p]) => p.place === place));
  return Object.fromEntries([
    ...ordered,
    foreign('GEN', 'Imported goods and energy', 1, '£1 of goods'),
    foreign('ASM', 'Contract assembly of gadgets', 56, 'assembly'),
  ]);
}

function firm(description: string, headOffice: PlaceId | null, owners: Record<string, number>): FirmParams {
  return { description, headOffice, owners, government: false };
}

/** §4: firms, the places of their head offices, and the ownership shares of their dividends. */
function firms(): Record<string, FirmParams> {
  return {
    GadgetCo: firm('Gadget brand, including the offshore IP holder W.IP', 'C', { C: 0.3, M: 0.03, R: 0.02, W: 0.65 }),
    BizCo: firm('Business and financial services', 'C', { C: 0.4, M: 0.05, R: 0.05, W: 0.5 }),
    RetailCo: firm('Retail chain', 'C', { C: 0.4, M: 0.1, R: 0.05, W: 0.45 }),
    UtilityCo: firm('Utilities and transport', 'C', { C: 0.15, M: 0.05, R: 0.05, W: 0.75 }),
    CompCo: firm('Components maker', 'M', { C: 0.2, M: 0.4, R: 0, W: 0.4 }),
    FoodCo: firm('Food processor', 'M', { C: 0.1, M: 0.6, R: 0.1, W: 0.2 }),
    Farms: firm('Farms', 'R', { R: 1 }),
    LandlordsC: firm('Landlords of city housing', 'C', { C: 0.7, W: 0.3 }),
    LandlordsM: firm('Landlords of town housing', 'M', { C: 0.2, M: 0.8 }),
    LandlordsR: firm('Landlords of rural housing', 'R', { C: 0.2, R: 0.8 }),
    Government: { description: 'Public services', headOffice: null, owners: {}, government: true },
  };
}

/** The spec economy, with X, θ and s_C not yet calibrated (NaN). */
export function specV1Base(): Params {
  return {
    name: 'model spec v1',
    places: [...PLACES],
    restOfWorld: 'W',
    population: { total: 1_800_000, mainPlace: 'C', mainShare: NaN, otherWeights: { M: 2, R: 1 } },
    demography: {
      C: { workingAgeShare: 0.66, participation: 0.8, personsPerDwelling: 2.3 },
      M: { workingAgeShare: 0.62, participation: 0.76, personsPerDwelling: 2.3 },
      R: { workingAgeShare: 0.58, participation: 0.74, personsPerDwelling: 2.3 },
    },
    producers: producers(),
    firms: firms(),
    households: {
      alpha1: 0.9,
      alpha2: 0.1,
      essentialsPerResident: {
        HSG: { C: 6_000, M: 3_000, R: 3_500 },
        UTL: { C: 1_500, M: 1_500, R: 1_500 },
        RET: { C: 2_500, M: 2_500, R: 2_500 },
      },
      gadgetShare: 0.03,
      gadgetProducer: 'C.HQ',
      localSector: 'RET',
      freezeConsumption: false,
    },
    government: {
      incomeTaxRate: NaN,
      profitTaxRate: 0.25,
      benefitNonWorking: 5_000,
      benefitUnemployed: 6_000,
      provisionSector: 'PRV',
      provisionPerResident: 5_500,
      provisionMultiplier: { C: 1, M: 1, R: 1 },
      quality: { C: 1, M: 1, R: 1 },
    },
    investment: { shares: { 'M.CMP': 0.5, 'W.GEN': 0.5 } },
    exports: { total: NaN, mix: { 'C.HQ': 0.4, 'C.BIZ': 0.35, 'M.CMP': 0.15, 'M.FOD': 0.1 } },
    royalty: { payer: 'C.HQ', rate: 0, payout: 1, ownerFirm: 'GadgetCo' },
    commuting: { override: null },
    wealth: {
      housingSector: 'HSG',
      housingYield: 0.04,
      equityYield: 0.06,
      // Decided 3 October 2026: housing wealth already capitalises rents, so the landlords'
      // profits are left out of equity wealth to avoid counting housing twice.
      excludeFromEquity: ['LandlordsC', 'LandlordsM', 'LandlordsR'],
    },
    calibration: {
      targets: { currentAccount: 0, unemploymentRate: 0.05, mainPlaceInCommuting: 0.15 },
      mainShareRange: [0.05, 0.8],
      incomeTaxRateRange: [0, 0.8],
    },
    plausibility: [
      { label: 'Income tax rate θ', metric: 'incomeTaxRate', min: 0.15, max: 0.35 },
      { label: 'City population share s_C', metric: 'mainShare', min: 0.2, max: 0.5 },
      { label: 'GDP per resident (£)', metric: 'gdpPerResident', min: 28_000, max: 40_000 },
      { label: 'Disposable income ÷ GDP', metric: 'disposableIncomeToGdp', min: 0.55, max: 0.75 },
      { label: 'Labour share of GVA', metric: 'labourShareOfGva', min: 0.45, max: 0.6 },
      { label: 'Exports ÷ GDP', metric: 'exportsToGdp', min: 0.25, max: 0.5 },
      { label: 'Dividends to overseas owners ÷ GDP', metric: 'overseasDividendsToGdp', min: 0.05, max: 0.15 },
      { label: 'Providential (PRV) share of GVA', metric: 'sectorShareOfGva', sector: 'PRV', min: 0.12, max: 0.22 },
      { label: 'Housing share of GVA', metric: 'sectorShareOfGva', sector: 'HSG', min: 0.08, max: 0.16 },
      { label: 'C.HQ share of GDP', metric: 'producerShareOfGdp', producer: 'C.HQ', min: 0.05, max: 0.25 },
      { label: 'GVA per job, by place: C > M and C > R', metric: 'mainPlaceHasHighestGvaPerJob' },
    ],
  };
}
