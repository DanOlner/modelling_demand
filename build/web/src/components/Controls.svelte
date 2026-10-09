<script lang="ts">
  // The one row of controls above every view (dataviz skill: filters in one row, scoping everything below).
  import { BOOKINGS, MEASUREMENT_VIEWS, SERVICE_CONVENTIONS } from '../../../src/engine/lenses';
  import { CUSTOM_ID, LAST_PERIOD, SCENARIOS, SHOCK_PERIOD, customScenario } from '../data/model';
  import { BOOKING_LABELS, CONVENTION_LABELS, MEASURE_LABELS } from '../data/settings';
  import { ui } from '../lib/state.svelte';

  const official = $derived(ui.mode === 'official');
  const custom = $derived((void ui.customVersion, customScenario()));
</script>

<div class="controls">
  <label>
    <span class="muted">Scenario</span>
    <select bind:value={ui.scenario} data-testid="scenario">
      {#each SCENARIOS as s (s.id)}<option value={s.id}>{s.title}</option>{/each}
      {#if custom}<option value={CUSTOM_ID}>Custom: {custom.name}</option>{/if}
    </select>
  </label>
  <label class="period">
    <span class="muted">Period</span>
    <input type="range" min="0" max={LAST_PERIOD} bind:value={ui.t} data-testid="period" />
    <span class="num">t = {ui.t}{ui.t < SHOCK_PERIOD ? ' (before the change)' : ''}</span>
  </label>
  <div class="segmented" role="group" aria-label="Streetlight">
    <button aria-pressed={official} onclick={() => (ui.mode = 'official')} data-testid="mode-official">Official statistics</button>
    <button aria-pressed={!official} onclick={() => (ui.mode = 'true')} data-testid="mode-true">True flows</button>
  </div>
  <details class="menu">
    <summary>Measurement</summary>
    <div class="popover card">
      {#if official}<p class="note">The official view fixes these at what UK statistics do. Switch to true flows to change them.</p>{/if}
      <label>Booking of multi-place firms' profit (S1)
        <select bind:value={ui.booking} disabled={official}>
          {#each BOOKINGS as b (b)}<option value={b}>{BOOKING_LABELS[b]}</option>{/each}
        </select>
      </label>
      <label>Measurement view (S3)
        <select bind:value={ui.measure} disabled={official}>
          {#each MEASUREMENT_VIEWS as v (v)}<option value={v}>{MEASURE_LABELS[v]}</option>{/each}
        </select>
      </label>
      <label>Public-service output (S2)
        <select bind:value={ui.convention} disabled={official}>
          {#each SERVICE_CONVENTIONS as c (c)}<option value={c}>{CONVENTION_LABELS[c]}</option>{/each}
        </select>
      </label>
    </div>
  </details>
</div>

<style>
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; }
  label { display: inline-flex; align-items: center; gap: 6px; }
  .period input { width: 180px; }
  .period .num { min-width: 150px; }
  .menu { position: relative; }
  .menu summary { list-style: none; cursor: pointer; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; background: var(--surface); }
  .popover { position: absolute; z-index: 20; top: 34px; left: 0; width: 330px; display: flex; flex-direction: column; gap: 10px; }
  .popover label { display: flex; flex-direction: column; align-items: stretch; gap: 4px; }
</style>
