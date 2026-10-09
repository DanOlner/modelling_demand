import { describe, expect, it } from 'vitest';
import { placeFlows } from '../src/engine/lenses';
import { sum } from '../src/engine/linalg';
import { run } from '../src/engine/run';
import { specV1 } from '../src/params/spec-v1-calibrated';
import { EXPERIMENTS, SHOCK_PERIOD } from '../src/scenarios/experiments';

const total = (m: number[][]) => sum(m.map(sum));
const rel = (a: number, b: number) => Math.abs(a / b - 1);

describe('flows between places (map view)', () => {
  const e1 = EXPERIMENTS.find((e) => e.id === 'E1')!.scenario;
  for (const [label, record] of [
    ['base year', run(specV1(), null, { periods: 0 })[0]],
    ['E1', run(specV1(), e1, { periods: SHOCK_PERIOD })[SHOCK_PERIOD]],
  ] as const) {
    it(`reconciles every flow type with the accounts (${label})`, () => {
      const { flows, nodes } = placeFlows(record.econ, record.result);
      const r = record.result;
      expect(nodes).toEqual(['C', 'M', 'R', 'W', 'Government']);
      expect(rel(total(flows.commuters), sum(r.workplaces.jobs))).toBeLessThan(1e-12);
      expect(rel(total(flows.wages), sum(r.producers.wageBill))).toBeLessThan(1e-12);
      expect(rel(total(flows.dividends), sum(r.producers.dividends) + r.ip.dividends)).toBeLessThan(1e-12);
      expect(rel(total(flows.taxes), r.government.incomeTax + r.government.profitTax)).toBeLessThan(1e-12);
      expect(rel(total(flows.benefits), r.government.benefits)).toBeLessThan(1e-12);
      // Purchases into the rest of the world are imports; purchases by it are exports.
      expect(rel(sum(flows.purchases.map((row) => row[3])), r.restOfWorld.importPayments)).toBeLessThan(1e-12);
      expect(rel(sum(flows.purchases[3]), r.macro.exportsValue)).toBeLessThan(1e-12);
      // Every domestic producer's revenue arrives as purchases into its place.
      const revenueByPlace = [0, 0, 0];
      for (let j = 0; j < record.econ.nDomestic; j++) revenueByPlace[record.econ.placeOf[j]] += r.producers.revenue[j];
      revenueByPlace.forEach((rev, w) => expect(rel(sum(flows.purchases.map((row) => row[w])), rev)).toBeLessThan(1e-12));
      if (r.ip.royalties > 0) expect(rel(total(flows.royalties), r.ip.royalties)).toBeLessThan(1e-12);
    });
  }
});
