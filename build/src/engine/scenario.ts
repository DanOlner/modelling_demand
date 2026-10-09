/**
 * §14: scenarios. A scenario is a list of changes to parameters, each taking effect from a
 * stated period and staying in force afterwards.
 */

import type { Params } from './types';

export type ParamPath = (string | number)[];

export interface Change {
  /** The first period the change applies to. Period 0 is the base year, which scenarios can't change. */
  period: number;
  /** Path to the parameter, e.g. ['producers', 'R.AGR', 'markup']. */
  path: ParamPath;
  /** The new value. Give exactly one of `set`, `scale` and `add`. */
  set?: unknown;
  /** Multiply the current value by this. */
  scale?: number;
  /** Add this to the current value. */
  add?: number;
}

export interface Scenario {
  name: string;
  description: string;
  changes: Change[];
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function formatPath(path: ParamPath): string {
  return path.map((key) => (typeof key === 'number' ? `[${key}]` : `.${key}`)).join('').slice(1);
}

type Container = Record<string | number, unknown>;

function isContainer(value: unknown): value is Container {
  return value !== null && typeof value === 'object';
}

/** Returns a copy of the parameters with one change applied. Unknown paths are errors, to catch typos. */
export function applyChange(params: Params, change: Change): Params {
  const { path } = change;
  if ([change.set, change.scale, change.add].filter((x) => x !== undefined).length !== 1) {
    throw new Error(`Change to ${formatPath(path)} needs exactly one of 'set', 'scale' and 'add'`);
  }
  if (path.length === 0) throw new Error('A change needs a non-empty path');
  const next = cloneJson(params);
  let target: unknown = next;
  for (const key of path.slice(0, -1)) {
    if (!isContainer(target) || !Object.hasOwn(target, key)) throw new Error(`Unknown parameter: ${formatPath(path)}`);
    target = target[key];
  }
  const last = path[path.length - 1];
  if (!isContainer(target) || !Object.hasOwn(target, last)) throw new Error(`Unknown parameter: ${formatPath(path)}`);
  if (change.set !== undefined) {
    target[last] = cloneJson(change.set);
    return next;
  }
  const current = target[last];
  if (typeof current !== 'number') throw new Error(`Can't change ${formatPath(path)} arithmetically: it isn't a number`);
  target[last] = change.scale !== undefined ? current * change.scale : current + (change.add ?? 0);
  return next;
}

/** The parameters in force in period t: the base parameters with every change up to t applied, in period order. */
export function paramsAt(base: Params, scenario: Scenario | null, t: number): Params {
  if (!scenario) return base;
  const changes = scenario.changes
    .map((change, order) => ({ change, order }))
    .filter(({ change }) => {
      if (!(change.period >= 1)) {
        throw new Error(`Scenario "${scenario.name}" changes ${formatPath(change.path)} in period ${change.period}; changes start from period 1`);
      }
      return change.period <= t;
    })
    .sort((a, b) => a.change.period - b.change.period || a.order - b.order);
  return changes.reduce((params, { change }) => applyChange(params, change), base);
}

/** How many of the scenario's changes are in force in period t; when it doesn't change, the parameters haven't either. */
export function changesInForce(scenario: Scenario | null, t: number): number {
  return scenario ? scenario.changes.filter((change) => change.period <= t).length : 0;
}

/** Key-sorted JSON, so the same parameters always give the same text. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isContainer(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

/** A 53-bit string hash (cyrb53), as 14 hex digits. Used to spot stale calibrations, not for security. */
export function hash53(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}
