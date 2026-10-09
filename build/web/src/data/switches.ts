/**
 * The scenario editor's catalogue (views plan 8.6): every §14 switch, with its path in the
 * parameters and its base value, generated from the spec economy so it can't drift from it.
 */

import { canonicalJson, type Change, type Scenario } from '../../../src/engine/scenario';
import type { Params } from '../../../src/engine/types';
import { PLACE_NAMES, producerName } from './names';

export type SwitchKind = 'number' | 'owners' | 'commuting' | 'boolean';

export interface SwitchDef {
  /** The path joined with '/', unique. */
  id: string;
  group: string;
  label: string;
  path: (string | number)[];
  kind: SwitchKind;
  base: unknown;
}

export const SWITCH_GROUPS: Record<string, string> = {
  S4: 'S4 Royalty to the offshore IP holder',
  S5: 'S5 Markups',
  S6: 'S6 Fixed prices',
  S7: 'S7 Wages per job',
  S8: 'S8 Public services and benefits',
  S9: 'S9 Ownership',
  S10: 'S10 Commuting',
  S11: 'S11 Exports',
  S12: 'S12 Technology',
  S13: 'S13 Tax rates',
  S14: 'S14 Households',
  S15: 'S15 Test mode',
};

const place = (p: string) => PLACE_NAMES[p] ?? p;

export function switchCatalogue(params: Params, baseCommuting: number[][]): SwitchDef[] {
  const out: SwitchDef[] = [];
  const add = (group: string, label: string, path: (string | number)[], kind: SwitchKind, base: unknown) =>
    out.push({ id: path.join('/'), group, label, path, kind, base });
  const ids = Object.keys(params.producers);
  const domestic = ids.filter((id) => params.producers[id].place !== params.restOfWorld);

  add('S4', 'Royalty rate, share of the payer\'s revenue (r_IP)', ['royalty', 'rate'], 'number', params.royalty.rate);
  add('S4', 'Share of royalties paid out as dividends (ρ_IP)', ['royalty', 'payout'], 'number', params.royalty.payout);
  for (const id of ids) {
    const p = params.producers[id];
    if (p.pricing === 'markup') add('S5', `Markup: ${producerName(id)}`, ['producers', id, 'markup'], 'number', p.markup);
    if (p.pricing === 'fixed') add('S6', `Price index: ${producerName(id)}`, ['producers', id, 'fixedPrice'], 'number', p.fixedPrice);
  }
  for (const id of domestic) add('S7', `Wage per job: ${producerName(id)}`, ['producers', id, 'wagePerJob'], 'number', params.producers[id].wagePerJob);
  for (const p of params.places) {
    add('S8', `Public-service provision multiplier: ${place(p)}`, ['government', 'provisionMultiplier', p], 'number', params.government.provisionMultiplier[p]);
  }
  add('S8', 'Benefit per non-working-age resident (£)', ['government', 'benefitNonWorking'], 'number', params.government.benefitNonWorking);
  add('S8', 'Benefit per unemployed person (£)', ['government', 'benefitUnemployed'], 'number', params.government.benefitUnemployed);
  for (const p of params.places) add('S8', `Public-service quality index: ${place(p)}`, ['government', 'quality', p], 'number', params.government.quality[p]);
  for (const [name, firm] of Object.entries(params.firms)) {
    if (!firm.government) add('S9', `Owners of ${name}`, ['firms', name, 'owners'], 'owners', firm.owners);
  }
  add('S10', 'Commuting matrix (share of each workplace\'s jobs by residents\' place)', ['commuting', 'override'], 'commuting', baseCommuting);
  add('S11', 'Total exports X (£, base prices)', ['exports', 'total'], 'number', params.exports.total);
  for (const [id, share] of Object.entries(params.exports.mix)) add('S11', `Export mix: ${producerName(id)}`, ['exports', 'mix', id], 'number', share);
  for (const id of domestic) {
    const p = params.producers[id];
    for (const [supplier, a] of Object.entries(p.inputs)) {
      add('S12', `Input of ${producerName(supplier)} per unit of ${producerName(id)}`, ['producers', id, 'inputs', supplier], 'number', a);
    }
    add('S12', `Jobs per unit of output: ${producerName(id)}`, ['producers', id, 'jobsPerUnit'], 'number', p.jobsPerUnit);
  }
  add('S13', 'Income tax rate θ', ['government', 'incomeTaxRate'], 'number', params.government.incomeTaxRate);
  add('S13', 'Profit tax rate τ', ['government', 'profitTaxRate'], 'number', params.government.profitTaxRate);
  add('S14', 'Spending out of disposable income α₁', ['households', 'alpha1'], 'number', params.households.alpha1);
  add('S14', 'Spending out of last period\'s money α₂', ['households', 'alpha2'], 'number', params.households.alpha2);
  add('S14', 'Share of discretionary spending on gadgets s_g', ['households', 'gadgetShare'], 'number', params.households.gadgetShare);
  for (const [sector, byPlace] of Object.entries(params.households.essentialsPerResident)) {
    for (const [p, units] of Object.entries(byPlace)) {
      add('S14', `Essential ${sector === 'HSG' ? 'housing' : sector === 'UTL' ? 'utilities' : 'everyday basics'} per resident: ${place(p)}`, ['households', 'essentialsPerResident', sector, p], 'number', units);
    }
  }
  add('S15', 'Freeze households\' purchases at base-year quantities', ['households', 'freezeConsumption'], 'boolean', params.households.freezeConsumption);
  return out;
}

export const switchId = (path: Change['path']) => path.join('/');

/** A short readable description of one change. */
export function describeChange(change: Change, catalogue: SwitchDef[]): string {
  const def = catalogue.find((d) => d.id === switchId(change.path));
  const what = def?.label ?? switchId(change.path);
  if (change.scale !== undefined) return `${what} × ${change.scale}`;
  if (change.add !== undefined) return `${what} ${change.add >= 0 ? '+' : '−'} ${Math.abs(change.add)}`;
  return `${what} = ${typeof change.set === 'object' ? canonicalJson(change.set) : String(change.set)}`;
}

/** Custom scenarios in the URL: compact JSON. */
export function encodeScenario(s: Scenario): string {
  return JSON.stringify({ n: s.name, d: s.description, c: s.changes });
}

export function decodeScenario(text: string): Scenario {
  const raw = JSON.parse(text) as { n?: unknown; d?: unknown; c?: unknown; name?: unknown; description?: unknown; changes?: unknown };
  const changes = raw.c ?? raw.changes;
  if (!Array.isArray(changes)) throw new Error('A scenario needs a list of changes');
  for (const c of changes as Change[]) {
    if (typeof c?.period !== 'number' || !Array.isArray(c.path)) throw new Error('Each change needs a period and a path');
  }
  return { name: String(raw.n ?? raw.name ?? 'Custom scenario'), description: String(raw.d ?? raw.description ?? ''), changes: changes as Change[] };
}
