import { test, expect } from '@playwright/test';
import { fieldInput } from './helpers';

// Covers a gap noted after the initial E2E pass: promo banner CRUD
// (add/remove up to PROMO_BANNER_LIMIT = 4) was never exercised, only text
// edits on the single seeded banner. Each test gets a fresh browser context
// (Playwright default), so localStorage always starts from INIT_PROMO_BANNERS
// (1 seeded banner) regardless of test order.

test('adding a promo banner appears on the landing page, in order', async ({ page }) => {
  const marker = `E2E Kombi ${Date.now()}`;

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Kombi-Angebot', exact: true }).click();
  await expect(page.locator('text=1 / 4')).toBeVisible();

  await page.getByRole('button', { name: 'Banner hinzufügen' }).click();
  await expect(page.locator('text=2 / 4')).toBeVisible();

  const secondCard = page.locator('text=BANNER 2').locator('xpath=ancestor::div[contains(@class,"space-y-4")][1]');
  await fieldInput(secondCard, 'Titel (Zeilenumbruch mit Enter)').fill(marker);

  await page.goto('/de');
  const banners = page.locator('#preise > div');
  await expect(banners).toHaveCount(2);
  await expect(banners.nth(1)).toContainText(marker);
});

test('reaching the 4-banner limit hides "Banner hinzufügen", removing one shows it again', async ({ page }) => {
  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Kombi-Angebot', exact: true }).click();

  const addBtn = page.getByRole('button', { name: 'Banner hinzufügen' });
  for (let i = 0; i < 3; i++) {
    await addBtn.click();
  }
  await expect(page.locator('text=4 / 4')).toBeVisible();
  await expect(addBtn).toHaveCount(0);

  await page.goto('/de');
  await expect(page.locator('#preise > div')).toHaveCount(4);

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Kombi-Angebot', exact: true }).click();
  await page.locator('button[title="Banner löschen"]').first().click();

  await expect(page.locator('text=3 / 4')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Banner hinzufügen' })).toBeVisible();

  await page.goto('/de');
  await expect(page.locator('#preise > div')).toHaveCount(3);
});

test('the last remaining promo banner cannot be deleted', async ({ page }) => {
  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Kombi-Angebot', exact: true }).click();

  await expect(page.locator('text=1 / 4')).toBeVisible();
  await expect(page.locator('button[title="Banner löschen"]')).toHaveCount(0);
});
