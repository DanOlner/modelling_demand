<script lang="ts">
  import ChartFrame from '../components/ChartFrame.svelte';
  import SectorMix from '../components/SectorMix.svelte';
  import { formatDelta, formatPercentChange, formatValue } from '../data/format';
  import { MEASURES, measureById } from '../data/measures';
  import { BASELINE_ID, runFor } from '../data/model';
  import { PLACE_NAMES } from '../data/names';
  import { FLOW_LABELS, FLOW_TYPES, flowArrows, localFlow, placeCards, type FlowArrow } from '../data/places';
  import { currentRun, ui } from '../lib/state.svelte';

  const official = $derived(ui.mode === 'official');
  const lenses = $derived(MEASURES.filter((m) => m.scope === 'place' && (!official || m.official)));
  $effect(() => {
    if (!lenses.some((m) => m.id === ui.lens)) ui.lens = 'gvaPerJob';
  });
  const measure = $derived(measureById(lenses.some((m) => m.id === ui.lens) ? ui.lens : 'gvaPerJob'));
  const record = $derived(currentRun()[ui.t]);
  const base = $derived(runFor(BASELINE_ID)[ui.t]);
  const cards = $derived(placeCards(measure, record, base, ui.switches));
  const flowInfo = $derived(FLOW_LABELS[ui.flow]);
  const arrows = $derived(official ? [] : flowArrows(ui.flow, record, base));
  const maxArrow = $derived(Math.max(...arrows.map((a) => a.value), 1e-9));
  const maxCard = $derived(Math.max(...cards.map((c) => Math.abs(c.value))));

  let width = $state(1100);
  const height = 620;
  type Box = { cx: number; cy: number; hw: number; hh: number };
  const boxes = $derived<Record<string, Box>>({
    W: { cx: width * 0.5, cy: 62, hw: 120, hh: 34 },
    M: { cx: width * 0.17, cy: 310, hw: 125, hh: 74 },
    C: { cx: width * 0.5, cy: 310, hw: 125, hh: 74 },
    R: { cx: width * 0.83, cy: 310, hw: 125, hh: 74 },
    Government: { cx: width * 0.5, cy: 560, hw: 120, hh: 34 },
  });

  /** Where the line from a box's centre towards (px, py) leaves the box. */
  function edge(b: Box, px: number, py: number): [number, number] {
    const dx = px - b.cx;
    const dy = py - b.cy;
    const s = Math.min(Math.abs(dx) > 0 ? b.hw / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? b.hh / Math.abs(dy) : Infinity);
    return [b.cx + dx * s, b.cy + dy * s];
  }

  function geometry(a: FlowArrow) {
    const A = boxes[a.from];
    const B = boxes[a.to];
    const dx = B.cx - A.cx;
    const dy = B.cy - A.cy;
    const dist = Math.hypot(dx, dy);
    // Bend to the left of the direction of travel, so the two directions between a pair separate;
    // town↔rural flows bend far enough to clear the city.
    const bend = Math.abs(dy) < 1 && dist > width * 0.5 ? 0.2 * dist : Math.max(0.12 * dist, 44);
    const qx = (A.cx + B.cx) / 2 + (dy / dist) * bend;
    const qy = (A.cy + B.cy) / 2 - (dx / dist) * bend;
    const [x1, y1] = edge(A, qx, qy);
    const [x2, y2] = edge(B, qx, qy);
    const at = (t: number): [number, number] => [
      (1 - t) ** 2 * x1 + 2 * (1 - t) * t * qx + t ** 2 * x2,
      (1 - t) ** 2 * y1 + 2 * (1 - t) * t * qy + t ** 2 * y2,
    ];
    return { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, at };
  }

  const strokeWidth = (v: number) => 1.5 + 14 * (v / maxArrow);
  // Labels for the six largest flows, each placed at the first point along its arrow (middle,
  // then either side) where it doesn't overlap a label already placed.
  const labels = $derived.by(() => {
    const placed: { key: string; x: number; y: number; w: number }[] = [];
    for (const a of arrows.slice(0, 6)) {
      const g = geometry(a);
      const w = formatValue(a.value, flowInfo.unit).length * 7 + 8;
      for (const t of [0.5, 0.38, 0.62, 0.28, 0.72]) {
        const [x, y] = g.at(t);
        if (placed.every((p) => Math.abs(p.x - x) > (p.w + w) / 2 || Math.abs(p.y - y) > 16)) {
          placed.push({ key: `${a.from}>${a.to}`, x, y, w });
          break;
        }
      }
    }
    return new Map(placed.map((p) => [p.key, p]));
  });

  let hover = $state<{ a: FlowArrow; x: number; y: number } | null>(null);
</script>

<div class="toolbar">
  <div class="segmented" role="group" aria-label="Lens">
    {#each lenses as m (m.id)}
      <button aria-pressed={measure.id === m.id} onclick={() => (ui.lens = m.id)}>{m.label}</button>
    {/each}
  </div>
  {#if !official}
    <label>Flows
      <select bind:value={ui.flow} data-testid="flow">
        {#each FLOW_TYPES as f (f)}<option value={f}>{FLOW_LABELS[f].label}</option>{/each}
      </select>
    </label>
  {/if}
</div>

<ChartFrame
  title={`${measure.label}, by place, t = ${ui.t}`}
  subtitle={official ? measure.caption : `${measure.caption}. Arrows: ${flowInfo.label.toLowerCase()}, ${flowInfo.caption.toLowerCase()}.`}
>
  <div class="plot" bind:clientWidth={width}>
    <svg {width} {height} role="img" aria-label="Map of the four places">
      <defs>
        <marker id="head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--flow)" />
        </marker>
      </defs>

      {#each arrows as a (`${a.from}>${a.to}`)}
        {@const g = geometry(a)}
        <path class="arrow" d={g.d} stroke-width={strokeWidth(a.value)} marker-end="url(#head)" />
        <path class="hit" d={g.d} role="presentation"
          onpointermove={(e) => (hover = { a, x: e.offsetX, y: e.offsetY })}
          onpointerleave={() => (hover = null)} />
        {@const spot = labels.get(`${a.from}>${a.to}`)}
        {#if spot}
          <text class="flow-label" x={spot.x} y={spot.y} text-anchor="middle" dy="0.32em">{formatValue(a.value, flowInfo.unit)}</text>
        {/if}
      {/each}

      {#each ['W', 'Government'] as node (node)}
        {@const b = boxes[node]}
        <g class:faded={official}>
          <rect class="node" x={b.cx - b.hw} y={b.cy - b.hh} width={b.hw * 2} height={b.hh * 2} rx="10" />
          {#if node === 'W'}<rect x={b.cx - b.hw + 14} y={b.cy - 6} width="10" height="10" rx="2" fill="var(--place-W)" />{/if}
          <text class="node-name" x={b.cx - b.hw + (node === 'W' ? 32 : 14)} y={b.cy} dy="0.32em">{PLACE_NAMES[node]}</text>
        </g>
      {/each}

      {#each cards as c (c.place)}
        {@const b = boxes[c.place]}
        {@const selected = ui.place === c.place}
        <g class="place" role="button" tabindex="0" aria-label={`Select ${PLACE_NAMES[c.place]}`}
          onclick={() => (ui.place = c.place)} onkeydown={(e) => e.key === 'Enter' && (ui.place = c.place)}>
          <rect class="node" class:selected x={b.cx - b.hw} y={b.cy - b.hh} width={b.hw * 2} height={b.hh * 2} rx="10" />
          <rect x={b.cx - b.hw + 14} y={b.cy - b.hh + 15} width="10" height="10" rx="2" fill={`var(--place-${c.place})`} />
          <text class="node-name" x={b.cx - b.hw + 32} y={b.cy - b.hh + 20} dy="0.32em">{PLACE_NAMES[c.place]}</text>
          <text class="value" x={b.cx - b.hw + 14} y={b.cy - 2} data-testid={`card-${c.place}`}>{formatValue(c.value, measure.unit)}</text>
          <text class="delta" x={b.cx - b.hw + 14} y={b.cy + 20}>
            {ui.scenario === BASELINE_ID ? 'baseline' : `${formatDelta(c.value - c.baseline, measure.unit)} on baseline ${measure.unit === 'rate' || measure.unit === 'share' ? '' : formatPercentChange(c.baseline, c.value)}`}
          </text>
          {#if !official && measure.official && Math.abs(c.official / c.value - 1) > 5e-4}
            <text class="delta" x={b.cx - b.hw + 14} y={b.cy + 38}>Official statistics: {formatValue(c.official, measure.unit)}</text>
          {:else if !official && ui.flow === 'commuters'}
            <text class="delta" x={b.cx - b.hw + 14} y={b.cy + 38}>Work where they live: {formatValue(localFlow('commuters', record, c.place), 'people')}</text>
          {/if}
          {#if c.value > 0}
            <rect class="magnitude" x={b.cx - b.hw + 14} y={b.cy + b.hh - 14} width={(b.hw * 2 - 28) * (c.value / maxCard)} height="4" rx="2" />
          {/if}
        </g>
      {/each}
      {#if official}
        <text class="muted-text" x={width / 2} y={height / 2 + 120} text-anchor="middle">Flows between places, ownership and trade aren't in official statistics. Switch to true flows to see them.</text>
      {/if}
    </svg>
    {#if hover}
      <div class="tooltip" style={`left:${hover.x + 12}px; top:${hover.y + 12}px`}>
        <div class="muted">{PLACE_NAMES[hover.a.from]} → {PLACE_NAMES[hover.a.to]}</div>
        <div><strong>{formatValue(hover.a.value, flowInfo.unit)}</strong> {flowInfo.label.toLowerCase()}</div>
        <div class="muted">Baseline {formatValue(hover.a.baseline, flowInfo.unit)} ({formatDelta(hover.a.value - hover.a.baseline, flowInfo.unit)})</div>
      </div>
    {/if}
  </div>
  {#snippet table()}
    <table class="data">
      <thead><tr><th>Place</th><th>{measure.label}</th><th>Baseline</th><th>Change</th><th>Official statistics</th></tr></thead>
      <tbody>
        {#each cards as c (c.place)}
          <tr><td>{PLACE_NAMES[c.place]}</td><td>{formatValue(c.value, measure.unit)}</td><td>{formatValue(c.baseline, measure.unit)}</td>
            <td>{formatDelta(c.value - c.baseline, measure.unit)}</td><td>{measure.official ? formatValue(c.official, measure.unit) : 'not measured'}</td></tr>
        {/each}
      </tbody>
    </table>
    {#if arrows.length > 0}
      <table class="data">
        <thead><tr><th>{flowInfo.label}: from → to</th><th>Value</th><th>Baseline</th><th>Change</th></tr></thead>
        <tbody>
          {#each arrows as a (`${a.from}>${a.to}`)}
            <tr><td>{PLACE_NAMES[a.from]} → {PLACE_NAMES[a.to]}</td><td>{formatValue(a.value, flowInfo.unit)}</td><td>{formatValue(a.baseline, flowInfo.unit)}</td><td>{formatDelta(a.value - a.baseline, flowInfo.unit)}</td></tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/snippet}
</ChartFrame>

<p class="note hint">Click a place to select it for the other views. Selected: {PLACE_NAMES[ui.place]}.</p>

<div class="mix"><SectorMix {record} baseline={base} /></div>

<style>
  .toolbar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
  .plot { position: relative; width: 100%; }
  svg { display: block; }
  .node { fill: var(--surface); stroke: var(--border); stroke-width: 1; }
  .node.selected { stroke: var(--ink); stroke-width: 2; }
  .place { cursor: pointer; }
  .place:hover .node { fill: var(--wash); }
  .node-name { fill: var(--ink); font-size: 14px; font-weight: 600; }
  .value { fill: var(--ink); font-size: 26px; font-weight: 600; }
  .delta { fill: var(--ink-2); font-size: 12px; font-variant-numeric: tabular-nums; }
  .magnitude { fill: var(--ink-muted); opacity: 0.5; }
  .arrow { fill: none; stroke: var(--flow); stroke-opacity: 0.55; stroke-linecap: round; }
  .hit { fill: none; stroke: transparent; stroke-width: 24; cursor: help; }
  .flow-label { fill: var(--ink); font-size: 12px; font-variant-numeric: tabular-nums; paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
  .faded { opacity: 0.45; }
  .muted-text { fill: var(--ink-muted); font-size: 13px; }
  .hint { margin-top: 8px; }
  .mix { margin-top: 16px; }
</style>
