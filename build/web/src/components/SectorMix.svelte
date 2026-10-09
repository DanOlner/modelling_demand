<script lang="ts">
  // Lens 7, sector groups, as small multiples: one panel per group, one bar per place in the
  // place colours, so colour keeps meaning place everywhere. Bars grow from a square baseline
  // to a 4px rounded end; values sit at the bar tips.
  import type { PeriodRecord } from '../../../src/engine/run';
  import { formatDelta, formatValue } from '../data/format';
  import { lensesOf } from '../data/model';
  import { PLACE_NAMES } from '../data/names';
  import ChartFrame from './ChartFrame.svelte';

  interface Props {
    record: PeriodRecord;
    baseline: PeriodRecord;
  }
  let { record, baseline }: Props = $props();
  let measure = $state<'jobsShare' | 'gvaShare'>('jobsShare');
  const groups = $derived(lensesOf(record).structure.groups);
  const baseGroups = $derived(lensesOf(baseline).structure.groups);
  const places = $derived(record.econ.places);
  const max = $derived(Math.max(...groups.flatMap((g) => g[measure])));

  const barHeight = 18;
  const rowGap = 8;
  let width = $state(220);
  const labelWidth = 74;
  const valueWidth = 46;
  /** A bar with a square start and a 4px rounded end. */
  function bar(x0: number, y: number, w: number, h: number): string {
    const r = Math.min(4, w / 2, h / 2);
    return `M${x0},${y} H${x0 + w - r} Q${x0 + w},${y} ${x0 + w},${y + r} V${y + h - r} Q${x0 + w},${y + h} ${x0 + w - r},${y + h} H${x0} Z`;
  }
</script>

<ChartFrame title={`Sector mix by place, t = ${record.t}`} subtitle="Each sector group's share of the jobs (or GVA) in each place (lens 7).">
  {#snippet legend()}
    <div class="segmented" role="group" aria-label="Share of">
      <button aria-pressed={measure === 'jobsShare'} onclick={() => (measure = 'jobsShare')}>Share of jobs</button>
      <button aria-pressed={measure === 'gvaShare'} onclick={() => (measure = 'gvaShare')} data-testid="mix-gva">Share of GVA</button>
    </div>
  {/snippet}
  <div class="multiples">
    {#each groups as g, k (g.name)}
      <div class="panel" bind:clientWidth={width}>
        <h3 class="group">{g.name[0].toUpperCase() + g.name.slice(1)}</h3>
        <svg width={width} height={places.length * (barHeight + rowGap)} role="img" aria-label={`${g.name}: share by place`}>
          {#each places as p, w (p)}
            {@const y = w * (barHeight + rowGap)}
            {@const span = Math.max(0, width - labelWidth - valueWidth)}
            <text class="label" x="0" y={y + barHeight / 2} dy="0.32em">{PLACE_NAMES[p]}</text>
            <path d={bar(labelWidth, y, Math.max(1, (g[measure][w] / max) * span), barHeight)} fill={`var(--place-${p})`}>
              <title>{PLACE_NAMES[p]}: {formatValue(g[measure][w], 'share')} (baseline {formatValue(baseGroups[k][measure][w], 'share')})</title>
            </path>
            <text class="value" x={labelWidth + (g[measure][w] / max) * span + 6} y={y + barHeight / 2} dy="0.32em">{formatValue(g[measure][w], 'share')}</text>
          {/each}
        </svg>
      </div>
    {/each}
  </div>
  {#snippet table()}
    <table class="data">
      <thead><tr><th>Sector group</th>{#each places as p (p)}<th>{PLACE_NAMES[p]}</th><th>change</th>{/each}</tr></thead>
      <tbody>
        {#each groups as g, k (g.name)}
          <tr><td>{g.name}</td>{#each places as p, w (p)}<td>{formatValue(g[measure][w], 'share')}</td><td>{formatDelta(g[measure][w] - baseGroups[k][measure][w], 'share')}</td>{/each}</tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</ChartFrame>

<style>
  .multiples { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px 24px; }
  .panel { min-width: 0; }
  .group { font-size: 13px; margin-bottom: 6px; }
  svg { display: block; }
  .label { fill: var(--ink-2); font-size: 12px; }
  .value { fill: var(--ink); font-size: 12px; font-variant-numeric: tabular-nums; }
</style>
