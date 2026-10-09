/**
 * Calibrates the spec economy's base year (§12), stores the result in
 * src/params/spec-v1.calibration.ts, and reports the base year against the plausibility
 * ranges. Run it with `npm run calibrate` whenever the base parameters change.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { calibrate, solveBaseYear, withCalibration } from '../src/engine/calibrate';
import { inCommutingShare } from '../src/engine/commuting';
import { sum } from '../src/engine/linalg';
import { plausibilityReport } from '../src/engine/plausibility';
import { specV1Base } from '../src/params/spec-v1';

const base = specV1Base();
const started = performance.now();
const calibration = calibrate(base);
const seconds = (performance.now() - started) / 1000;

const target = fileURLToPath(new URL('../src/params/spec-v1.calibration.ts', import.meta.url));
writeFileSync(
  target,
  `// Written by \`npm run calibrate\` (scripts/calibrate.ts). Don't edit it by hand: rerun the
// script whenever the base parameters in spec-v1.ts change.
import type { Calibration } from '../engine/calibrate';

export const specV1Calibration: Calibration = ${JSON.stringify(calibration, null, 2)};
`,
);

const { econ, result } = solveBaseYear(withCalibration(base, calibration));
const { macro, households: hh, workplaces } = result;
const fmt = (x: number, digits = 0) => x.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const bn = (x: number) => `£${fmt(x / 1e9, 2)}bn`;
const pct = (x: number, digits = 1) => `${fmt(100 * x, digits)}%`;

console.log(`Calibrated in ${fmt(seconds, 1)} s; written to ${target}\n`);
console.log('Unknowns');
console.log(`  exports X                    ${bn(calibration.exportsTotal)}`);
console.log(`  income tax rate θ            ${fmt(calibration.incomeTaxRate, 6)}`);
console.log(`  city population share s_C    ${fmt(calibration.mainShare, 6)}`);
console.log('\nTargets reached');
console.log(`  current account              ${bn(macro.currentAccount)}`);
console.log(`  unemployment rate            ${pct(macro.unemploymentRate, 6)}`);
console.log(`  city in-commuting share      ${pct(inCommutingShare(result.commuting, 0), 6)}`);
console.log(`  government balance           ${bn(result.government.balance)}`);
console.log('\nBy place                       ' + econ.places.map((p) => p.padStart(12)).join(''));
const row = (label: string, values: number[], format: (x: number) => string) =>
  console.log(`  ${label.padEnd(29)}${values.map((v) => format(v).padStart(12)).join('')}`);
row('residents', hh.population, (x) => fmt(x));
row('jobs (workplace)', workplaces.jobs, (x) => fmt(x));
row('employed residents', hh.employed, (x) => fmt(x));
row('unemployment rate', hh.unemployed.map((u, r) => u / hh.labourForce[r]), (x) => pct(x, 2));
row('disposable income/resident', hh.disposableIncome.map((y, r) => y / hh.population[r]), (x) => `£${fmt(x)}`);
console.log(`\nGDP ${bn(macro.gdpProduction)}; GNI ${bn(macro.gni)}; exports ${bn(macro.exportsValue)}; imports incl. royalties ${bn(macro.importsValue)}`);
console.log(`Population ${fmt(sum(hh.population))}; ${result.iterations} iterations in the final base-year solve`);
if (result.flags.length > 0) console.log(`Flags: ${result.flags.join('; ')}`);

console.log('\nPlausibility (§12)');
for (const r of plausibilityReport(econ, result)) {
  const shown = r.detail ?? (Math.abs(r.value) >= 100 ? `£${fmt(r.value)}` : fmt(r.value, 3));
  const range = r.min === undefined ? '' : `  expected ${r.min >= 100 ? `£${fmt(r.min)}–£${fmt(r.max!)}` : `${r.min}–${r.max}`}`;
  console.log(`  ${r.ok ? 'ok     ' : 'OUTSIDE'}  ${r.label.padEnd(40)} ${shown}${range}`);
}
