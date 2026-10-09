/**
 * The app's shared state. Every view reads it, and it is mirrored in the URL, so any view can be
 * bookmarked or shared, e.g. ?view=places&scenario=E5&t=40&mode=official.
 */

import type { Booking, FlowType, MeasurementView, ServiceConvention } from '../../../src/engine/lenses';
import { runFor, BASELINE_ID, CUSTOM_ID, LAST_PERIOD, SCENARIOS, customScenario, setCustomScenario } from '../data/model';
import { decodeScenario, encodeScenario } from '../data/switches';
import { effectiveSwitches, type Mode, type Switches } from '../data/settings';

export type ViewId = 'places' | 'time' | 'capture' | 'producer' | 'editor' | 'about';
export const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'places', label: 'Places' },
  { id: 'time', label: 'Over time' },
  { id: 'capture', label: 'Value capture' },
  { id: 'producer', label: 'Producer' },
  { id: 'editor', label: 'Scenario editor' },
  { id: 'about', label: 'About' },
];

class Ui {
  view = $state<ViewId>('places');
  scenario = $state('E1');
  t = $state(LAST_PERIOD);
  mode = $state<Mode>('true');
  booking = $state<Booking>('true');
  measure = $state<MeasurementView>('nominal');
  convention = $state<ServiceConvention>('input');
  place = $state('C');
  product = $state('C.HQ');
  lens = $state('gvaPerJob');
  flow = $state<FlowType>('dividends');
  difference = $state(false);
  perUnit = $state(false);
  theme = $state<'auto' | 'light' | 'dark'>('auto');
  /** Bumped whenever the custom scenario changes, so views re-run. */
  customVersion = $state(0);

  get switches(): Switches {
    return effectiveSwitches(this.mode, { booking: this.booking, measure: this.measure, convention: this.convention });
  }
}

export const ui = new Ui();

const KEYS = ['view', 'scenario', 't', 'mode', 'booking', 'measure', 'convention', 'place', 'product', 'lens', 'flow', 'difference', 'perUnit', 'theme'] as const;

export function readUrl(): void {
  const q = new URLSearchParams(location.search);
  const target = ui as unknown as Record<string, unknown>;
  for (const key of KEYS) {
    const v = q.get(key);
    if (v === null) continue;
    const current = target[key];
    if (typeof current === 'number') {
      const n = Number(v);
      if (Number.isFinite(n)) target[key] = Math.max(0, Math.min(LAST_PERIOD, Math.round(n)));
    } else if (typeof current === 'boolean') target[key] = v === '1';
    else target[key] = v;
  }
  const custom = q.get('custom');
  if (custom) {
    try {
      setCustomScenario(decodeScenario(custom));
      ui.customVersion++;
    } catch {
      // A broken or stale link: fall back to the baseline below.
    }
  }
  if (!SCENARIOS.some((s) => s.id === ui.scenario) && !(ui.scenario === CUSTOM_ID && customScenario())) ui.scenario = BASELINE_ID;
}

export function writeUrl(): void {
  const q = new URLSearchParams();
  const source = ui as unknown as Record<string, unknown>;
  for (const key of KEYS) {
    const v = source[key];
    q.set(key, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  void ui.customVersion;
  const custom = customScenario();
  if (custom && custom.changes.length > 0) q.set('custom', encodeScenario(custom));
  history.replaceState(null, '', `?${q}`);
}

/** The run behind the views: the chosen scenario's, tracked so a new custom scenario re-runs the views. */
export function currentRun() {
  void ui.customVersion;
  return runFor(ui.scenario);
}
