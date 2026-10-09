/** Time series for the views (views plan 8.1): a measure in the baseline and in a scenario, t = 0…40. */

import type { PeriodRecord } from '../../../src/engine/run';
import type { Measure } from './measures';
import type { Switches } from './settings';

export interface SeriesPair {
  baseline: number[];
  scenario: number[];
}

export function seriesPair(measure: Measure, baseline: PeriodRecord[], scenario: PeriodRecord[], w: number, s: Switches): SeriesPair {
  return {
    baseline: baseline.map((r) => measure.value(r, w, s)),
    scenario: scenario.map((r) => measure.value(r, w, s)),
  };
}

/** The scenario's difference from the baseline, period by period. */
export function difference(pair: SeriesPair): number[] {
  return pair.scenario.map((v, t) => v - pair.baseline[t]);
}
