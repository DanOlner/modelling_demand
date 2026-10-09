/**
 * Runs the baseline and every experiment (§15) to t = 40 and writes, to out/experiments/:
 * - <id>.csv: every result and every lens (§13) as tidy rows (t, table, entity, variable, value);
 * - <id>.json: the scenario, its expectations checked, and the same results nested by period;
 * - summary.md: each experiment's expectations, with the values before and after the change.
 * Run it with `npm run experiments`.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { periodLenses } from '../src/engine/lenses';
import { lensRows, periodRows, toCsv, toNested } from '../src/engine/report';
import { run } from '../src/engine/run';
import { SPEC_V1_LENSES } from '../src/params/spec-v1';
import { specV1 } from '../src/params/spec-v1-calibrated';
import { EXPERIMENTS, LAST_PERIOD, SHOCK_PERIOD, evaluate, type ExpectationResult } from '../src/scenarios/experiments';

const outDir = fileURLToPath(new URL('../out/experiments/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const base = specV1();
const formatValue = (x: number) => {
  const size = Math.abs(x);
  if (size >= 1e9) return `${(x / 1e9).toFixed(3)}bn`;
  if (size >= 1e6) return `${(x / 1e6).toFixed(3)}m`;
  if (size >= 1000) return Math.round(x).toLocaleString('en-GB');
  if (size < 1e-3) return '0'; // zero up to rounding error, e.g. a balance of £0.0003
  return x.toPrecision(6);
};
/** A percentage change where it means something (a positive starting value); otherwise the change itself. */
const change = (before: number, after: number) => {
  const diff = after - before;
  if (before > 1e-3 && before > 1e-6 * Math.abs(after)) return ` (${diff >= 0 ? '+' : '−'}${Math.abs((diff / before) * 100).toFixed(2)}%)`;
  return diff === 0 ? '' : ` (${diff >= 0 ? '+' : '−'}${formatValue(Math.abs(diff))})`;
};
const verdict = (ok: boolean | null) => (ok === null ? '–' : ok ? 'yes' : '**NO**');
const pct = (x: number) => `${(100 * x).toFixed(2)}%`;

const summary: string[] = [
  '# Experiment results',
  '',
  `Each experiment changes its parameters at t = ${SHOCK_PERIOD} and runs to t = ${LAST_PERIOD} (§15).`,
  `"Before" is t = ${SHOCK_PERIOD - 1}. Money values are £ a year. Written by \`npm run experiments\`.`,
  '',
];

const runs = [{ id: 'baseline', title: 'No change', scenario: null, expectations: null }, ...EXPERIMENTS];
let failures = 0;
for (const e of runs) {
  const records = run(base, e.scenario, { periods: LAST_PERIOD });
  const rows = records.flatMap((record) => [...periodRows(record), ...lensRows(record, periodLenses(record, SPEC_V1_LENSES))]);
  const results: ExpectationResult[] = e.scenario && e.expectations ? evaluate({ id: e.id, title: e.title, scenario: e.scenario, expectations: e.expectations }, records) : [];
  writeFileSync(`${outDir}${e.id}.csv`, toCsv(rows));
  writeFileSync(
    `${outDir}${e.id}.json`,
    JSON.stringify({ id: e.id, title: e.title, scenario: e.scenario, expectations: results, periods: toNested(rows) }, null, 1),
  );
  if (!e.scenario) continue;

  summary.push(`## ${e.id} ${e.title}`, '', e.scenario.description, '');
  const headline = (t: number) => {
    const m = records[t].result.macro;
    return `GDP ${formatValue(m.gdpProduction)}, GNI ${formatValue(m.gni)}, unemployment ${pct(m.unemploymentRate)}, government balance ${formatValue(records[t].result.government.balance)}`;
  };
  summary.push(`- Before: ${headline(SHOCK_PERIOD - 1)}`, `- t = ${SHOCK_PERIOD}: ${headline(SHOCK_PERIOD)}`, `- t = ${LAST_PERIOD}: ${headline(LAST_PERIOD)}`, '');
  summary.push(`| Expectation | Before | t = ${SHOCK_PERIOD} | t = ${LAST_PERIOD} | Holds at t = ${SHOCK_PERIOD} | Holds at t = ${LAST_PERIOD} |`, '|---|---|---|---|---|---|');
  for (const r of results) {
    if (r.firstOk === false || r.lastOk === false) failures++;
    summary.push(
      `| ${r.claim} | ${formatValue(r.before)} | ${formatValue(r.first)}${change(r.before, r.first)} | ${formatValue(r.last)}${change(r.before, r.last)} | ${verdict(r.firstOk)} | ${verdict(r.lastOk)} |`,
    );
  }
  summary.push('');
}
writeFileSync(`${outDir}summary.md`, summary.join('\n'));
console.log(`Wrote ${runs.length} runs to ${outDir}; ${failures === 0 ? 'every expectation holds' : `${failures} expectations FAIL`}`);
