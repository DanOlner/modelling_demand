/**
 * Runs the model for the views. The engine runs in the browser: each scenario's 40-period run
 * is computed once, on first use, and kept. Lenses are computed per period on demand and kept too.
 */

import { periodLenses, type PeriodLenses } from '../../../src/engine/lenses';
import { run, type PeriodRecord } from '../../../src/engine/run';
import { canonicalJson, type Scenario } from '../../../src/engine/scenario';
import { SPEC_V1_LENSES } from '../../../src/params/spec-v1';
import { specV1 } from '../../../src/params/spec-v1-calibrated';
import { EXPERIMENTS, LAST_PERIOD, SHOCK_PERIOD } from '../../../src/scenarios/experiments';

export { LAST_PERIOD, SHOCK_PERIOD };

export interface ScenarioChoice {
  id: string;
  title: string;
  description: string;
}

export const BASELINE_ID = 'baseline';
export const CUSTOM_ID = 'custom';

export const SCENARIOS: ScenarioChoice[] = [
  { id: BASELINE_ID, title: 'Baseline: no change', description: 'The calibrated base year, repeated: nothing changes.' },
  ...EXPERIMENTS.map((e) => ({ id: e.id, title: `${e.id} ${e.title}`, description: e.scenario.description })),
];

export const params = specV1();
const runs = new Map<string, PeriodRecord[]>();
let custom: Scenario | null = null;

/** Runs a scenario, or reuses its run. Runs are keyed by the scenario's content. */
export function runScenario(scenario: Scenario | null): PeriodRecord[] {
  const key = scenario ? canonicalJson(scenario.changes) : BASELINE_ID;
  let records = runs.get(key);
  if (!records) {
    records = run(params, scenario, { periods: LAST_PERIOD });
    runs.set(key, records);
  }
  return records;
}

/** Sets the custom scenario, after checking that it runs. Throws, leaving the old one, if it doesn't. */
export function setCustomScenario(scenario: Scenario): PeriodRecord[] {
  const records = runScenario(scenario);
  custom = scenario;
  return records;
}

export function customScenario(): Scenario | null {
  return custom;
}

export function scenarioById(id: string): Scenario | null {
  if (id === BASELINE_ID) return null;
  if (id === CUSTOM_ID) return custom;
  const experiment = EXPERIMENTS.find((e) => e.id === id);
  if (!experiment) throw new Error(`Unknown scenario "${id}"`);
  return experiment.scenario;
}

export function runFor(id: string): PeriodRecord[] {
  return runScenario(scenarioById(id));
}

const lenses = new WeakMap<PeriodRecord, PeriodLenses>();

export function lensesOf(record: PeriodRecord): PeriodLenses {
  let l = lenses.get(record);
  if (!l) {
    l = periodLenses(record, SPEC_V1_LENSES);
    lenses.set(record, l);
  }
  return l;
}
