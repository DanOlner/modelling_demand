import { describe, expect, it } from 'vitest';
import { gvaByPlace } from '../src/engine/aggregates';
import { sum } from '../src/engine/linalg';
import { run, type PeriodRecord } from '../src/engine/run';
import { specV1 } from '../src/params/spec-v1-calibrated';
import { EXPERIMENTS, LAST_PERIOD, SHOCK_PERIOD, evaluate, withFrozenConsumption, type Experiment } from '../src/scenarios/experiments';

const experiment = (id: string): Experiment => {
  const found = EXPERIMENTS.find((e) => e.id === id);
  if (!found) throw new Error(`No experiment ${id}`);
  return found;
};

/** The period before the change and the period of the change, with consumption frozen. */
function frozenRound(id: string): [PeriodRecord, PeriodRecord] {
  const records = run(specV1(), withFrozenConsumption(experiment(id).scenario), { periods: SHOCK_PERIOD });
  return [records[SHOCK_PERIOD - 1], records[SHOCK_PERIOD]];
}

function expectUnchanged(after: number[], before: number[], label: string) {
  after.forEach((value, i) => expect(Math.abs(value - before[i]) / Math.max(Math.abs(before[i]), 1), `${label}[${i}]`).toBeLessThan(1e-9));
}

describe('§16 T4: Cupertino with consumption frozen', () => {
  const [before, after] = frozenRound('E1');
  const b = before.result;
  const a = after.result;
  const R = 0.25 * a.producers.revenue[after.econ.index['C.HQ']];
  const theta = after.params.government.incomeTaxRate;
  const expectChange = (actual: number, expected: number, label: string) => expect(Math.abs(actual - expected) / R, label).toBeLessThan(1e-9);

  it('pays a royalty of 25% of C.HQ revenue', () => {
    expect(R).toBeGreaterThan(0);
    expectChange(a.ip.royalties, R, 'royalty');
  });

  it('leaves all quantities, jobs and wages unchanged', () => {
    expectUnchanged(a.producers.output, b.producers.output, 'output');
    expectUnchanged(a.producers.jobs, b.producers.jobs, 'jobs');
    expectUnchanged(a.producers.wageBill, b.producers.wageBill, 'wages');
  });

  it('cuts city GVA and GDP by R and leaves the town and rural area alone', () => {
    const [vb, va] = [gvaByPlace(before.econ, b), gvaByPlace(after.econ, a)];
    expectChange(va[0] - vb[0], -R, 'ΔV_C');
    expectChange(a.macro.gdpProduction - b.macro.gdpProduction, -R, 'ΔGDP');
    expectChange(va[1] - vb[1], 0, 'ΔV_M');
    expectChange(va[2] - vb[2], 0, 'ΔV_R');
  });

  it('moves taxes, dividends, GNI and the balances as T4 says', () => {
    expectChange(a.government.profitTax - b.government.profitTax, -0.25 * R, 'ΔT^π = −0.25R');
    expectChange(sum(a.households.dividendsReceived) - sum(b.households.dividendsReceived), 0.0875 * R, "domestic owners' dividends +0.0875R");
    expectChange(a.macro.gni - b.macro.gni, -0.1625 * R, 'ΔGNI = −0.1625R');
    expectChange(a.restOfWorld.balance - b.restOfWorld.balance, 0.1625 * R, 'ΔRB = +0.1625R');
    expectChange(a.government.balance - b.government.balance, -0.25 * R + 0.0875 * theta * R, 'ΔGB = −0.25R + 0.0875θR');
  });
});

describe('§16 T5: supermarket squeeze with consumption frozen', () => {
  it('gives the prices and GVA per unit listed in E2, exactly', () => {
    const records = run(specV1(), withFrozenConsumption(experiment('E2').scenario), { periods: SHOCK_PERIOD });
    for (const r of evaluate(experiment('E2'), records)) expect(r.firstOk, r.claim).toBe(true);
  });
});

describe('§16 T7: overseas takeover with consumption frozen', () => {
  const [before, after] = frozenRound('E4');
  const b = before.result;
  const a = after.result;
  const town = after.econ.places.indexOf('M');
  const theta = after.params.government.incomeTaxRate;

  it('leaves GVA unchanged everywhere', () => {
    expectUnchanged(a.producers.gva, b.producers.gva, 'GVA');
  });

  it("changes town disposable income by (1 − θ) times the change in town dividends", () => {
    const dividends = a.households.dividendsReceived[town] - b.households.dividendsReceived[town];
    const income = a.households.disposableIncome[town] - b.households.disposableIncome[town];
    expect(dividends).toBeLessThan(0);
    expect(Math.abs(income - (1 - theta) * dividends) / Math.abs(dividends)).toBeLessThan(1e-9);
  });

  it('cuts GNI by exactly the rise in dividends paid to overseas owners', () => {
    const overseas = a.restOfWorld.dividendsReceived - b.restOfWorld.dividendsReceived;
    expect(overseas).toBeGreaterThan(0);
    expect(Math.abs(a.macro.gni - b.macro.gni + overseas) / overseas).toBeLessThan(1e-9);
  });
});

describe('§15 experiments: the expected effects, just after the change and at t = 40 (T6 is E3)', () => {
  for (const e of EXPERIMENTS) {
    it(`${e.id} ${e.title}`, () => {
      const records = run(specV1(), e.scenario, { periods: LAST_PERIOD });
      for (const r of evaluate(e, records)) {
        if (r.firstOk !== null) expect(r.firstOk, `${r.claim} (t = ${SHOCK_PERIOD}: ${r.before} → ${r.first})`).toBe(true);
        if (r.lastOk !== null) expect(r.lastOk, `${r.claim} (t = ${LAST_PERIOD}: ${r.before} → ${r.last})`).toBe(true);
      }
    });
  }
});
