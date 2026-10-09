<script lang="ts">
  // The scenario editor (views plan 8.6): build a list of §14 changes, check that it runs, and
  // make it the scenario every view shows.
  import type { Change, Scenario } from '../../../src/engine/scenario';
  import { formatDelta, formatValue } from '../data/format';
  import { BASELINE_ID, CUSTOM_ID, LAST_PERIOD, SCENARIOS, SHOCK_PERIOD, customScenario, params, runFor, scenarioById, setCustomScenario } from '../data/model';
  import { PLACE_NAMES } from '../data/names';
  import { SWITCH_GROUPS, decodeScenario, describeChange, encodeScenario, switchCatalogue, switchId, type SwitchDef } from '../data/switches';
  import { ui } from '../lib/state.svelte';

  const baseRun = runFor(BASELINE_ID);
  const catalogue = switchCatalogue(params, baseRun[0].result.commuting);
  const groups = Object.keys(SWITCH_GROUPS);
  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

  const existing = customScenario();
  let draft = $state<Scenario>(existing ? clone(existing) : { name: 'My scenario', description: '', changes: [] });
  let copyFrom = $state('E1');
  let message = $state<{ kind: 'ok' | 'error'; text: string } | null>(null);

  // The form for a new change.
  let group = $state('S5');
  const inGroup = $derived(catalogue.filter((d) => d.group === group));
  let chosenId = $state('');
  $effect(() => {
    if (!inGroup.some((d) => d.id === chosenId)) chosenId = inGroup[0]?.id ?? '';
  });
  const chosen = $derived<SwitchDef | undefined>(catalogue.find((d) => d.id === chosenId));
  let period = $state(SHOCK_PERIOD);
  let op = $state<'set' | 'scale' | 'add'>('scale');
  let value = $state(1.1);
  let owners = $state<Record<string, number>>({});
  let matrix = $state<number[][]>([]);
  let flag = $state(true);
  $effect(() => {
    if (!chosen) return;
    if (chosen.kind === 'owners') owners = { C: 0, M: 0, R: 0, W: 0, ...(chosen.base as Record<string, number>) };
    if (chosen.kind === 'commuting') matrix = clone(chosen.base as number[][]);
  });
  const ownersTotal = $derived(Object.values(owners).reduce((s, x) => s + (Number(x) || 0), 0));

  function addChange() {
    if (!chosen) return;
    const change: Change = { period: Math.max(1, Math.min(LAST_PERIOD, Math.round(period))), path: chosen.path };
    if (chosen.kind === 'owners') change.set = Object.fromEntries(Object.entries(owners).map(([k, v]) => [k, Number(v)]));
    else if (chosen.kind === 'commuting') change.set = matrix.map((row) => row.map(Number));
    else if (chosen.kind === 'boolean') change.set = flag;
    else change[op] = Number(value);
    draft.changes = [...draft.changes, change];
    message = null;
  }

  function copyChanges() {
    const s = scenarioById(copyFrom);
    if (!s) return;
    draft.changes = [...draft.changes, ...clone(s.changes)];
    if (draft.name === 'My scenario') draft.name = `${copyFrom} variant`;
  }

  /** The operation and value of a number change, for editing in the list. */
  const opOf = (c: Change): 'set' | 'scale' | 'add' => (c.scale !== undefined ? 'scale' : c.add !== undefined ? 'add' : 'set');
  function setOp(i: number, next: 'set' | 'scale' | 'add') {
    const c = draft.changes[i];
    const v = Number(c[opOf(c)]);
    delete c.set;
    delete c.scale;
    delete c.add;
    c[next] = v;
  }
  const isNumber = (c: Change) => catalogue.find((d) => d.id === switchId(c.path))?.kind === 'number';

  let summary = $state<{ label: string; base: number; now: number; unit: 'gbp' | 'rate' }[] | null>(null);
  function apply() {
    try {
      const records = setCustomScenario(clone(draft));
      ui.customVersion++;
      ui.scenario = CUSTOM_ID;
      const t = LAST_PERIOD;
      const b = baseRun[t].result;
      const r = records[t].result;
      summary = [
        { label: 'GDP', base: b.macro.gdpProduction, now: r.macro.gdpProduction, unit: 'gbp' },
        { label: 'GNI', base: b.macro.gni, now: r.macro.gni, unit: 'gbp' },
        { label: 'Unemployment rate', base: b.macro.unemploymentRate, now: r.macro.unemploymentRate, unit: 'rate' },
        { label: 'Government balance', base: b.government.balance, now: r.government.balance, unit: 'gbp' },
      ];
      message = { kind: 'ok', text: `Applied. Every view now shows "${draft.name}". Results at t = ${t}:` };
    } catch (e) {
      summary = null;
      message = { kind: 'error', text: `This scenario can't be run, so nothing has changed: ${(e as Error).message}` };
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${draft.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'scenario'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  let importText = $state('');
  function importJson(text: string) {
    try {
      draft = decodeScenario(text);
      message = { kind: 'ok', text: `Imported "${draft.name}" with ${draft.changes.length} changes. Apply it to run it.` };
    } catch (e) {
      message = { kind: 'error', text: `Couldn't read that scenario: ${(e as Error).message}` };
    }
  }
  async function importFile(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) importJson(await file.text());
  }
  const hasCustom = $derived.by(() => {
    void ui.customVersion;
    return customScenario() !== null;
  });
  let copied = $state(false);
  async function copyLink() {
    await navigator.clipboard?.writeText(location.href);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
  const baseText = (d: SwitchDef) =>
    d.kind === 'number' ? Number(d.base).toPrecision(6).replace(/\.?0+$/, '') : d.kind === 'boolean' ? String(d.base) : 'see the form';
</script>

<div class="editor">
  <section class="card">
    <h2>Your scenario</h2>
    <div class="row">
      <label class="grow">Name <input bind:value={draft.name} data-testid="scenario-name" /></label>
    </div>
    <label class="col">Description <input bind:value={draft.description} placeholder="What the scenario changes, and why" /></label>
    <div class="row">
      <label>Copy the changes of
        <select bind:value={copyFrom}>
          {#each SCENARIOS.filter((s) => s.id !== BASELINE_ID) as s (s.id)}<option value={s.id}>{s.title}</option>{/each}
        </select>
      </label>
      <button onclick={copyChanges}>Copy</button>
      <button onclick={() => (draft.changes = [])} disabled={draft.changes.length === 0}>Clear all changes</button>
    </div>

    {#if draft.changes.length === 0}
      <p class="note">No changes yet: add one below, or copy an experiment's to start from.</p>
    {:else}
      <table class="data changes" data-testid="change-list">
        <thead><tr><th>Change</th><th>From t</th><th>Operation</th><th>Value</th><th></th></tr></thead>
        <tbody>
          {#each draft.changes as c, i (i)}
            <tr>
              <td class="what">{describeChange(c, catalogue)}</td>
              <td><input type="number" min="1" max={LAST_PERIOD} bind:value={c.period} class="small-input" /></td>
              {#if isNumber(c)}
                <td>
                  <select value={opOf(c)} onchange={(e) => setOp(i, (e.currentTarget as HTMLSelectElement).value as 'set' | 'scale' | 'add')}>
                    <option value="set">set to</option><option value="scale">multiply by</option><option value="add">add</option>
                  </select>
                </td>
                <td>
                  {#if c.scale !== undefined}<input type="number" step="any" bind:value={c.scale} class="small-input" />
                  {:else if c.add !== undefined}<input type="number" step="any" bind:value={c.add} class="small-input" />
                  {:else}<input type="number" step="any" bind:value={c.set} class="small-input" />{/if}
                </td>
              {:else}
                <td>set to</td><td class="muted">as listed</td>
              {/if}
              <td><button onclick={() => (draft.changes = draft.changes.filter((_, k) => k !== i))} aria-label="Remove change">Remove</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    <div class="row actions">
      <button class="primary" onclick={apply} disabled={draft.changes.length === 0} data-testid="apply">Apply and run</button>
      <button onclick={exportJson} disabled={draft.changes.length === 0}>Export JSON</button>
      <button onclick={copyLink} disabled={!hasCustom}>{copied ? 'Link copied' : 'Copy link to this view'}</button>
    </div>
    {#if message}
      <p class={`message ${message.kind}`} role="status" data-testid="editor-message">{message.text}</p>
    {/if}
    {#if summary}
      <table class="data summary" data-testid="editor-summary">
        <thead><tr><th>At t = {LAST_PERIOD}</th><th>Baseline</th><th>Your scenario</th><th>Change</th></tr></thead>
        <tbody>
          {#each summary as s (s.label)}
            <tr><td>{s.label}</td><td>{formatValue(s.base, s.unit)}</td><td>{formatValue(s.now, s.unit)}</td><td>{formatDelta(s.now - s.base, s.unit)}</td></tr>
          {/each}
        </tbody>
      </table>
      <div class="row">
        <button onclick={() => (ui.view = 'places')}>See it on the map</button>
        <button onclick={() => (ui.view = 'time')}>See it over time</button>
      </div>
    {/if}
  </section>

  <section class="card">
    <h2>Add a change</h2>
    <p class="note">Every switch in §14 of the spec. A change applies from its period to the end of the run (t = {LAST_PERIOD}); the base year can't be changed.</p>
    <label class="col">Switch group
      <select bind:value={group} data-testid="switch-group">
        {#each groups as g (g)}<option value={g}>{SWITCH_GROUPS[g]}</option>{/each}
      </select>
    </label>
    <label class="col">Parameter
      <select bind:value={chosenId} data-testid="switch">
        {#each inGroup as d (d.id)}<option value={d.id}>{d.label}</option>{/each}
      </select>
    </label>
    {#if chosen}
      <p class="muted small">Base value: {baseText(chosen)}</p>
      <label>From period <input type="number" min="1" max={LAST_PERIOD} bind:value={period} class="small-input" /></label>
      {#if chosen.kind === 'number'}
        <div class="row">
          <select bind:value={op} data-testid="op">
            <option value="set">Set to</option><option value="scale">Multiply by</option><option value="add">Add</option>
          </select>
          <input type="number" step="any" bind:value={value} class="small-input" data-testid="value" />
        </div>
      {:else if chosen.kind === 'boolean'}
        <label><input type="checkbox" bind:checked={flag} /> On</label>
      {:else if chosen.kind === 'owners'}
        <div class="grid4">
          {#each Object.keys(owners) as g (g)}
            <label class="col">{PLACE_NAMES[g] ?? g}<input type="number" step="0.01" min="0" max="1" bind:value={owners[g]} /></label>
          {/each}
        </div>
        <p class={Math.abs(ownersTotal - 1) < 1e-9 ? 'muted small' : 'message error small'}>Shares sum to {ownersTotal.toFixed(3)}; they must sum to 1.</p>
      {:else if chosen.kind === 'commuting'}
        <p class="muted small">Rows: workplaces. Columns: where the workers live. Each row must sum to 1. Prefilled with the base-year matrix.</p>
        <table class="data">
          <thead><tr><th>Jobs in ↓ / held by →</th>{#each params.places as p (p)}<th>{PLACE_NAMES[p]}</th>{/each}</tr></thead>
          <tbody>
            {#each matrix as row, w (w)}
              <tr><td>{PLACE_NAMES[params.places[w]]}</td>{#each row as _, r (r)}<td><input type="number" step="0.001" bind:value={matrix[w][r]} class="small-input" /></td>{/each}</tr>
            {/each}
          </tbody>
        </table>
      {/if}
      <button onclick={addChange} data-testid="add-change">Add to scenario</button>
    {/if}

    <h3 class="import-head">Import a scenario</h3>
    <input type="file" accept="application/json,.json" onchange={importFile} />
    <textarea bind:value={importText} rows="3" placeholder="…or paste scenario JSON here"></textarea>
    <button onclick={() => importJson(importText)} disabled={importText.trim() === ''}>Import pasted JSON</button>
  </section>
</div>

<style>
  .editor { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr); gap: 16px; align-items: start; }
  section { display: flex; flex-direction: column; gap: 10px; }
  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .col { display: flex; flex-direction: column; gap: 4px; }
  .grow { flex: 1; display: flex; gap: 6px; align-items: center; }
  .grow input { flex: 1; }
  input:not([type='checkbox']):not([type='file']), textarea {
    background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px;
  }
  .small-input { width: 96px; }
  .changes td.what { white-space: normal; text-align: left; }
  .primary { background: var(--ink); color: var(--surface); border-color: var(--ink); }
  .primary:hover { background: var(--ink-2); }
  button:disabled { opacity: 0.45; cursor: not-allowed; }
  .message { font-size: 13px; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); }
  .message.ok { background: var(--wash); }
  .message.error { border-color: var(--down); color: var(--ink); }
  .message.error::before { content: '⚠ '; color: var(--down); }
  .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .grid4 input { width: 100%; }
  .small { font-size: 12px; }
  .import-head { margin-top: 12px; }
  textarea { width: 100%; font-family: ui-monospace, monospace; font-size: 12px; }
</style>
