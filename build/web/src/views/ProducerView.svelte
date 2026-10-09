<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import ChartFrame from '../components/ChartFrame.svelte';
  import IsoPanel from '../components/IsoPanel.svelte';
  import { formatPercentChange, formatValue, niceTicks } from '../data/format';
  import { BASELINE_ID, runFor } from '../data/model';
  import { producerName } from '../data/names';
  import { producerPicture } from '../data/producer';
  import { currentRun, ui } from '../lib/state.svelte';

  const record = $derived(currentRun()[ui.t]);
  const base = $derived(runFor(BASELINE_ID)[ui.t]);
  const domestic = $derived(record.econ.ids.slice(0, record.econ.nDomestic));
  const pic = $derived(producerPicture(record, base, ui.product));
  const s = $derived(pic.scenario);
  const b = $derived(pic.baseline);
  const label = $derived(ui.scenario === BASELINE_ID ? 'Baseline' : ui.scenario);
  const official = $derived(ui.mode === 'official');

  const compact = (q: number) =>
    q >= 1e9 ? `${(q / 1e9).toFixed(1)}bn` : q >= 1e6 ? `${(q / 1e6).toFixed(1)}m` : q >= 1e3 ? `${(q / 1e3).toFixed(0)}k` : q.toFixed(0);
  const money = (v: number) => formatValue(v, 'gbp');

  // The rectangle.
  let width = $state(460);
  const height = 340;
  const m = { top: 16, right: 150, bottom: 44, left: 70 };
  const qMax = $derived(Math.max(s.Q, b.Q) * 1.12);
  const yTicks = $derived(niceTicks(0, Math.max(s.S, b.S) * 1.08, 4));
  const x = $derived(scaleLinear().domain([0, qMax]).range([m.left, width - m.right]));
  const y = $derived(scaleLinear().domain([0, yTicks[yTicks.length - 1]]).range([height - m.bottom, m.top]));
  const bands = $derived.by(() => {
    const parts = [
      { key: 'wages', label: 'Wages', value: s.bands.wages },
      { key: 'depreciation', label: 'Depreciation', value: s.bands.depreciation },
      { key: 'profit', label: 'Net profit', value: s.bands.netProfit },
    ];
    let level = s.C;
    let lastLabel = Infinity;
    return parts.map((p) => {
      const from = level;
      level += Math.max(p.value, 0);
      // Label at the band's middle, nudged up if it would sit within 14px of the one below.
      const labelY = Math.min((y(from) + y(level)) / 2, lastLabel - 14);
      lastLabel = labelY;
      return { ...p, from, to: level, labelY };
    });
  });
  const GAP = 2;

  const tiles = $derived([
    { label: 'Price per unit, S', now: s.S, then: b.S, fmt: money },
    { label: 'Bought-in cost per unit, C', now: s.C, then: b.C, fmt: money },
    { label: `Units sold, Q (${s.unit}s)`, now: s.Q, then: b.Q, fmt: (v: number) => formatValue(v, 'people') },
    { label: 'Jobs, L', now: s.L, then: b.L, fmt: (v: number) => formatValue(v, 'people') },
    { label: 'GVA, (S − C)·Q', now: s.gva, then: b.gva, fmt: money },
    { label: 'GVA per job', now: s.gvaPerJob, then: b.gvaPerJob, fmt: (v: number) => formatValue(v, 'gbpPerPerson') },
  ]);
  const officialTiles = $derived([
    { label: 'Turnover, S·Q', now: s.revenue, then: b.revenue, fmt: money },
    { label: 'Purchases, C·Q', now: s.C * s.Q, then: b.C * b.Q, fmt: money },
    { label: 'GVA', now: s.gva, then: b.gva, fmt: money },
    { label: 'Turnover ÷ purchases, S/C', now: s.ratio, then: b.ratio, fmt: (v: number) => v.toFixed(3) },
    { label: 'Jobs', now: s.L, then: b.L, fmt: (v: number) => formatValue(v, 'people') },
    { label: 'GVA per job', now: s.gvaPerJob, then: b.gvaPerJob, fmt: (v: number) => formatValue(v, 'gbpPerPerson') },
  ]);
</script>

<div class="toolbar">
  <label>Producer
    <select bind:value={ui.product} data-testid="producer">
      {#each domestic as id (id)}<option value={id}>{producerName(id)} ({id})</option>{/each}
    </select>
  </label>
  <p class="muted">The 2D view of a single producer (Webber &amp; Huaccha 2024), in physical units: one {s.unit} costs {money(record.params.producers[ui.product].displayPrice)} at base prices.</p>
</div>

<div class="tiles">
  {#each official ? officialTiles : tiles as t (t.label)}
    <div class="card tile">
      <span class="muted small">{t.label}</span>
      <span class="big">{t.fmt(t.now)}</span>
      <span class="muted small">{ui.scenario === BASELINE_ID ? 'baseline' : `baseline ${t.fmt(t.then)} ${formatPercentChange(t.then, t.now)}`}</span>
    </div>
  {/each}
</div>

{#if official}
  <div class="card official" data-testid="producer-official">
    <h2>What official statistics can see</h2>
    <p class="note">Business surveys record a firm's turnover (S·Q), its purchases (C·Q), its GVA and its jobs. So they reveal the ratio S/C, but not the price S,
      the unit cost C or the quantity Q separately: one unknown remains, which is where along its isoGVA curve the firm sits
      (<em>measuring-gva-and-productivity</em> in the research notes). Switch to <strong>True flows</strong> to see the rectangle.</p>
  </div>
{:else}
  <div class="panels">
    <ChartFrame title={`${producerName(ui.product)}: the rectangle, t = ${ui.t}`}
      subtitle={`Width Q (units sold), height S (price per ${s.unit}). Grey floor: bought-in cost C. Outline: baseline.`}>
      {#snippet legend()}
        <span><span class="swatch" style="background: var(--floor)"></span> Bought-in cost</span>
        <span><span class="swatch" style="background: var(--band-wages)"></span> Wages</span>
        <span><span class="swatch" style="background: var(--band-depreciation)"></span> Depreciation</span>
        <span><span class="swatch" style="background: var(--band-profit)"></span> Net profit</span>
      {/snippet}
      <div class="plot" bind:clientWidth={width}>
        <svg {width} {height} role="img" aria-label="The producer's rectangle" data-testid="rectangle">
          {#each yTicks as t (t)}
            <line class="grid" x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
            <text class="tick" x={m.left - 6} y={y(t)} dy="0.32em" text-anchor="end">{money(t)}</text>
          {/each}
          <rect class="floor" x={x(0)} y={y(s.C)} width={x(s.Q) - x(0)} height={y(0) - y(s.C)} />
          {#each bands as band (band.key)}
            {#if band.to - band.from > 0}
              <rect x={x(0)} y={y(band.to)} width={x(s.Q) - x(0)} height={Math.max(0, y(band.from) - y(band.to) - GAP)} fill={`var(--band-${band.key})`} />
              <text class="band-label" x={x(s.Q) + 8} y={band.labelY} dy="0.32em">{band.label} {money(band.value)}</text>
            {/if}
          {/each}
          {#if s.bands.netProfit < 0}
            <text class="band-label" x={x(s.Q) + 8} y={y(s.S) - 10}>Net loss {money(-s.bands.netProfit)}</text>
          {/if}
          <rect class="outline" x={x(0)} y={y(b.S)} width={x(b.Q) - x(0)} height={y(0) - y(b.S)} />
          <line class="baseline-c" x1={x(0)} x2={x(b.Q)} y1={y(b.C)} y2={y(b.C)} />
          <text class="axis-label" x={x(0) + 6} y={y(s.S) - 6}>S = {money(s.S)}</text>
          <text class="axis-label" x={x(0) + 6} y={y(s.C) + 16}>C = {money(s.C)}</text>
          <line class="axis" x1={m.left} x2={width - m.right} y1={y(0)} y2={y(0)} />
          <text class="tick" x={x(s.Q)} y={height - m.bottom + 16} text-anchor="middle">Q = {compact(s.Q)}</text>
          <text class="axis-label" x={(m.left + width - m.right) / 2} y={height - 6} text-anchor="middle">Units sold a year ({s.unit}s)</text>
        </svg>
      </div>
      {#snippet table()}
        <table class="data">
          <thead><tr><th>Per {s.unit}</th><th>{label}</th><th>Baseline</th></tr></thead>
          <tbody>
            <tr><td>Price S</td><td>{money(s.S)}</td><td>{money(b.S)}</td></tr>
            <tr><td>Bought-in cost C</td><td>{money(s.C)}</td><td>{money(b.C)}</td></tr>
            <tr><td>Wages</td><td>{money(s.bands.wages)}</td><td>{money(b.bands.wages)}</td></tr>
            <tr><td>Depreciation</td><td>{money(s.bands.depreciation)}</td><td>{money(b.bands.depreciation)}</td></tr>
            <tr><td>Net profit</td><td>{money(s.bands.netProfit)}</td><td>{money(b.bands.netProfit)}</td></tr>
            <tr><td>Units sold Q</td><td>{formatValue(s.Q, 'people')}</td><td>{formatValue(b.Q, 'people')}</td></tr>
            <tr><td>Revenue S·Q</td><td>{money(s.S * s.Q)}</td><td>{money(b.S * b.Q)}</td></tr>
            <tr><td>GVA (S − C)·Q</td><td>{money((s.S - s.C) * s.Q)}</td><td>{money((b.S - b.C) * b.Q)}</td></tr>
          </tbody>
        </table>
      {/snippet}
    </ChartFrame>

    <IsoPanel title="isoGVA: margin form" subtitle="Margin S − C against Q: every point on a curve has the same GVA, margin × Q."
      yLabel={`S − C (£ per ${s.unit})`} xLabel={`Q (${s.unit}s a year)`} pick={(p) => p.margin}
      curve={pic.marginCurve} curveBaseline={pic.marginCurveBaseline}
      point={{ Q: s.Q, v: s.margin }} pointBaseline={{ Q: b.Q, v: b.margin }}
      formatY={money} formatQ={compact} scenarioLabel={label} />

    <IsoPanel title="isoGVA: the paper's S/C form" subtitle={`S/C against Q, holding C at ${money(s.C)}: the curve depends on C, so it moves when C does.`}
      yLabel="S / C" xLabel={`Q (${s.unit}s a year)`} pick={(p) => p.ratio} floor={1}
      curve={pic.ratioCurve} curveBaseline={pic.ratioCurveBaseline}
      point={{ Q: s.Q, v: s.ratio }} pointBaseline={{ Q: b.Q, v: 1 + b.gva / (s.C * b.Q) }}
      formatY={(v) => v.toFixed(2)} formatQ={compact} scenarioLabel={label} />
  </div>
  <p class="note caption">In v1 prices don't respond to demand, so a demand shock (E3, E6) moves only Q: the point slides along the Q axis and onto a
    different isoGVA curve. Price changes (E1, E2, E5, E8) move the margin.</p>
{/if}

<style>
  .toolbar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .tile { display: flex; flex-direction: column; gap: 2px; padding: 12px; }
  .big { font-size: 22px; font-weight: 600; }
  .small { font-size: 12px; }
  .panels { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
  .plot { position: relative; width: 100%; }
  svg { display: block; }
  .grid { stroke: var(--grid); stroke-width: 1; }
  .axis { stroke: var(--axis); stroke-width: 1; }
  .tick { fill: var(--ink-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
  .axis-label { fill: var(--ink-2); font-size: 12px; }
  .band-label { fill: var(--ink-2); font-size: 12px; }
  .floor { fill: var(--floor); }
  .outline { fill: none; stroke: var(--ink-2); stroke-width: 1; }
  .baseline-c { stroke: var(--ink-2); stroke-width: 1; }
  .official { max-width: 760px; display: flex; flex-direction: column; gap: 10px; }
  .caption { margin-top: 12px; }
</style>
