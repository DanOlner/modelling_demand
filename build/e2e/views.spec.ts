import { expect, test, type Page } from '@playwright/test';

const SHOTS = 'out/screenshots';

/** Opens a state of the app by its URL, failing the test on any console error. */
async function open(page: Page, query: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`/?${query}`);
  await page.waitForSelector('main > *');
  return errors;
}

const states: { name: string; query: string; check?: (page: Page) => Promise<void> }[] = [
  {
    name: 'places-baseline',
    query: 'view=places&scenario=baseline&t=40&lens=gvaPerJob&flow=commuters',
    check: async (p) => {
      await expect(p.getByTestId('card-C')).toHaveText('£81.6k');
      await expect(p.getByTestId('card-M')).toHaveText('£53.8k');
    },
  },
  {
    name: 'places-E1-dividends',
    query: 'view=places&scenario=E1&t=40&lens=gvaPerJob&flow=dividends',
    check: async (p) => {
      await expect(p.locator('.arrow').first()).toBeVisible();
    },
  },
  {
    name: 'places-headoffice',
    query: 'view=places&scenario=baseline&t=40&lens=gvaPerJob&flow=purchases&booking=headOffice',
    check: async (p) => {
      await expect(p.getByTestId('card-C')).toHaveText('£89.5k');
    },
  },
  {
    name: 'places-E5-official',
    query: 'view=places&scenario=E5&t=40&lens=gvaPerJob&mode=official',
    check: async (p) => {
      await expect(p.getByTestId('official-banner')).toBeVisible();
      await expect(p.locator('.arrow')).toHaveCount(0);
    },
  },
  { name: 'time-E3', query: 'view=time&scenario=E3&t=40&place=R' },
  { name: 'time-E6-difference', query: 'view=time&scenario=E6&t=40&difference=1' },
  { name: 'time-official', query: 'view=time&scenario=E1&t=40&mode=official' },
  { name: 'capture-E1', query: 'view=capture&scenario=E1&t=40&product=C.HQ' },
  { name: 'capture-E2-per-unit', query: 'view=capture&scenario=E2&t=40&product=R.RET&perUnit=1' },
  {
    name: 'capture-official',
    query: 'view=capture&scenario=E1&t=40&mode=official',
    check: async (p) => {
      await expect(p.getByTestId('capture-hidden')).toBeVisible();
    },
  },
  { name: 'producer-HQ-E1', query: 'view=producer&scenario=E1&t=40&product=C.HQ' },
  { name: 'producer-AGR-E2', query: 'view=producer&scenario=E2&t=40&product=R.AGR' },
  { name: 'producer-PRV-E8', query: 'view=producer&scenario=E8&t=40&product=C.PRV' },
  { name: 'producer-RET-E3', query: 'view=producer&scenario=E3&t=40&product=R.RET' },
  {
    name: 'producer-official',
    query: 'view=producer&scenario=E1&t=40&product=C.HQ&mode=official',
    check: async (p) => {
      await expect(p.getByTestId('producer-official')).toBeVisible();
    },
  },
  { name: 'places-E1-dark', query: 'view=places&scenario=E1&t=40&flow=dividends&theme=dark' },
  { name: 'capture-E1-dark', query: 'view=capture&scenario=E1&t=40&theme=dark' },
  { name: 'producer-HQ-E1-dark', query: 'view=producer&scenario=E1&t=40&product=C.HQ&theme=dark' },
];

for (const s of states) {
  test(s.name, async ({ page }) => {
    const errors = await open(page, s.query);
    if (s.check) await s.check(page);
    await page.screenshot({ path: `${SHOTS}/${s.name}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('the controls change the view and the URL', async ({ page }) => {
  const errors = await open(page, 'view=places&scenario=baseline&t=40');
  await page.getByTestId('scenario').selectOption('E5');
  await expect(page).toHaveURL(/scenario=E5/);
  await page.getByTestId('mode-official').click();
  await expect(page.getByTestId('official-banner')).toBeVisible();
  await page.getByTestId('view-time').click();
  await expect(page).toHaveURL(/view=time/);
  await page.getByTestId('view-producer').click();
  await page.getByTestId('mode-true').click();
  await expect(page.getByTestId('rectangle')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the scenario editor builds, runs and shares a scenario', async ({ page }) => {
  const errors = await open(page, 'view=editor&scenario=baseline&t=40');
  await page.getByTestId('scenario-name').fill('City rents up 30%, again');
  await page.getByTestId('switch-group').selectOption('S6');
  await page.getByTestId('switch').selectOption('producers/C.HSG/fixedPrice');
  await page.getByTestId('op').selectOption('scale');
  await page.getByTestId('value').fill('1.3');
  await page.getByTestId('add-change').click();
  await expect(page.getByTestId('change-list')).toContainText('Price index: Housing, city × 1.3');
  await page.getByTestId('apply').click();
  await expect(page.getByTestId('editor-message')).toContainText('Applied');
  await expect(page.getByTestId('editor-summary')).toContainText('GDP');
  await expect(page).toHaveURL(/scenario=custom/);
  await expect(page).toHaveURL(/custom=/);
  await expect(page.getByRole('button', { name: 'Copy link to this view' })).toBeEnabled();
  await page.screenshot({ path: `${SHOTS}/editor.png`, fullPage: true });
  // The same results as E5, which makes the same change.
  await page.getByTestId('view-places').click();
  const custom = await page.getByTestId('card-C').textContent();
  await page.getByTestId('scenario').selectOption('E5');
  await expect(page.getByTestId('card-C')).toHaveText(custom!);
  // A shared link reproduces the custom scenario.
  await page.goto(page.url().replace('scenario=E5', 'scenario=custom'));
  await expect(page.getByTestId('card-C')).toHaveText(custom!);
  expect(errors).toEqual([]);
});

test('the editor refuses a scenario that cannot run', async ({ page }) => {
  const errors = await open(page, 'view=editor&scenario=baseline');
  await page.getByTestId('switch-group').selectOption('S9');
  await page.getByTestId('add-change').click(); // owners prefilled; break them by adding a second change below
  await page.locator('.grid4 input').first().fill('0.9');
  await page.getByTestId('add-change').click();
  await page.getByTestId('apply').click();
  await expect(page.getByTestId('editor-message')).toContainText("can't be run");
  await expect(page).not.toHaveURL(/scenario=custom/);
  expect(errors).toEqual([]);
});

test('the about page and the sector mix render', async ({ page }) => {
  const errors = await open(page, 'view=about');
  await expect(page.getByText('About the model')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/about.png`, fullPage: true });
  await page.goto('/?view=places&scenario=E3&t=40');
  await page.getByTestId('mix-gva').click();
  await page.locator('.multiples').screenshot({ path: `${SHOTS}/sector-mix.png` });
  expect(errors).toEqual([]);
});

test('the single-file build opens from disk with no server', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`file://${process.cwd()}/web/dist/index.html?view=places&scenario=baseline&lens=gvaPerJob`);
  await expect(page.getByTestId('card-C')).toHaveText('£81.6k');
  await page.getByTestId('view-capture').click();
  await expect(page.getByTestId('chain-tiles')).toBeVisible();
  expect(errors).toEqual([]);
});
