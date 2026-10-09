<script lang="ts">
  import ChartFrame from '../components/ChartFrame.svelte';
  import { CAPTURE_PLACES, FEATURED_PRODUCTS, captureBar, type CaptureBar, type CaptureSegment } from '../data/capture';
  import { formatPercentChange, formatValue } from '../data/format';
  import { BASELINE_ID, runFor } from '../data/model';
  import { PLACE_NAMES, productName, producerName } from '../data/names';
  import { currentRun, ui } from '../lib/state.svelte';

  const record = $derived(currentRun()[ui.t]);
  const base = $derived(runFor(BASELINE_ID)[ui.t]);
  const domestic = $derived(record.econ.ids.slice(0, record.econ.nDomestic));
  const products = $derived(FEATURED_PRODUCTS.includes(ui.product) ? FEATURED_PRODUCTS : [...FEATURED_PRODUCTS, ui.product]);
  const rows = $derived(
    products.map((id) => ({ id, baseline: captureBar(base, id, ui.perUnit), scenario: captureBar(record, id, ui.perUnit) })),
  );
  const selected = $derived(rows.find((r) => r.id === ui.product) ?? rows[0]);
  const isBaseline = $derived(ui.scenario === BASELINE_ID);

  let width = $state(900);
  const labelWidth = 290;
  const barHeight = 22;
  const gap = 2;
  const unitLabel = (bar: CaptureBar) => (ui.perUnit ? `per ${bar.unit}, ${formatValue(bar.unitPrice, 'gbp')}` : 'per £1');
  const segText = (s: CaptureSegment) => formatValue(s.value, 'gbp');
  // Both bars of a product share one scale, its larger total, so a change in price shows as a change in length.
  function layout(bar: CaptureBar, total: number) {
    const span = Math.max(0, width - labelWidth - 20);
    let x = labelWidth;
    return bar.segments.map((s) => {
      const w = Math.max(0, (s.value / total) * span);
      const seg = { s, x, w: Math.max(0, w - gap) };
      x += w;
      return seg;
    });
  }
  /** White or ink text inside a fill, by the fill's lightness: light hues (aqua, yellow) take ink. */
  const textOn = (place: string) => (place === 'C' || place === 'M' ? '#ffffff' : '#0b0b0b');
  const fits = (text: string, w: number) => text.length * 7 + 12 <= w;

  let hover = $state<{ s: CaptureSegment; x: number; y: number } | null>(null);
</script>

{#if ui.mode === 'official'}
  <div class="card official" data-testid="capture-hidden">
    <h2>Not visible in official statistics</h2>
    <p class="note">
      Official statistics record each producer's own GVA where it works. They don't follow a final product back through its supply chain, so they can't
      show who captures each £1 of a gadget, a basket or an hour of public services. In the research notes, the iPhone researchers describe working from
      "educated guesses" for this reason. Switch to <strong>True flows</strong> to see the chains.
    </p>
  </div>
{:else}
  <div class="toolbar">
    <div class="segmented" role="group" aria-label="Units">
      <button aria-pressed={!ui.perUnit} onclick={() => (ui.perUnit = false)}>Per £1 of price</button>
      <button aria-pressed={ui.perUnit} onclick={() => (ui.perUnit = true)} data-testid="per-unit">Per physical unit</button>
    </div>
    <label>Other products
      <select bind:value={ui.product}>
        {#each domestic as id (id)}<option value={id}>{producerName(id)}</option>{/each}
      </select>
    </label>
  </div>

  <div class="layout">
    <ChartFrame title={`Who gets each ${ui.perUnit ? 'unit' : '£1'} of a final product, t = ${ui.t}`}
      subtitle="Value added captured along the whole supply chain, by place (lens 2). Upper bar: baseline; lower bar: scenario. Click a product to select it.">
      {#snippet legend()}
        {#each CAPTURE_PLACES as p (p)}<span><span class="swatch" style={`background: var(--place-${p})`}></span> {PLACE_NAMES[p]}</span>{/each}
      {/snippet}
      <div class="plot" bind:clientWidth={width}>
        <svg {width} height={rows.length * 76 + 8} role="img" aria-label="Value capture by place">
          {#each rows as row, i (row.id)}
            {@const y0 = 8 + i * 76}
            {@const rowTotal = Math.max(...[row.baseline, row.scenario].map((b) => b.segments.reduce((a, s) => a + s.value, 0)))}
            <g class="row" class:chosen={row.id === ui.product} role="button" tabindex="0"
              onclick={() => (ui.product = row.id)} onkeydown={(e) => e.key === 'Enter' && (ui.product = row.id)}>
              <rect class="rowhit" x="0" y={y0 - 4} {width} height="70" />
              <text class="name" x="0" y={y0 + 14}>{productName(row.id)}</text>
              <text class="sub" x="0" y={y0 + 32}>{unitLabel(row.scenario)}</text>
              {#each [row.baseline, row.scenario] as bar, k (k)}
                {@const y = y0 + k * (barHeight + 6)}
                {#each layout(bar, rowTotal) as seg (seg.s.place)}
                  {#if seg.w > 0}
                    <rect x={seg.x} {y} width={seg.w} height={barHeight} rx="3" fill={`var(--place-${seg.s.place})`}
                      role="presentation" onpointermove={(e) => (hover = { s: seg.s, x: e.offsetX, y: e.offsetY })} onpointerleave={() => (hover = null)} />
                    {#if fits(segText(seg.s), seg.w)}
                      <text class="seg" x={seg.x + 6} y={y + barHeight / 2} dy="0.32em" fill={textOn(seg.s.place)}>{segText(seg.s)}</text>
                    {/if}
                  {/if}
                {/each}
                <text class="which" x={labelWidth - 8} y={y + barHeight / 2} dy="0.32em" text-anchor="end">{k === 0 ? 'Baseline' : isBaseline ? '' : ui.scenario}</text>
              {/each}
            </g>
          {/each}
        </svg>
        {#if hover}
          <div class="tooltip" style={`left:${Math.min(hover.x + 12, width - 260)}px; top:${hover.y + 14}px`}>
            <div class="muted">{PLACE_NAMES[hover.s.place]}</div>
            <div><strong>{formatValue(hover.s.value, 'gbp')}</strong> ({formatValue(hover.s.share, 'share')} of the price)</div>
            {#each hover.s.detail.slice(0, 6) as d (d.id)}
              <div class="muted">{producerName(d.id)}: {formatValue(d.value, 'gbp')}</div>
            {/each}
          </div>
        {/if}
      </div>
      {#snippet table()}
        <table class="data">
          <thead><tr><th>Product</th><th></th>{#each CAPTURE_PLACES as p (p)}<th>{PLACE_NAMES[p]}</th>{/each}<th>Total</th></tr></thead>
          <tbody>
            {#each rows as row (row.id)}
              {#each [['Baseline', row.baseline], [ui.scenario, row.scenario]] as [label, bar] (label)}
                {@const b = bar as CaptureBar}
                <tr><td>{productName(row.id)}</td><td>{label}</td>
                  {#each b.segments as s (s.place)}<td>{formatValue(s.value, 'gbp')}</td>{/each}
                  <td>{formatValue(b.segments.reduce((a, s) => a + s.value, 0), 'gbp')}</td></tr>
              {/each}
            {/each}
          </tbody>
        </table>
      {/snippet}
    </ChartFrame>

    <aside class="card side" data-testid="chain-tiles">
      <h3>{producerName(selected.id)}</h3>
      <p class="muted small">Productivity along the whole chain (lens 3), t = {ui.t}</p>
      <div class="tile">
        <span class="muted">Value per worker along the whole chain</span>
        <span class="big">{formatValue(selected.scenario.valuePerChainWorker, 'gbpPerPerson')}</span>
        {#if !isBaseline}<span class="muted small">baseline {formatValue(selected.baseline.valuePerChainWorker, 'gbpPerPerson')} {formatPercentChange(selected.baseline.valuePerChainWorker, selected.scenario.valuePerChainWorker)}</span>{/if}
      </div>
      <div class="tile">
        <span class="muted">GVA per job on site</span>
        <span class="big">{formatValue(selected.scenario.onSiteGvaPerJob, 'gbpPerPerson')}</span>
        {#if !isBaseline}<span class="muted small">baseline {formatValue(selected.baseline.onSiteGvaPerJob, 'gbpPerPerson')} {formatPercentChange(selected.baseline.onSiteGvaPerJob, selected.scenario.onSiteGvaPerJob)}</span>{/if}
      </div>
      <div class="tile">
        <span class="muted">Share of the chain's jobs abroad</span>
        <span class="big">{formatValue(selected.scenario.chainJobsAbroadShare, 'share')}</span>
      </div>
      <p class="note small">On-site GVA per job is what official statistics see. Value per chain worker divides the final price by every job behind it,
        at home and abroad.</p>
      <button onclick={() => (ui.view = 'producer')}>Open in the producer view</button>
    </aside>
  </div>
{/if}

<style>
  .toolbar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
  .layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 16px; align-items: start; }
  .plot { position: relative; width: 100%; }
  svg { display: block; }
  .row { cursor: pointer; }
  .rowhit { fill: transparent; }
  .row:hover .rowhit, .row.chosen .rowhit { fill: var(--wash); }
  .name { fill: var(--ink); font-size: 13px; font-weight: 600; }
  .sub, .which { fill: var(--ink-muted); font-size: 12px; }
  .seg { font-size: 12px; font-variant-numeric: tabular-nums; pointer-events: none; }
  .side { display: flex; flex-direction: column; gap: 12px; }
  .tile { display: flex; flex-direction: column; }
  .big { font-size: 24px; font-weight: 600; }
  .small { font-size: 12px; }
  .official { max-width: 760px; display: flex; flex-direction: column; gap: 10px; }
</style>
