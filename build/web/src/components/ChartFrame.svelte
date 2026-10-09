<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    /** The legend, above the plot. */
    legend?: Snippet;
    children: Snippet;
    /** The chart's table-view twin. */
    table: Snippet;
  }
  let { title, subtitle, legend, children, table }: Props = $props();
  let showTable = $state(false);
</script>

<section class="card frame">
  <header>
    <div>
      <h3>{title}</h3>
      {#if subtitle}<p class="muted small">{subtitle}</p>{/if}
    </div>
    <button class="small" aria-pressed={showTable} onclick={() => (showTable = !showTable)}>Table</button>
  </header>
  {#if legend}<div class="legend">{@render legend()}</div>{/if}
  {#if showTable}
    <div class="table">{@render table()}</div>
  {:else}
    {@render children()}
  {/if}
</section>

<style>
  .frame { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .small { font-size: 12px; }
  .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--ink-2); }
  .table { max-height: 320px; overflow: auto; }
</style>
