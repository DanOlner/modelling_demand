<script lang="ts">
  import Controls from './components/Controls.svelte';
  import { CUSTOM_ID, SCENARIOS, customScenario } from './data/model';
  import { ui, VIEWS, readUrl, writeUrl } from './lib/state.svelte';
  import PlacesMap from './views/PlacesMap.svelte';
  import ProducerView from './views/ProducerView.svelte';
  import TimeSeries from './views/TimeSeries.svelte';
  import ValueCapture from './views/ValueCapture.svelte';
  import About from './views/About.svelte';
  import ScenarioEditor from './views/ScenarioEditor.svelte';

  readUrl();
  $effect(() => writeUrl());
  $effect(() => {
    if (ui.theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', ui.theme);
  });
  const scenario = $derived.by(() => {
    void ui.customVersion;
    const c = customScenario();
    return ui.scenario === CUSTOM_ID && c ? { title: `Custom: ${c.name}`, description: c.description || `${c.changes.length} ${c.changes.length === 1 ? "change" : "changes"}.` } : SCENARIOS.find((s) => s.id === ui.scenario);
  });
</script>

<div class="page">
  <header class="top">
    <div>
      <h1>Where GVA is made, booked and received</h1>
      <p class="muted">A stylised flow model of a city, a manufacturing town, a rural area and the rest of the world (model spec v1).</p>
    </div>
    <div class="nav">
    <select bind:value={ui.theme} aria-label="Colour theme">
      <option value="auto">Theme: system</option>
      <option value="light">Theme: light</option>
      <option value="dark">Theme: dark</option>
    </select>
    <nav class="segmented" aria-label="Views">
      {#each VIEWS as v (v.id)}
        <button aria-pressed={ui.view === v.id} onclick={() => (ui.view = v.id)} data-testid={`view-${v.id}`}>{v.label}</button>
      {/each}
    </nav>
    </div>
  </header>
  <div class="controls-row"><Controls /></div>
  {#if scenario}<p class="scenario note"><strong>{scenario.title}.</strong> {scenario.description}</p>{/if}
  {#if ui.mode === 'official'}
    <p class="banner" data-testid="official-banner">
      <strong>Official statistics view.</strong> Only what UK statistics measure: workplace GVA (profit of multi-place firms allocated by wage bill),
      real output by sector deflators, household income by residence. Flows between places, ownership, value capture and wealth are hidden.
    </p>
  {/if}
  <main>
    {#if ui.view === 'places'}<PlacesMap />
    {:else if ui.view === 'time'}<TimeSeries />
    {:else if ui.view === 'capture'}<ValueCapture />
    {:else if ui.view === 'producer'}<ProducerView />
    {:else if ui.view === 'editor'}<ScenarioEditor />
    {:else}<About />{/if}
  </main>
</div>

<style>
  .page { max-width: 1400px; margin: 0 auto; padding: 20px 24px 48px; }
  .top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
  .nav { display: flex; gap: 12px; align-items: center; }
  .controls-row { padding: 10px 0; border-top: 1px solid var(--grid); border-bottom: 1px solid var(--grid); margin-bottom: 10px; }
  .scenario { margin-bottom: 12px; }
  .banner { background: var(--wash); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; margin-bottom: 14px; font-size: 13px; }
  main { min-height: 400px; }
</style>
