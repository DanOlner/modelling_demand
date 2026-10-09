<script lang="ts">
  import LineChart from '../components/LineChart.svelte';
  import { MEASURES } from '../data/measures';
  import { BASELINE_ID, SCENARIOS, SHOCK_PERIOD, runFor } from '../data/model';
  import { PLACE_NAMES } from '../data/names';
  import { seriesPair } from '../data/series';
  import { currentRun, ui } from '../lib/state.svelte';

  const baseline = $derived(runFor(BASELINE_ID));
  const scenario = $derived(currentRun());
  const label = $derived(ui.scenario === BASELINE_ID ? 'Baseline' : ui.scenario === 'custom' ? 'Custom' : (SCENARIOS.find((s) => s.id === ui.scenario)?.id ?? ui.scenario));
  const visible = $derived(MEASURES.filter((m) => ui.mode === 'true' || m.official));
  const placeIndex = $derived(['C', 'M', 'R'].indexOf(ui.place));
  const pairs = $derived(visible.map((m) => ({ m, pair: seriesPair(m, baseline, scenario, placeIndex, ui.switches) })));
</script>

<div class="toolbar">
  <div class="segmented" role="group" aria-label="Show">
    <button aria-pressed={!ui.difference} onclick={() => (ui.difference = false)}>Levels</button>
    <button aria-pressed={ui.difference} onclick={() => (ui.difference = true)} data-testid="difference">Difference from baseline</button>
  </div>
  <p class="muted">Click a chart to move the period cursor. The change is applied at t = {SHOCK_PERIOD}.</p>
</div>

<h2>The economy</h2>
<div class="grid">
  {#each pairs.filter((p) => p.m.scope === 'economy') as { m, pair } (m.id)}
    <LineChart title={m.label} subtitle={m.caption} unit={m.unit} scenarioLabel={label} scenario={pair.scenario} baseline={pair.baseline}
      difference={ui.difference} shock={SHOCK_PERIOD} selected={ui.t} onpick={(t) => (ui.t = t)} />
  {/each}
</div>

<div class="place-head">
  <h2>{PLACE_NAMES[ui.place]}</h2>
  <div class="segmented" role="group" aria-label="Place">
    {#each ['C', 'M', 'R'] as p (p)}
      <button aria-pressed={ui.place === p} onclick={() => (ui.place = p)}><span class="swatch" style={`background: var(--place-${p})`}></span> {PLACE_NAMES[p]}</button>
    {/each}
  </div>
</div>
<div class="grid">
  {#each pairs.filter((p) => p.m.scope === 'place') as { m, pair } (m.id)}
    <LineChart title={m.label} subtitle={m.caption} unit={m.unit} scenarioLabel={label} scenario={pair.scenario} baseline={pair.baseline}
      difference={ui.difference} shock={SHOCK_PERIOD} selected={ui.t} onpick={(t) => (ui.t = t)} />
  {/each}
</div>

<style>
  .toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin: 10px 0 24px; }
  .place-head { display: flex; align-items: center; gap: 16px; }
</style>
