<script lang="ts">
  // A small-multiple line chart over t = 0…40: the scenario in ink, the baseline in grey
  // (emphasis form), or a single series of differences from the baseline. One axis only.
  import { scaleLinear } from 'd3-scale';
  import { line } from 'd3-shape';
  import ChartFrame from './ChartFrame.svelte';
  import { formatDelta, formatValue, niceTicks, type Unit } from '../data/format';

  interface Props {
    title: string;
    subtitle?: string;
    unit: Unit;
    scenarioLabel: string;
    scenario: number[];
    baseline?: number[];
    /** Plot scenario − baseline as one series. */
    difference?: boolean;
    shock: number;
    selected: number;
    onpick?: (t: number) => void;
  }
  let { title, subtitle, unit, scenarioLabel, scenario, baseline, difference = false, shock, selected, onpick }: Props = $props();

  let width = $state(360);
  const height = 190;
  const m = { top: 20, right: 64, bottom: 26, left: 62 };

  const main = $derived(difference && baseline ? scenario.map((v, t) => v - baseline[t]) : scenario);
  const ghost = $derived(difference ? null : (baseline ?? null));
  const ticks = $derived.by(() => {
    const values = [...main, ...(ghost ?? []), ...(difference ? [0] : [])];
    return niceTicks(Math.min(...values), Math.max(...values), 4);
  });
  const x = $derived(scaleLinear().domain([0, main.length - 1]).range([m.left, width - m.right]));
  const y = $derived(scaleLinear().domain([ticks[0], ticks[ticks.length - 1]]).range([height - m.bottom, m.top]));
  const path = (values: number[]) => line<number>().x((_, t) => x(t)).y((v) => y(v))(values) ?? '';
  const fmt = (v: number) => (difference ? formatDelta(v, unit) : formatValue(v, unit));
  const last = $derived(main.length - 1);
  // Direct end labels only when the two ends are far enough apart not to collide.
  const endLabels = $derived(ghost !== null && Math.abs(y(main[last]) - y(ghost[last])) >= 14);

  let hover = $state<number | null>(null);
  function move(e: PointerEvent) {
    const box = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const t = Math.round(x.invert(e.clientX - box.left + m.left));
    hover = Math.max(0, Math.min(last, t));
  }
</script>

<ChartFrame {title} {subtitle}>
  {#snippet legend()}
    {#if ghost}
      <span><span class="linekey" style="background: var(--ink)"></span> {scenarioLabel}</span>
      <span><span class="linekey" style="background: var(--ink-muted)"></span> Baseline</span>
    {/if}
  {/snippet}
  <div class="plot" bind:clientWidth={width}>
    <svg {width} {height} role="img" aria-label={`${title}: ${scenarioLabel}`}>
      {#each ticks as tick (tick)}
        <line class="grid" x1={m.left} x2={width - m.right} y1={y(tick)} y2={y(tick)} />
        <text class="tick" x={m.left - 6} y={y(tick)} dy="0.32em" text-anchor="end">{difference ? formatDelta(tick, unit) : formatValue(tick, unit)}</text>
      {/each}
      {#each [0, 10, 20, 30, 40].filter((t) => t <= last) as t (t)}
        <text class="tick" x={x(t)} y={height - 8} text-anchor="middle">{t}</text>
      {/each}
      <line class="shock" x1={x(shock)} x2={x(shock)} y1={m.top} y2={height - m.bottom} />
      <text class="tick" x={x(shock)} y={m.top - 6} text-anchor="middle">change</text>
      <line class="selected" x1={x(selected)} x2={x(selected)} y1={m.top} y2={height - m.bottom} />
      {#if ghost}<path class="baseline" d={path(ghost)} />{/if}
      <path class="series" d={path(main)} />
      <circle class="end" cx={x(last)} cy={y(main[last])} r="4" />
      {#if endLabels && ghost}
        <text class="label" x={x(last) + 8} y={y(main[last])} dy="0.32em">{fmt(main[last])}</text>
        <text class="label muted" x={x(last) + 8} y={y(ghost[last])} dy="0.32em">{fmt(ghost[last])}</text>
      {:else}
        <text class="label" x={x(last) + 8} y={y(main[last])} dy="0.32em">{fmt(main[last])}</text>
      {/if}
      {#if hover !== null}
        <line class="cross" x1={x(hover)} x2={x(hover)} y1={m.top} y2={height - m.bottom} />
        <circle class="end" cx={x(hover)} cy={y(main[hover])} r="4" />
      {/if}
      <rect
        role="presentation"
        x={m.left}
        y={m.top}
        width={Math.max(0, width - m.left - m.right)}
        height={height - m.top - m.bottom}
        fill="transparent"
        onpointermove={move}
        onpointerleave={() => (hover = null)}
        onclick={() => hover !== null && onpick?.(hover)}
      />
    </svg>
    {#if hover !== null}
      <div class="tooltip" style={`left:${Math.min(x(hover) + 10, width - 170)}px; top:${m.top}px`}>
        <div class="muted">t = {hover}</div>
        <div><span class="linekey" style="background: var(--ink)"></span> <strong>{fmt(main[hover])}</strong> {difference ? 'difference' : scenarioLabel}</div>
        {#if ghost}<div><span class="linekey" style="background: var(--ink-muted)"></span> <strong>{fmt(ghost[hover])}</strong> Baseline</div>{/if}
      </div>
    {/if}
  </div>
  {#snippet table()}
    <table class="data">
      <thead><tr><th>t</th><th>{difference ? 'Difference' : scenarioLabel}</th>{#if ghost}<th>Baseline</th>{/if}</tr></thead>
      <tbody>
        {#each main as v, t (t)}
          <tr><td>{t}</td><td>{fmt(v)}</td>{#if ghost}<td>{fmt(ghost[t])}</td>{/if}</tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</ChartFrame>

<style>
  .plot { position: relative; width: 100%; }
  svg { display: block; overflow: visible; }
  .grid { stroke: var(--grid); stroke-width: 1; }
  .tick { fill: var(--ink-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
  .label { fill: var(--ink); font-size: 12px; font-variant-numeric: tabular-nums; }
  .label.muted { fill: var(--ink-muted); }
  .series { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  .baseline { fill: none; stroke: var(--ink-muted); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  .end { fill: var(--ink); stroke: var(--surface); stroke-width: 2; }
  .shock { stroke: var(--axis); stroke-width: 1; }
  .selected { stroke: var(--ink-2); stroke-width: 1; opacity: 0.6; }
  .cross { stroke: var(--ink-2); stroke-width: 1; }
  rect { cursor: crosshair; }
</style>
