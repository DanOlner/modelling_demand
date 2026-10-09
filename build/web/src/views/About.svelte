<script lang="ts">
  import { PLACE_NAMES } from '../data/names';
</script>

<article class="about">
  <section class="card">
    <h2>About the model</h2>
    <p>
      A small, stylised economy of four places: a core city, a manufacturing town, a rural area and the rest of the world. 17 producers in the three
      domestic places buy from each other and from abroad; households, firms and their owners (some overseas), a national government and an
      offshore holder of intellectual property make up the rest. Every flow is recorded, so the accounts always balance, and the model runs over
      40 years. All numbers are stylised first guesses, plausible in proportion, not a description of any real place.
    </p>
    <p>
      The model asks one question: how far does where GVA is <em>measured</em> tell you where it is <em>made</em>, who it is <em>booked</em> to,
      and who ends up <em>receiving</em> it? Each experiment changes one thing at t = 5 and shows the answer both as official statistics would see it and
      as the true flows behind them.
    </p>
  </section>

  <section class="card">
    <h2>The views</h2>
    <dl>
      <dt>Places</dt><dd>One measure ("lens") for each place, with flows of one kind between places: commuters, wages, dividends, purchases, royalties, taxes, benefits. Click a place to follow it in the other views.</dd>
      <dt>Over time</dt><dd>The scenario (dark line) against the baseline (grey), for the economy and for the selected place, in levels or as the difference.</dd>
      <dt>Value capture</dt><dd>Who gets each £1 of a final product, following its whole supply chain at home and abroad; and output per worker along the whole chain, next to GVA per job on site.</dd>
      <dt>Producer</dt><dd>The two-dimensional view of a single producer from Webber &amp; Huaccha (2024): price S, bought-in cost C and quantity Q, with curves of equal GVA (isoGVA).</dd>
      <dt>Scenario editor</dt><dd>Change any of the spec's switches (§14) from any period, run it, and share it as a link or a JSON file.</dd>
    </dl>
  </section>

  <section class="card">
    <h2>Official statistics and true flows</h2>
    <table class="data">
      <thead><tr><th></th><th>Official statistics</th><th>True flows</th></tr></thead>
      <tbody>
        <tr><td>Where GVA is booked</td><td>Workplace GVA, multi-place firms' profit shared by wage bill (as ONS does in finance and insurance; stylised elsewhere)</td><td>Where it is produced, at head office, or by wage bill</td></tr>
        <tr><td>Real output</td><td>Sector price deflators; public services by output indicators</td><td>Also own base prices (close to physical output) and public services by inputs</td></tr>
        <tr><td>Incomes</td><td>Household disposable income by residence</td><td>Also residual income after essentials, wealth, local retention</td></tr>
        <tr><td>Between places</td><td>Not shown</td><td>Commuting, wages, dividends, trade, royalties, taxes and benefits</td></tr>
        <tr><td>Products</td><td>Not shown</td><td>Value capture along whole supply chains</td></tr>
        <tr><td>One producer</td><td>Turnover, purchases, GVA and S/C only</td><td>S, C and Q separately</td></tr>
      </tbody>
    </table>
  </section>

  <section class="card">
    <h2>Reading the numbers</h2>
    <ul>
      <li>Money is £ a year. Output is measured in "£1 at base-year prices", so every price starts at 1.</li>
      <li>The base year (t = 0) is calibrated: exports balance the current account, the tax rate gives 5% unemployment, and the city's size means
        in-commuters fill 15% of its jobs. With no change, every later year repeats it.</li>
      <li>Prices don't respond to demand in this version, so demand shocks move quantities only.</li>
      <li>Colours: {Object.entries(PLACE_NAMES).filter(([k]) => k !== 'Government').map(([, v]) => v).join(', ')} keep the same colour everywhere.
        Every chart has a table view (the Table button).</li>
    </ul>
  </section>

  <section class="card">
    <h2>Not in this version</h2>
    <p>Unpaid household work, physical and environmental flows, several household types per place, firm behaviour (agents), price-responsive trade,
      investment and capital growth, productivity dynamics and calibration to UK data are all left for later versions (spec §18).</p>
    <p class="muted">Model spec v1, 3 October 2026. Built in TypeScript; the model runs in your browser.</p>
  </section>
</article>

<style>
  .about { display: grid; grid-template-columns: repeat(auto-fill, minmax(460px, 1fr)); gap: 16px; align-items: start; }
  section { display: flex; flex-direction: column; gap: 10px; }
  p, li, dd { max-width: 75ch; }
  dt { font-weight: 600; margin-top: 6px; }
  dd { margin: 2px 0 0; color: var(--ink-2); }
  ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
  td, th { white-space: normal; text-align: left !important; vertical-align: top; }
</style>
