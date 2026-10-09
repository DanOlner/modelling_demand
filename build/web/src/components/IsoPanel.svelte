<script lang="ts">
  // One isoGVA panel: the curve through the scenario's point, the baseline's curve in grey, and
  // the move between the two points.
  import { scaleLinear } from 'd3-scale';
  import { line } from 'd3-shape';
  import type { IsoGvaPoint } from '../../../src/engine/lenses';
  import { niceTicks } from '../data/format';
  import ChartFrame from './ChartFrame.svelte';

  interface Props {
    title: string;
    subtitle: string;
    yLabel: string;
    xLabel: string;
    pick: (p: IsoGvaPoint) => number;
    curve: IsoGvaPoint[];
    curveBaseline: IsoGvaPoint[];
    point: { Q: number; v: number };
    pointBaseline: { Q: number; v: number };
    formatY: (v: number) => string;
    formatQ: (q: number) => string;
    floor?: number;
    scenarioLabel: string;
  }
  let { title, subtitle, yLabel, xLabel, pick, curve, curveBaseline, point, pointBaseline, formatY, formatQ, floor = 0, scenarioLabel }: Props = $props();

  let width = $state(420);
  const height = 300;
  const m = { top: 14, right: 18, bottom: 44, left: 70 };
  const yMax = $derived(Math.max(point.v, pointBaseline.v) * 2.4);
  const yTicks = $derived(niceTicks(floor, yMax, 4));
  const xTicks = $derived(niceTicks(curve[0].Q, curve[curve.length - 1].Q, 4).filter((q) => q >= curve[0].Q && q <= curve[curve.length - 1].Q));
  const x = $derived(scaleLinear().domain([curve[0].Q, curve[curve.length - 1].Q]).range([m.left, width - m.right]));
  const y = $derived(scaleLinear().domain([yTicks[0], yTicks[yTicks.length - 1]]).range([height - m.bottom, m.top]));
  const path = (pts: IsoGvaPoint[]) => line<IsoGvaPoint>().x((p) => x(p.Q)).y((p) => y(pick(p)))(pts) ?? '';
  const moved = $derived(Math.hypot(x(point.Q) - x(pointBaseline.Q), y(point.v) - y(pointBaseline.v)) > 6);
  const same = $derived(Math.abs(pick(curve[0]) / pick(curveBaseline[0]) - 1) < 1e-9);

  let hover = $state<number | null>(null);
  function move(e: PointerEvent) {
    const box = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const q = x.invert(e.clientX - box.left + m.left);
    let best = 0;
    curve.forEach((p, i) => { if (Math.abs(p.Q - q) < Math.abs(curve[best].Q - q)) best = i; });
    hover = best;
  }
  const uid = Math.random().toString(36).slice(2);
</script>

<ChartFrame {title} {subtitle}>
  {#snippet legend()}
    <span><span class="linekey" style="background: var(--ink)"></span> {scenarioLabel}: isoGVA through its point</span>
    {#if !same}<span><span class="linekey" style="background: var(--ink-muted)"></span> Baseline</span>{/if}
  {/snippet}
  <div class="plot" bind:clientWidth={width}>
    <svg {width} {height} role="img" aria-label={title}>
      <defs>
        <marker id={`move-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" />
        </marker>
        <clipPath id={`plot-${uid}`}><rect x={m.left} y={m.top} width={Math.max(0, width - m.left - m.right)} height={height - m.top - m.bottom} /></clipPath>
      </defs>
      {#each yTicks as t (t)}
        <line class="grid" x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} />
        <text class="tick" x={m.left - 6} y={y(t)} dy="0.32em" text-anchor="end">{formatY(t)}</text>
      {/each}
      {#each xTicks as q (q)}<text class="tick" x={x(q)} y={height - m.bottom + 16} text-anchor="middle">{formatQ(q)}</text>{/each}
      <text class="axis-label" x={(m.left + width - m.right) / 2} y={height - 6} text-anchor="middle">{xLabel}</text>
      <text class="axis-label" transform={`translate(12, ${(m.top + height - m.bottom) / 2}) rotate(-90)`} text-anchor="middle">{yLabel}</text>
      <g clip-path={`url(#plot-${uid})`}>
        {#if !same}<path class="base" d={path(curveBaseline)} />{/if}
        <path class="curve" d={path(curve)} />
      </g>
      {#if moved}
        <line class="move" x1={x(pointBaseline.Q)} y1={y(pointBaseline.v)} x2={x(point.Q)} y2={y(point.v)} marker-end={`url(#move-${uid})`} />
        <circle class="dot base-dot" cx={x(pointBaseline.Q)} cy={y(pointBaseline.v)} r="4" />
      {/if}
      <circle class="dot" cx={x(point.Q)} cy={y(point.v)} r="5" />
      {#if hover !== null}
        <line class="cross" x1={x(curve[hover].Q)} x2={x(curve[hover].Q)} y1={m.top} y2={height - m.bottom} />
      {/if}
      <rect role="presentation" x={m.left} y={m.top} width={Math.max(0, width - m.left - m.right)} height={height - m.top - m.bottom}
        fill="transparent" onpointermove={move} onpointerleave={() => (hover = null)} />
    </svg>
    {#if hover !== null}
      <div class="tooltip" style={`left:${Math.min(x(curve[hover].Q) + 10, width - 190)}px; top:${m.top}px`}>
        <div class="muted">Q = {formatQ(curve[hover].Q)}</div>
        <div><strong>{formatY(pick(curve[hover]))}</strong> keeps GVA unchanged</div>
        {#if !same}<div class="muted">Baseline GVA: {formatY(pick(curveBaseline[hover]))}</div>{/if}
      </div>
    {/if}
  </div>
  {#snippet table()}
    <table class="data">
      <thead><tr><th>Q</th><th>{scenarioLabel}</th>{#if !same}<th>Baseline</th>{/if}</tr></thead>
      <tbody>
        {#each curve.filter((_, i) => i % 8 === 0) as p, i (i)}
          <tr><td>{formatQ(p.Q)}</td><td>{formatY(pick(p))}</td>{#if !same}<td>{formatY(pick(curveBaseline[i * 8]))}</td>{/if}</tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</ChartFrame>

<style>
  .plot { position: relative; width: 100%; }
  svg { display: block; }
  .grid { stroke: var(--grid); stroke-width: 1; }
  .tick { fill: var(--ink-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
  .axis-label { fill: var(--ink-2); font-size: 12px; }
  .curve { fill: none; stroke: var(--ink); stroke-width: 2; }
  .base { fill: none; stroke: var(--ink-muted); stroke-width: 2; }
  .dot { fill: var(--ink); stroke: var(--surface); stroke-width: 2; }
  .base-dot { fill: var(--ink-muted); }
  .move { stroke: var(--ink-2); stroke-width: 1.5; }
  .cross { stroke: var(--ink-2); stroke-width: 1; }
  rect { cursor: crosshair; }
</style>
