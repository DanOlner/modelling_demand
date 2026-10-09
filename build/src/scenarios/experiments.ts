/**
 * §15: the experiments. Each starts from the base year, applies its change at t = 5 and runs
 * to t = 40. Each comes with the spec's expectations, written as checks on the change in a
 * measure between t = 4 and the first period after the change (t = 5) and the last (t = 40).
 * A few expectations, marked "derived", aren't in the spec but follow from its arithmetic.
 */

import {
  byPlace,
  bySector,
  gvaByPlace,
  gvaPerJobByPlace,
  gvaPerUnit,
  ofProducer,
  residualIncomePerResident,
  servicesPerResident,
} from '../engine/aggregates';
import { localPurchaseShares, measurement, wealth, workplaceGva, type Booking, type MeasurementView } from '../engine/lenses';
import type { PeriodRecord } from '../engine/run';
import type { Change, Scenario } from '../engine/scenario';

export const SHOCK_PERIOD = 5;
export const LAST_PERIOD = 40;
const PLACES = ['C', 'M', 'R'] as const;
const PLACE_NAMES = { C: 'city', M: 'town', R: 'rural area' } as const;

export type Direction = 'rises' | 'falls' | 'unchanged' | 'either';

export interface Expectation {
  claim: string;
  measure: (record: PeriodRecord) => number;
  expected: Direction;
  /** The measure must also move by exactly this ratio (after ÷ before). */
  ratio?: number;
  /** The measure must also go exactly from the first value to the second. */
  values?: [number, number];
  /** When to check it; by default both just after the change and at the end of the run. */
  when?: 'first' | 'last' | 'both';
}

export interface Experiment {
  id: string;
  title: string;
  scenario: Scenario;
  expectations: Expectation[];
}

// Measures. `r.econ` and `r.result` are those of the period being measured.
const place = (r: PeriodRecord, p: string) => r.econ.places.indexOf(p);
const gdp = (r: PeriodRecord) => r.result.macro.gdpProduction;
const gni = (r: PeriodRecord) => r.result.macro.gni;
const gvaIn = (p: string) => (r: PeriodRecord) => gvaByPlace(r.econ, r.result)[place(r, p)];
const gvaPerJobIn = (p: string) => (r: PeriodRecord) => gvaPerJobByPlace(r.econ, r.result)[place(r, p)];
const jobsIn = (p: string) => (r: PeriodRecord) => r.result.workplaces.jobs[place(r, p)];
const outputIn = (p: string) => (r: PeriodRecord) => byPlace(r.econ, r.result.producers.output)[place(r, p)];
const disposableIncomeIn = (p: string) => (r: PeriodRecord) => r.result.households.disposableIncome[place(r, p)];
const dividendsIn = (p: string) => (r: PeriodRecord) => r.result.households.dividendsReceived[place(r, p)];
const residualIncomeIn = (p: string) => (r: PeriodRecord) => residualIncomePerResident(r.result)[place(r, p)];
const servicesIn = (p: string) => (r: PeriodRecord) => servicesPerResident(r.econ, r.result)[place(r, p)];
const price = (id: string) => (r: PeriodRecord) => ofProducer(r.econ, r.result.prices, id);
const output = (id: string) => (r: PeriodRecord) => ofProducer(r.econ, r.result.producers.output, id);
const jobs = (id: string) => (r: PeriodRecord) => ofProducer(r.econ, r.result.producers.jobs, id);
const gvaUnit = (id: string) => (r: PeriodRecord) => gvaPerUnit(r.econ, r.result, id);
const sectorJobs = (sector: string) => (r: PeriodRecord) => bySector(r.econ, r.result.producers.jobs, sector);
const unemploymentRate = (r: PeriodRecord) => r.result.macro.unemploymentRate;
const imports = (r: PeriodRecord) => r.result.macro.importsValue;
const bookedIn = (booking: Booking, p: string) => (r: PeriodRecord) => workplaceGva(r.econ, r.result).gva[booking][place(r, p)];
/** How much more GVA a place has under head-office booking than under true booking. */
const headOfficeGain = (p: string) => (r: PeriodRecord) => bookedIn('headOffice', p)(r) - bookedIn('true', p)(r);
const localShare = (id: string) => (r: PeriodRecord) => localPurchaseShares(r.econ, r.result)[r.econ.index[id]];
const realGvaPerServiceJob = (view: MeasurementView, convention: 'input' | 'indicator') => (r: PeriodRecord) =>
  measurement(r).publicServicesPerJob[view][convention];
const VIEW_NAMES = { ownPrice: 'own base prices', sectorDeflated: 'sector deflators' } as const;

const everyPlace = (make: (p: (typeof PLACES)[number]) => Expectation) => PLACES.map(make);

function experiment(id: string, title: string, description: string, changes: Change[], expectations: Expectation[]): Experiment {
  return { id, title, scenario: { name: `${id} ${title}`, description, changes }, expectations };
}

const at = (period: number, path: Change['path'], op: Omit<Change, 'period' | 'path'>): Change => ({ period, path, ...op });

const e1Expectations: Expectation[] = [
  { claim: 'National GDP falls', measure: gdp, expected: 'falls' },
  { claim: 'City GVA falls', measure: gvaIn('C'), expected: 'falls' },
  {
    claim: "C.HQ's GVA per job falls from £300,000 to £175,000",
    measure: (r) => gvaUnit('C.HQ')(r) / r.econ.jobsPerUnit[r.econ.index['C.HQ']],
    expected: 'falls',
    values: [300_000, 175_000],
  },
  { claim: 'UK profit tax falls', measure: (r) => r.result.government.profitTax, expected: 'falls' },
  {
    claim: "GadgetCo's owners gain the tax saving: their dividends, including the IP holder's, rise",
    measure: (r) => ofProducer(r.econ, r.result.producers.dividends, 'C.HQ') + r.result.ip.dividends,
    expected: 'rises',
  },
  { claim: 'GNI falls', measure: gni, expected: 'falls' },
  { claim: 'GNI falls by less than GDP (GNI − GDP rises)', measure: (r) => gni(r) - gdp(r), expected: 'rises' },
];

export const EXPERIMENTS: Experiment[] = [
  experiment(
    'E1',
    'Cupertino: offshore the IP',
    'C.HQ pays a royalty of 25% of its revenue to the offshore IP holder, which pays it all out as dividends.',
    [at(SHOCK_PERIOD, ['royalty', 'rate'], { set: 0.25 })],
    e1Expectations,
  ),
  experiment(
    'E1b',
    'Cupertino, with the cash held offshore',
    'As E1, but the IP holder keeps the royalties offshore instead of paying dividends (ρ_IP = 0).',
    [at(SHOCK_PERIOD, ['royalty', 'rate'], { set: 0.25 }), at(SHOCK_PERIOD, ['royalty', 'payout'], { set: 0 })],
    [
      { claim: 'National GDP falls', measure: gdp, expected: 'falls' },
      { claim: 'GNI falls', measure: gni, expected: 'falls' },
      { claim: "The rest of the world's money grows: the cash piles up offshore", measure: (r) => r.money.restOfWorld, expected: 'rises' },
    ],
  ),
  experiment(
    'E2',
    'Supermarket squeeze',
    'Markups fall for farms (0.538 → 0.40) and food processing (0.220 → 0.10), and rise for retail (0.25 → 0.28).',
    [
      at(SHOCK_PERIOD, ['producers', 'R.AGR', 'markup'], { set: 0.4 }),
      at(SHOCK_PERIOD, ['producers', 'M.FOD', 'markup'], { set: 0.1 }),
      ...PLACES.map((p) => at(SHOCK_PERIOD, ['producers', `${p}.RET`, 'markup'], { set: 0.28 })),
    ],
    [
      { claim: 'The farm price falls to 0.91', measure: price('R.AGR'), expected: 'falls', values: [1, 0.91] },
      { claim: 'The food-processing price falls to 0.8624', measure: price('M.FOD'), expected: 'falls', values: [1, 0.8624] },
      ...everyPlace((p) => ({
        claim: `The final retail price falls slightly, to 0.9958195 (${PLACE_NAMES[p]})`,
        measure: price(`${p}.RET`),
        expected: 'falls' as const,
        values: [1, 1.28 * 0.777984] as [number, number],
      })),
      { claim: 'Farm GVA per unit falls 13.8% (0.65 → 0.56)', measure: gvaUnit('R.AGR'), expected: 'falls', values: [0.65, 0.56] },
      { claim: 'Food-processing GVA per unit falls 25.4% (0.40 → 0.2984)', measure: gvaUnit('M.FOD'), expected: 'falls', values: [0.4, 0.2984] },
      ...everyPlace((p) => ({
        claim: `Retail GVA per unit rises 2.97% (0.60 → 0.6178) (${PLACE_NAMES[p]})`,
        measure: gvaUnit(`${p}.RET`),
        expected: 'rises' as const,
        values: [0.6, 1.28 * 0.777984 - 0.377984] as [number, number],
      })),
      {
        claim: "Under head-office booking the city gains more GVA than under true booking: town and rural retail profit is booked in the city",
        measure: headOfficeGain('C'),
        expected: 'rises',
      },
      { claim: 'Under head-office booking the town loses more GVA than under true booking', measure: headOfficeGain('M'), expected: 'falls' },
      { claim: 'Under head-office booking the rural area loses more GVA than under true booking', measure: headOfficeGain('R'), expected: 'falls' },
    ],
  ),
  experiment(
    'E3',
    'Austerity in providential services',
    'Public-service provision per resident falls 10% in every place.',
    PLACES.map((p) => at(SHOCK_PERIOD, ['government', 'provisionMultiplier', p], { scale: 0.9 })),
    [
      { claim: 'Public-service jobs fall 10%', measure: sectorJobs('PRV'), expected: 'falls', ratio: 0.9 },
      { claim: 'Unemployment rises', measure: unemploymentRate, expected: 'rises' },
      { claim: 'Benefits rise', measure: (r) => r.result.government.benefits, expected: 'rises' },
      ...everyPlace((p) => ({ claim: `Disposable income falls (${PLACE_NAMES[p]})`, measure: disposableIncomeIn(p), expected: 'falls' as const })),
      ...everyPlace((p) => ({ claim: `Retail output falls (${PLACE_NAMES[p]})`, measure: output(`${p}.RET`), expected: 'falls' as const })),
      ...everyPlace((p) => ({ claim: `Residual income per resident falls (${PLACE_NAMES[p]})`, measure: residualIncomeIn(p), expected: 'falls' as const })),
      ...everyPlace((p) => ({
        claim: `GVA per job may rise as low-GVA jobs go: the streetlight effect (${PLACE_NAMES[p]}; sign recorded)`,
        measure: gvaPerJobIn(p),
        expected: 'either' as const,
      })),
      ...everyPlace((p) => ({ claim: `Access to services falls 10% (${PLACE_NAMES[p]})`, measure: servicesIn(p), expected: 'falls' as const, ratio: 0.9 })),
    ],
  ),
  experiment(
    'E4',
    'Overseas takeover',
    'CompCo and FoodCo pass to overseas owners: ownership becomes C 0.05, M 0.05, R 0, W 0.90.',
    ['CompCo', 'FoodCo'].map((firm) => at(SHOCK_PERIOD, ['firms', firm, 'owners'], { set: { C: 0.05, M: 0.05, R: 0, W: 0.9 } })),
    [
      { claim: "Town residents' dividends fall", measure: dividendsIn('M'), expected: 'falls' },
      { claim: "Town residents' disposable income falls", measure: disposableIncomeIn('M'), expected: 'falls' },
      { claim: 'Dividends paid to overseas owners rise', measure: (r) => r.result.restOfWorld.dividendsReceived, expected: 'rises' },
      { claim: 'GNI falls', measure: gni, expected: 'falls' },
      { claim: 'Later, lower town spending cuts local retail jobs', measure: jobs('M.RET'), expected: 'falls', when: 'last' },
    ],
  ),
  experiment(
    'E5',
    'City rents up 30%',
    'The fixed price of city housing rises 30%.',
    [at(SHOCK_PERIOD, ['producers', 'C.HSG', 'fixedPrice'], { scale: 1.3 })],
    [
      { claim: 'City housing GVA rises', measure: (r) => ofProducer(r.econ, r.result.producers.gva, 'C.HSG'), expected: 'rises' },
      { claim: 'City GVA per job rises', measure: gvaPerJobIn('C'), expected: 'rises' },
      { claim: "City landlords' income rises", measure: (r) => ofProducer(r.econ, r.result.producers.dividends, 'C.HSG'), expected: 'rises' },
      { claim: "City residents' housing wealth rises", measure: (r) => wealth(r).housing[place(r, 'C')], expected: 'rises' },
      { claim: 'Housing wealth rises overall, overseas owners included', measure: (r) => wealth(r).housingByOwner.reduce((s, x) => s + x, 0), expected: 'rises' },
      { claim: 'City residual income per resident falls', measure: residualIncomeIn('C'), expected: 'falls' },
    ],
  ),
  experiment(
    'E6',
    'Export slump',
    'All export quantities fall 20%.',
    [at(SHOCK_PERIOD, ['exports', 'total'], { scale: 0.8 })],
    [
      ...(['C', 'M'] as const).map((p) => ({ claim: `Output falls (${PLACE_NAMES[p]})`, measure: outputIn(p), expected: 'falls' as const })),
      { claim: 'Farm output falls, through food processing', measure: output('R.AGR'), expected: 'falls' },
      ...everyPlace((p) => ({ claim: `Jobs fall (${PLACE_NAMES[p]})`, measure: jobsIn(p), expected: 'falls' as const })),
      { claim: 'Unemployment rises', measure: unemploymentRate, expected: 'rises' },
      { claim: 'The government deficit rises (its balance falls)', measure: (r) => r.result.government.balance, expected: 'falls' },
      { claim: 'Imports fall', measure: imports, expected: 'falls' },
      { claim: 'Imports fall only partly, by less than exports (imports − exports rises)', measure: (r) => imports(r) - r.result.macro.exportsValue, expected: 'rises' },
    ],
  ),
  experiment(
    'E7',
    'Local procurement (Preston-style)',
    "Each place's public services buy 0.04 less imported goods per unit, and 0.02 more each from local retail and local utilities.",
    PLACES.flatMap((p) => [
      at(SHOCK_PERIOD, ['producers', `${p}.PRV`, 'inputs', 'W.GEN'], { add: -0.04 }),
      at(SHOCK_PERIOD, ['producers', `${p}.PRV`, 'inputs', `${p}.RET`], { add: 0.02 }),
      at(SHOCK_PERIOD, ['producers', `${p}.PRV`, 'inputs', `${p}.UTL`], { add: 0.02 }),
    ]),
    [
      { claim: 'Imports fall', measure: imports, expected: 'falls' },
      ...everyPlace((p) => ({ claim: `Local retail output rises (${PLACE_NAMES[p]})`, measure: output(`${p}.RET`), expected: 'rises' as const })),
      ...everyPlace((p) => ({ claim: `Local utilities output rises (${PLACE_NAMES[p]})`, measure: output(`${p}.UTL`), expected: 'rises' as const })),
      ...everyPlace((p) => ({
        claim: `Local retail and utilities jobs rise (${PLACE_NAMES[p]})`,
        measure: (r: PeriodRecord) => jobs(`${p}.RET`)(r) + jobs(`${p}.UTL`)(r),
        expected: 'rises' as const,
      })),
      ...everyPlace((p) => ({ claim: `Disposable income rises (${PLACE_NAMES[p]})`, measure: disposableIncomeIn(p), expected: 'rises' as const })),
      ...everyPlace((p) => ({
        claim: `The local share of public-service purchases rises (${PLACE_NAMES[p]})`,
        measure: localShare(`${p}.PRV`),
        expected: 'rises' as const,
        // The city's public services already buy business services locally.
        values: (p === 'C' ? [0.12 / 0.18, 0.16 / 0.18] : [0.1 / 0.18, 0.14 / 0.18]) as [number, number],
      })),
    ],
  ),
  experiment(
    'E8',
    'Providential "efficiency"',
    'Public-service jobs per unit fall 10%, with service quantities and quality unchanged.',
    PLACES.map((p) => at(SHOCK_PERIOD, ['producers', `${p}.PRV`, 'jobsPerUnit'], { scale: 0.9 })),
    [
      { claim: 'Public-service jobs fall 10%', measure: sectorJobs('PRV'), expected: 'falls', ratio: 0.9 },
      ...everyPlace((p) => ({ claim: `Public-service quantities are unchanged (${PLACE_NAMES[p]})`, measure: output(`${p}.PRV`), expected: 'unchanged' as const })),
      ...everyPlace((p) => ({
        claim: `The cost price of public services falls to 0.925 (${PLACE_NAMES[p]})`,
        measure: price(`${p}.PRV`),
        expected: 'falls' as const,
        values: [1, 0.925] as [number, number],
      })),
      ...(['ownPrice', 'sectorDeflated'] as const).flatMap((view): Expectation[] => [
        {
          claim: `Real GVA per public-service job rises 11.1% under the indicator convention (${VIEW_NAMES[view]})`,
          measure: realGvaPerServiceJob(view, 'indicator'),
          expected: 'rises',
          ratio: 1 / 0.9,
        },
        {
          claim: `Real GVA per public-service job rises about 0.95% under the input convention (${VIEW_NAMES[view]})`,
          measure: realGvaPerServiceJob(view, 'input'),
          expected: 'rises',
          ratio: 0.745 / 0.9 / 0.82,
        },
      ]),
    ],
  ),
  experiment(
    'E8b',
    'Providential "efficiency", with quality down 10%',
    'As E8, and the quality of public services also falls 10%.',
    [
      ...PLACES.map((p) => at(SHOCK_PERIOD, ['producers', `${p}.PRV`, 'jobsPerUnit'], { scale: 0.9 })),
      ...PLACES.map((p) => at(SHOCK_PERIOD, ['government', 'quality', p], { scale: 0.9 })),
    ],
    [
      { claim: 'Public-service jobs fall 10%', measure: sectorJobs('PRV'), expected: 'falls', ratio: 0.9 },
      ...everyPlace((p) => ({ claim: `Quality-adjusted access to services falls 10% (${PLACE_NAMES[p]})`, measure: servicesIn(p), expected: 'falls' as const, ratio: 0.9 })),
      ...(['ownPrice', 'sectorDeflated'] as const).flatMap((view): Expectation[] => [
        {
          // Volume 0.9x less inputs of 0.18x, over 0.9 of the jobs: (0.72/0.9)/0.82.
          claim: `Derived: real GVA per public-service job falls 2.4% under the indicator convention, which sees the quality loss (${VIEW_NAMES[view]})`,
          measure: realGvaPerServiceJob(view, 'indicator'),
          expected: 'falls',
          ratio: 0.72 / 0.9 / 0.82,
        },
        {
          claim: `Derived: it still rises about 0.95% under the input convention, which can't see quality (${VIEW_NAMES[view]})`,
          measure: realGvaPerServiceJob(view, 'input'),
          expected: 'rises',
          ratio: 0.745 / 0.9 / 0.82,
        },
      ]),
    ],
  ),
];

/** Adds freeze-consumption mode (S15) from period 1, isolating first-round effects. */
export function withFrozenConsumption(scenario: Scenario): Scenario {
  return {
    name: `${scenario.name} (consumption frozen)`,
    description: `${scenario.description} Households' quantities are held at base-year levels.`,
    changes: [{ period: 1, path: ['households', 'freezeConsumption'], set: true }, ...scenario.changes],
  };
}

export interface ExpectationResult {
  claim: string;
  expected: Direction;
  before: number;
  first: number;
  last: number;
  /** Null where the expectation isn't checked at that point. */
  firstOk: boolean | null;
  lastOk: boolean | null;
}

const EXACT = 1e-9;

function holds(e: Expectation, before: number, after: number): boolean {
  if (e.values && !(Math.abs(before / e.values[0] - 1) < EXACT && Math.abs(after / e.values[1] - 1) < EXACT)) return false;
  if (e.ratio !== undefined && !(Math.abs(after / before / e.ratio - 1) < EXACT)) return false;
  const tolerance = EXACT * Math.max(Math.abs(before), Math.abs(after));
  switch (e.expected) {
    case 'rises':
      return after - before > tolerance;
    case 'falls':
      return before - after > tolerance;
    case 'unchanged':
      return Math.abs(after - before) <= tolerance;
    case 'either':
      return true;
  }
}

/** Checks an experiment's expectations against its run, comparing t = 5 and t = 40 with t = 4. */
export function evaluate(experiment: Experiment, records: PeriodRecord[]): ExpectationResult[] {
  const before = records[SHOCK_PERIOD - 1];
  const first = records[SHOCK_PERIOD];
  const last = records[records.length - 1];
  return experiment.expectations.map((e) => {
    const [b, f, l] = [before, first, last].map(e.measure);
    const when = e.when ?? 'both';
    return {
      claim: e.claim,
      expected: e.expected,
      before: b,
      first: f,
      last: l,
      firstOk: when === 'last' ? null : holds(e, b, f),
      lastOk: when === 'first' ? null : holds(e, b, l),
    };
  });
}
