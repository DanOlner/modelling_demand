/** Number formats shared by every view. Money is £ a year. */

export type Unit = 'gbp' | 'gbpPerPerson' | 'rate' | 'share' | 'people' | 'index';

const grouped = (x: number, digits = 0) =>
  x.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function money(x: number): string {
  const a = Math.abs(x);
  if (a < 0.005) return '£0';
  const sign = x < 0 ? '−' : '';
  if (a >= 1e9) return `${sign}£${grouped(a / 1e9, 2)}bn`;
  if (a >= 1e6) return `${sign}£${grouped(a / 1e6, 1)}m`;
  if (a >= 1e4) return `${sign}£${grouped(a / 1e3, 1)}k`;
  if (a >= 100) return `${sign}£${grouped(a)}`;
  if (a >= 1) return `${sign}£${grouped(a, 2)}`;
  return `${sign}${grouped(a * 100, 1)}p`;
}

export function formatValue(x: number, unit: Unit): string {
  if (!Number.isFinite(x)) return '–';
  switch (unit) {
    case 'gbp':
    case 'gbpPerPerson':
      return money(x);
    case 'rate':
    case 'share':
      return `${x < 0 ? '−' : ''}${grouped(Math.abs(x) * 100, 1)}%`;
    case 'people':
      return `${x < 0 ? '−' : ''}${grouped(Math.abs(x))}`;
    case 'index':
      return `${x < 0 ? '−' : ''}${grouped(Math.abs(x), 4)}`;
  }
}

/** A signed change: "+£0.43bn", "−1.2 pp" for rates and shares. */
export function formatDelta(d: number, unit: Unit): string {
  if (!Number.isFinite(d)) return '–';
  const tiny = unit === 'rate' || unit === 'share' ? 5e-7 : unit === 'index' ? 5e-9 : 0.5;
  if (Math.abs(d) < tiny) return 'no change';
  const sign = d > 0 ? '+' : '−';
  if (unit === 'rate' || unit === 'share') return `${sign}${grouped(Math.abs(d) * 100, 2)} pp`;
  return `${sign}${formatValue(Math.abs(d), unit)}`;
}

/** Percentage change, where a percentage means something (a positive base). */
export function formatPercentChange(before: number, after: number): string {
  if (!(before > 0)) return '';
  const pct = (after / before - 1) * 100;
  if (Math.abs(pct) < 0.005) return '0.0%';
  return `${pct > 0 ? '+' : '−'}${grouped(Math.abs(pct), Math.abs(pct) < 10 ? 2 : 1)}%`;
}

/** Ticks at clean numbers that span the whole range, so the axis covers every value. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const raw = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const first = Math.floor(min / step + 1e-9) * step;
  const last = Math.ceil(max / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let i = 0; first + i * step <= last + step * 1e-9; i++) {
    const v = first + i * step;
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : Number(v.toPrecision(12)));
  }
  return ticks;
}
