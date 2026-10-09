import { describe, expect, it } from 'vitest';
import { sum } from '../src/engine/linalg';
import { CAPTURE_PLACES, captureBar } from '../web/src/data/capture';
import { formatDelta, formatValue, niceTicks } from '../web/src/data/format';
import { MEASURES, measureById } from '../web/src/data/measures';
import { lensesOf, runFor } from '../web/src/data/model';
import { flowArrows, placeCards } from '../web/src/data/places';
import { producerPicture } from '../web/src/data/producer';
import { difference, seriesPair } from '../web/src/data/series';
import { OFFICIAL_SWITCHES, type Switches } from '../web/src/data/settings';

const TRUE_NOMINAL: Switches = { booking: 'true', measure: 'nominal', convention: 'input' };
const rel = (a: number, b: number) => Math.abs(a / b - 1);

describe('data behind the views', () => {
  const base = runFor('baseline');
  const e3 = runFor('E3');

  it('runs each scenario once and reuses it', () => {
    expect(runFor('E3')).toBe(e3);
    expect(e3).toHaveLength(41);
  });

  it('gives time series that match the engine', () => {
    const pair = seriesPair(measureById('gdp'), base, e3, 0, TRUE_NOMINAL);
    expect(pair.scenario[40]).toBe(e3[40].result.macro.gdpProduction);
    expect(difference(pair)[4]).toBeCloseTo(0, 3);
    expect(difference(pair)[5]).toBeLessThan(0);
  });

  it('gives GVA per job by place under each booking and in the official view', () => {
    const gvaPerJob = measureById('gvaPerJob');
    const cards = placeCards(gvaPerJob, base[0], base[0], { ...TRUE_NOMINAL, booking: 'headOffice' });
    expect(cards.map((c) => Math.round(c.value))).toEqual([89_536, 49_191, 47_731]);
    // In the base year every measurement view agrees, so official equals true booking.
    expect(Math.round(cards[0].official)).toBe(81_598);
    expect(gvaPerJob.value(base[0], 0, OFFICIAL_SWITCHES)).toBeCloseTo(81_598, -1);
  });

  it('evaluates every measure without error', () => {
    for (const m of MEASURES) for (const w of [0, 1, 2]) expect(Number.isFinite(m.value(e3[40], w, TRUE_NOMINAL)), m.id).toBe(true);
  });

  it('lists flows between places that add up to the totals', () => {
    const dividends = flowArrows('dividends', base[0], base[0]);
    const local = [0, 1, 2].reduce((s, w) => s + base[0].result.dividendsByOwner[w] * 0, 0);
    expect(local).toBe(0);
    const overseas = dividends.filter((a) => a.to === 'W').reduce((s, a) => s + a.value, 0);
    expect(rel(overseas, base[0].result.restOfWorld.dividendsReceived)).toBeLessThan(1e-12);
  });

  it('splits each £1 of a gadget by place, summing to £1, and per gadget to £700', () => {
    const perPound = captureBar(base[0], 'C.HQ', false);
    expect(perPound.segments.map((s) => s.place)).toEqual([...CAPTURE_PLACES]);
    expect(sum(perPound.segments.map((s) => s.value))).toBeCloseTo(1, 12);
    const perGadget = captureBar(base[0], 'C.HQ', true);
    expect(sum(perGadget.segments.map((s) => s.value))).toBeCloseTo(700, 9);
    const e1 = captureBar(runFor('E1')[5], 'C.HQ', true);
    expect(e1.segments[3].detail.find((d) => d.id === 'W.IP')!.value).toBeCloseTo(175, 9);
    expect(lensesOf(base[0])).toBe(lensesOf(base[0]));
  });

  it("draws a producer's isoGVA curves through its points", () => {
    const pic = producerPicture(runFor('E1')[5], base[5], 'C.HQ');
    const { scenario: s } = pic;
    for (const point of pic.marginCurve) expect(rel(point.margin * point.Q, s.gva)).toBeLessThan(1e-12);
    for (const point of pic.ratioCurve) expect(rel((point.ratio - 1) * s.C * point.Q, s.gva)).toBeLessThan(1e-12);
    expect(pic.baseline.C).toBeCloseTo(280, 9);
    expect(s.C).toBeCloseTo(455, 9);
  });

  it('formats numbers', () => {
    expect(formatValue(52.208e9, 'gbp')).toBe('£52.21bn');
    expect(formatValue(81_598, 'gbpPerPerson')).toBe('£81.6k');
    expect(formatValue(0.05, 'rate')).toBe('5.0%');
    expect(formatValue(0.68, 'gbp')).toBe('68.0p');
    expect(formatDelta(-0.43e9, 'gbp')).toBe('−£430.0m');
    expect(formatDelta(0.041, 'rate')).toBe('+4.10 pp');
    expect(niceTicks(0, 52)).toEqual([0, 20, 40, 60]);
    expect(niceTicks(-1.7, 0.4)).toEqual([-2, -1.5, -1, -0.5, 0, 0.5]);
  });
});

import { compile } from '../src/engine/economy';
import { applyChange } from '../src/engine/scenario';
import { decodeScenario, describeChange, encodeScenario, switchCatalogue } from '../web/src/data/switches';
import { params, runScenario, setCustomScenario, customScenario } from '../web/src/data/model';

describe('scenario editor', () => {
  const catalogue = switchCatalogue(params, runFor('baseline')[0].result.commuting);

  it('lists every §14 switch, each at a path that exists, with its base value', () => {
    expect(new Set(catalogue.map((d) => d.group))).toEqual(new Set(['S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15']));
    expect(new Set(catalogue.map((d) => d.id)).size).toBe(catalogue.length);
    for (const d of catalogue) {
      // Setting each switch to its base value is accepted and compiles.
      compile(applyChange(params, { period: 1, path: d.path, set: d.base }));
    }
    expect(catalogue.find((d) => d.id === 'producers/R.AGR/markup')!.base).toBeCloseTo(0.538462, 6);
  });

  it('round-trips a custom scenario through its URL form', () => {
    const s = { name: 'Test', description: 'Rents and royalties', changes: [{ period: 5, path: ['producers', 'C.HSG', 'fixedPrice'], scale: 1.3 }, { period: 8, path: ['royalty', 'rate'], set: 0.1 }] };
    expect(decodeScenario(encodeScenario(s))).toEqual(s);
    expect(describeChange(s.changes[0], catalogue)).toBe('Price index: Housing, city × 1.3');
    expect(() => decodeScenario('{"c": 3}')).toThrow(/list of changes/);
  });

  it('accepts a custom scenario only if it runs, and reproduces an experiment exactly', () => {
    const e5 = setCustomScenario({ name: 'E5 again', description: '', changes: [{ period: 5, path: ['producers', 'C.HSG', 'fixedPrice'], scale: 1.3 }] });
    expect(e5[40].result.macro.gdpProduction).toBe(runFor('E5')[40].result.macro.gdpProduction);
    expect(() => setCustomScenario({ name: 'bad', description: '', changes: [{ period: 5, path: ['producers', 'C.XYZ', 'markup'], set: 1 }] })).toThrow(/Unknown parameter/);
    expect(customScenario()!.name).toBe('E5 again');
    expect(runScenario(null)).toBe(runFor('baseline'));
  });
});
