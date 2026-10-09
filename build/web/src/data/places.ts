/** The map of places (views plan 8.2): a card per place, and flows between places. */

import { FLOW_TYPES, placeFlows, type FlowType } from '../../../src/engine/lenses';
import type { PeriodRecord } from '../../../src/engine/run';
import type { Unit } from './format';
import type { Measure } from './measures';
import { OFFICIAL_SWITCHES, type Switches } from './settings';

export interface PlaceCard {
  place: string;
  value: number;
  baseline: number;
  /** In the true-flows view, what official statistics would report for the same measure. */
  official: number;
}

export function placeCards(measure: Measure, scenario: PeriodRecord, baseline: PeriodRecord, s: Switches): PlaceCard[] {
  return scenario.econ.places.map((place, w) => ({
    place,
    value: measure.value(scenario, w, s),
    baseline: measure.value(baseline, w, s),
    official: measure.value(scenario, w, OFFICIAL_SWITCHES),
  }));
}

export const FLOW_LABELS: Record<FlowType, { label: string; unit: Unit; caption: string }> = {
  commuters: { label: 'Commuters', unit: 'people', caption: 'Residents of one place working in another' },
  wages: { label: 'Wages', unit: 'gbp', caption: 'Wages paid by workplaces to residents elsewhere' },
  dividends: { label: 'Dividends', unit: 'gbp', caption: "Profits paid out to firms' owners, at home and abroad" },
  purchases: { label: 'Purchases', unit: 'gbp', caption: 'Payments for goods and services: trade between places, exports and imports' },
  royalties: { label: 'Royalties', unit: 'gbp', caption: 'Royalties to the offshore IP holder' },
  taxes: { label: 'Taxes', unit: 'gbp', caption: 'Income and profit tax paid to the government' },
  benefits: { label: 'Benefits', unit: 'gbp', caption: 'Benefits paid by the government' },
};

export { FLOW_TYPES };

export interface FlowArrow {
  from: string;
  to: string;
  value: number;
  baseline: number;
}

/** Flows between different nodes (flows within a place are left out), largest first. */
export function flowArrows(type: FlowType, scenario: PeriodRecord, baseline: PeriodRecord): FlowArrow[] {
  const s = placeFlows(scenario.econ, scenario.result);
  const b = placeFlows(baseline.econ, baseline.result);
  const arrows: FlowArrow[] = [];
  s.nodes.forEach((from, i) =>
    s.nodes.forEach((to, j) => {
      const value = s.flows[type][i][j];
      const before = b.flows[type][i][j];
      if (i !== j && (value > 0 || before > 0)) arrows.push({ from, to, value, baseline: before });
    }),
  );
  return arrows.sort((x, y) => y.value - x.value);
}

/** Flows inside each place: local workers, local trade. */
export function localFlow(type: FlowType, record: PeriodRecord, place: string): number {
  const f = placeFlows(record.econ, record.result);
  const i = f.nodes.indexOf(place);
  return i < 0 ? 0 : f.flows[type][i][i];
}
