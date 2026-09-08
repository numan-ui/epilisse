import { test, expect, type Page } from '@playwright/test';

// Replaces admin-promo-banners-crud.spec.ts. Covers the unified Aktion model:
// central CRUD, the two-toggle rule, the per-category limit, the /aktionen
// page, and the last-10-days countdown badge. Fresh context per test → the
// admin state starts from INIT_AKTIONEN (3 category Aktionen + 1 home banner).

const CARD = '[data-testid="aktion-card"]';

/** Give the debounced draft write-through (700ms) time to PUT before navigating. */
async function settle(page: Page) {
  await page.waitForTimeout(1100);
}

test('create an Aktion, activate it on the homepage, see it on /de', async ({ page }) => {
  const marker = `E2E Aktion ${Date.now()}`;

  await page.goto('/de/admin/aktionen');
  await page.getByRole('button', { name: '+ Neue Aktion' }).first().click();
  const card = page.locator(CARD).last();
  await card.getByPlaceholder('Titel der Aktion *').fill(marker);
  await card.getByPlaceholder('0,00€').first().fill('99,00€');
  await card.getByRole('switch', { name: 'Auf Startseite aktiv' }).click();
  await settle(page);

  await page.goto('/de');
  const banner = page.locator('#preise > div', { hasText: marker });
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('99,00€');
});

test('an Aktion inactive in its category is hidden on homepage AND /aktionen', async ({ page }) => {
  const marker = `E2E Hidden ${Date.now()}`;

  await page.goto('/de/admin/aktionen');
  await page.getByRole('button', { name: '+ Neue Aktion' }).first().click();
  const card = page.locator(CARD).last();
  await card.getByPlaceholder('Titel der Aktion *').fill(marker);
  await card.getByRole('switch', { name: 'Auf Startseite aktiv' }).click();        // home on
  await card.getByRole('switch', { name: 'Im Kategoriebereich aktiv' }).click();   // category OFF

  await expect(card.getByRole('switch', { name: 'Auf Startseite aktiv' })).toBeDisabled();
  await settle(page);

  await page.goto('/de');
  await expect(page.locator('#preise', { hasText: marker })).toHaveCount(0);
  await page.goto('/de/aktionen');
  await expect(page.getByText(marker)).toHaveCount(0);
});

test('per-category limit of 10 disables "+ Neue Aktion"', async ({ page }) => {
  await page.goto('/de/admin/aktionen');
  const addFirst = page.getByRole('button', { name: '+ Neue Aktion' }).first();
  for (let i = 0; i < 12; i++) {
    if (await addFirst.isDisabled()) break;
    await addFirst.click();
  }
  await expect(addFirst).toBeDisabled();
  await expect(page.getByText('(10/10)').first()).toBeVisible();
});

test('countdown badge shows only inside the 10-day window', async ({ page }) => {
  const soon = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
  const far  = new Date(Date.now() + 40 * 86_400_000).toISOString().slice(0, 10);
  const marker = `E2E Countdown ${Date.now()}`;

  await page.goto('/de/admin/aktionen');
  await page.getByRole('button', { name: '+ Neue Aktion' }).first().click();
  const card = page.locator(CARD).last();
  await card.getByPlaceholder('Titel der Aktion *').fill(marker);

  await card.locator('input[type="date"]').nth(1).fill(soon);
  await expect(card.getByText('Noch 5 Tage')).toBeVisible();

  await card.locator('input[type="date"]').nth(1).fill(far);
  await expect(card.getByText(/Noch \d+ Tage/)).toHaveCount(0);
});
