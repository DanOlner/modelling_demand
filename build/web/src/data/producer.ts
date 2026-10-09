/** The single-producer view (views plan 8.5): the rectangle and its isoGVA curves, from lens 11. */

import { isoGvaCurve, producerRectangle, type IsoGvaPoint, type ProducerRectangle } from '../../../src/engine/lenses';
import type { PeriodRecord } from '../../../src/engine/run';

export interface ProducerPicture {
  scenario: ProducerRectangle;
  baseline: ProducerRectangle;
  /** The Q range the isoGVA panels span. */
  qRange: [number, number];
  /** Through the scenario's point and the baseline's, in margin form. */
  marginCurve: IsoGvaPoint[];
  marginCurveBaseline: IsoGvaPoint[];
  /** In the paper's S/C form, both holding C at the scenario's value. */
  ratioCurve: IsoGvaPoint[];
  ratioCurveBaseline: IsoGvaPoint[];
}

export function producerPicture(scenario: PeriodRecord, baseline: PeriodRecord, id: string, points = 80): ProducerPicture {
  const s = producerRectangle(scenario.econ, scenario.result, id);
  const b = producerRectangle(baseline.econ, baseline.result, id);
  const qMax = Math.max(s.Q, b.Q);
  const qRange: [number, number] = [0.3 * qMax, 2.4 * qMax];
  const qs = Array.from({ length: points }, (_, i) => qRange[0] + ((qRange[1] - qRange[0]) * i) / (points - 1));
  return {
    scenario: s,
    baseline: b,
    qRange,
    marginCurve: isoGvaCurve(s.gva, s.C, qs),
    marginCurveBaseline: isoGvaCurve(b.gva, s.C, qs),
    ratioCurve: isoGvaCurve(s.gva, s.C, qs),
    ratioCurveBaseline: isoGvaCurve(b.gva, s.C, qs),
  };
}
