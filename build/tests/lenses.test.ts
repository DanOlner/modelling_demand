import { describe, expect, it } from 'vitest';
import { sum } from '../src/engine/linalg';
import {
  BOOKINGS,
  MEASUREMENT_VIEWS,
  SERVICE_CONVENTIONS,
  accounts,
  isoGvaCurve,
  localPurchaseShares,
  localRetention,
  measurement,
  periodLenses,
  producerRectangle,
  productChains,
  wealth,
  workplaceGva,
} from '../src/engine/lenses';
import { run, type PeriodRecord } from '../src/engine/run';
import type { Scenario } from '../src/engine/scenario';
import { minimalEconomy } from '../src/params/minimal';
import { SPEC_V1_LENSES } from '../src/params/spec-v1';
import { specV1 } from '../src/params/spec-v1-calibrated';
import { EXPERIMENTS, SHOCK_PERIOD } from '../src/scenarios/experiments';

const relative = (actual: number, expected: number) => Math.abs(actual / expected - 1);
const scenarioOf = (id: string): Scenario => EXPERIMENTS.find((e) => e.id === id)!.scenario;
/** The period just after an experiment's change. */
const afterChange = (scenario: Scenario | null): PeriodRecord => run(specV1(), scenario, { periods: SHOCK_PERIOD })[SHOCK_PERIOD];

const base = run(specV1(), null, { periods: 0 })[0];
const e1 = afterChange(scenarioOf('E1'));
const e2 = afterChange(scenarioOf('E2'));
const e5 = afterChange(scenarioOf('E5'));

describe('lens 1: workplace GVA and booking (S1)', () => {
  it('keeps national GVA the same under every booking convention', () => {
    for (const record of [base, e1, e2, e5]) {
      const { gva } = workplaceGva(record.econ, record.result);
      for (const booking of BOOKINGS) expect(relative(sum(gva[booking]), record.result.macro.gdpProduction)).toBeLessThan(1e-12);
    }
  });

  it('books the town and rural profits of the multi-place firms in the city under head-office booking', () => {
    const { econ, result } = base;
    const { gva } = workplaceGva(econ, result);
    const profitOf = (id: string) => result.producers.netProfit[econ.index[id]];
    const moved = ['M.RET', 'R.RET', 'M.UTL', 'R.UTL'].reduce((s, id) => s + profitOf(id), 0);
    expect(relative(gva.headOffice[0] - gva.true[0], moved)).toBeLessThan(1e-12);
    expect(relative(gva.true[1] - gva.headOffice[1], profitOf('M.RET') + profitOf('M.UTL'))).toBeLessThan(1e-12);
    expect(relative(gva.true[2] - gva.headOffice[2], profitOf('R.RET') + profitOf('R.UTL'))).toBeLessThan(1e-12);
  });

  it('matches true booking under wage-bill allocation while profit is proportional to wages, and differs once it is not', () => {
    // Each multi-place firm's producers share one cost structure, so profit is already in proportion to wages.
    const same = workplaceGva(base.econ, base.result);
    same.gva.wageBill.forEach((v, w) => expect(relative(v, same.gva.true[w])).toBeLessThan(1e-12));
    // Raise city retail wages (S7): city retail profit falls relative to its wage bill.
    const record = afterChange({ name: 'city wages', description: '', changes: [{ period: SHOCK_PERIOD, path: ['producers', 'C.RET', 'wagePerJob'], scale: 1.1 }] });
    const { gva } = workplaceGva(record.econ, record.result);
    expect(gva.wageBill[0]).toBeGreaterThan(gva.true[0]);
    expect(relative(sum(gva.wageBill), sum(gva.true))).toBeLessThan(1e-12);
  });

  it('makes no difference in a one-place economy', () => {
    const [record] = run(minimalEconomy(), null, { periods: 0 });
    const { gva } = workplaceGva(record.econ, record.result);
    for (const booking of BOOKINGS) expect(gva[booking][0]).toBeCloseTo(100, 9);
  });
});

describe('lenses 2 and 3: value capture and whole-chain productivity', () => {
  it('shares out the whole price of every final product (§13: they must sum to p_k)', () => {
    for (const record of [base, e1, e2]) {
      for (const chain of productChains(record.econ, record.result)) {
        expect(relative(sum(Object.values(chain.captureByProducer)), chain.price), chain.product).toBeLessThan(1e-12);
        expect(relative(sum(Object.values(chain.captureByPlace)), chain.price), chain.product).toBeLessThan(1e-12);
      }
    }
  });

  it('gives the offshore IP holder a quarter of each gadget under the Cupertino switch', () => {
    const gadget = productChains(e1.econ, e1.result).find((c) => c.product === 'C.HQ')!;
    expect(relative(gadget.captureByProducer['W.IP'], 0.25 * gadget.price)).toBeLessThan(1e-12);
    const before = productChains(base.econ, base.result).find((c) => c.product === 'C.HQ')!;
    expect(before.captureByProducer['W.IP']).toBe(0);
  });

  it('shows far less value per worker along the whole gadget chain than on site', () => {
    const gadget = productChains(base.econ, base.result).find((c) => c.product === 'C.HQ')!;
    expect(relative(gadget.onSiteGvaPerJob, 300_000)).toBeLessThan(1e-9);
    expect(gadget.valuePerChainWorker).toBeLessThan(0.5 * gadget.onSiteGvaPerJob);
    expect(gadget.chainJobsByPlace.W).toBeGreaterThan(0);
    expect(gadget.chainJobsPerUnit).toBeGreaterThan(base.econ.jobsPerUnit[base.econ.index['C.HQ']]);
  });
});

describe('lenses 4–6: incomes and wealth by residence', () => {
  it('gives household income and residual income per resident', () => {
    const { incomes } = periodLenses(base, SPEC_V1_LENSES);
    const hh = base.result.households;
    hh.disposableIncome.forEach((yd, r) => {
      expect(relative(incomes.gdhiPerResident[r], yd / hh.population[r])).toBeLessThan(1e-12);
      expect(relative(incomes.residualIncomePerResident[r], (yd - hh.essentialSpend[r]) / hh.population[r])).toBeLessThan(1e-12);
    });
  });

  it('adds money, housing and equity wealth, leaving the landlords out of equity', () => {
    const w = wealth(base);
    w.total.forEach((total, r) => expect(relative(total, w.money[r] + w.housing[r] + w.equity[r])).toBeLessThan(1e-12));
    const { econ, result } = base;
    const rents = ['C.HSG', 'M.HSG', 'R.HSG'].reduce((s, id) => s + result.producers.revenue[econ.index[id]], 0);
    expect(relative(sum(w.housingByOwner), rents / 0.04)).toBeLessThan(1e-12);
    // Equity wealth capitalises the after-tax profit of every private firm except the landlords.
    let profit = 0;
    for (let j = 0; j < econ.nDomestic; j++) {
      if (!econ.isGovernment[j] && econ.sectorOf[j] !== 'HSG') profit += result.producers.netProfit[j] - result.producers.profitTax[j];
    }
    expect(relative(sum(w.equityByOwner), profit / 0.06)).toBeLessThan(1e-12);
  });

  it("counts the offshore IP holder's profit in GadgetCo's equity", () => {
    // In E1 GadgetCo's after-tax profit falls by 0.75R, but its owners also own the IP holder's R.
    const before = sum(wealth(base).equityByOwner);
    const after = sum(wealth(e1).equityByOwner);
    expect(after).toBeGreaterThan(before);
  });
});

describe('lenses 7 and 8: sector groups and local retention', () => {
  it("splits each place's jobs and GVA completely between the sector groups", () => {
    const { structure } = periodLenses(base, SPEC_V1_LENSES);
    base.econ.places.forEach((_, w) => {
      expect(sum(structure.groups.map((g) => g.jobsShare[w]))).toBeCloseTo(1, 12);
      expect(sum(structure.groups.map((g) => g.gvaShare[w]))).toBeCloseTo(1, 12);
    });
  });

  it('retains all GVA locally in a one-place economy with no depreciation, taxes on profit or outside owners', () => {
    const [record] = run(minimalEconomy(), null, { periods: 0 });
    expect(localRetention(record.econ, record.result)[0]).toBeCloseTo(1, 12);
  });

  it('gives the local share of public-service purchases', () => {
    const shares = localPurchaseShares(base.econ, base.result);
    const of = (id: string) => shares[base.econ.index[id]];
    // C.PRV buys utilities, retail and business services in the city; the others buy business services from the city.
    expect(of('C.PRV')).toBeCloseTo(0.12 / 0.18, 12);
    expect(of('M.PRV')).toBeCloseTo(0.1 / 0.18, 12);
    expect(of('R.PRV')).toBeCloseTo(0.1 / 0.18, 12);
  });
});

describe('lens 9: measurement views (S2, S3)', () => {
  it('gives the same GVA under every view and convention in the base year', () => {
    const m = measurement(base);
    for (const view of MEASUREMENT_VIEWS) {
      for (const convention of SERVICE_CONVENTIONS) {
        m.byProducer[view][convention].forEach((gva, j) =>
          expect(relative(gva, base.result.producers.gva[j]), `${view}/${convention} ${base.econ.ids[j]}`).toBeLessThan(1e-12),
        );
      }
    }
  });

  it("values C.HQ's real GVA at own base prices as x(1 − Σa) − r_IP·x under the Cupertino switch", () => {
    const m = measurement(e1);
    const j = e1.econ.index['C.HQ'];
    const x = e1.result.producers.output[j];
    expect(relative(m.byProducer.ownPrice.input[j], x * (1 - 0.4) - 0.25 * x)).toBeLessThan(1e-12);
  });

  it('shows rents rising in the city as falling real housing output elsewhere, under sector deflators', () => {
    // The housing deflator averages prices across places, so the town and rural area, whose
    // rents haven't changed, are deflated by a higher price: the wedge in §13's measurement lens.
    const before = measurement(base);
    const after = measurement(e5);
    expect(after.deflators.output.HSG).toBeGreaterThan(1);
    for (const id of ['M.HSG', 'R.HSG']) {
      const j = e5.econ.index[id];
      expect(after.byProducer.sectorDeflated.input[j]).toBeLessThan(before.byProducer.sectorDeflated.input[j]);
      expect(relative(after.byProducer.ownPrice.input[j], before.byProducer.ownPrice.input[j])).toBeLessThan(1e-9);
    }
  });
});

describe('lens 10: macro accounts', () => {
  it('measures GDP three ways, and builds GNI up from sector primary incomes to the same total', () => {
    for (const record of [base, e1, afterChange(scenarioOf('E4'))]) {
      const a = accounts(record.econ, record.result, record.money);
      expect(relative(a.gdp.expenditure, a.gdp.production)).toBeLessThan(1e-9);
      expect(relative(a.gdp.income, a.gdp.production)).toBeLessThan(1e-9);
      expect(relative(a.primaryIncome.total, a.gni)).toBeLessThan(1e-9);
    }
  });
});

describe('lens 11: the single-producer view', () => {
  it('has S·Q = revenue, (S − C)·Q = GVA and bands that sum to S − C, for every producer', () => {
    for (const record of [base, e1, e2]) {
      for (const id of record.econ.ids.slice(0, record.econ.nDomestic)) {
        const r = producerRectangle(record.econ, record.result, id);
        expect(relative(r.S * r.Q, r.revenue), id).toBeLessThan(1e-12);
        expect(relative((r.S - r.C) * r.Q, r.gva), id).toBeLessThan(1e-9);
        expect(relative(r.bands.wages + r.bands.depreciation + r.bands.netProfit, r.margin), id).toBeLessThan(1e-12);
      }
    }
  });

  it('shows a gadget as S = £700, C = £280, with bands of £140 wages, £35 depreciation and £245 profit', () => {
    const r = producerRectangle(base.econ, base.result, 'C.HQ');
    expect(r.S).toBeCloseTo(700, 9);
    expect(r.C).toBeCloseTo(280, 9);
    expect(r.bands.wages).toBeCloseTo(140, 9);
    expect(r.bands.depreciation).toBeCloseTo(35, 9);
    expect(r.bands.netProfit).toBeCloseTo(245, 9);
    // Under the Cupertino switch the £175 royalty joins bought-in cost and comes out of profit.
    const cupertino = producerRectangle(e1.econ, e1.result, 'C.HQ');
    expect(cupertino.C).toBeCloseTo(455, 9);
    expect(cupertino.bands.netProfit).toBeCloseTo(70, 9);
  });

  it("draws isoGVA curves in both forms, reproducing the paper's Firms A and B", () => {
    // Firm A (S 7, C 2, Q 4,000) and Firm B (S 5, C 3, Q 10,000) both have GVA 20,000.
    const [a, b] = isoGvaCurve(20_000, 2, [4_000, 10_000]);
    expect(a.margin).toBeCloseTo(5, 12);
    expect(b.margin).toBeCloseTo(2, 12);
    // Holding C = 2, Firm B would sit at S/C = 2.0, not the paper's 1.67 (webber-huaccha note).
    expect(b.ratio).toBeCloseTo(2, 12);
    expect(isoGvaCurve(20_000, 3, [4_000])[0].ratio).toBeCloseTo(1 + 20_000 / 12_000, 12);
  });
});
