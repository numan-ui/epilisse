import { test, expect } from '@playwright/test';
import { fieldInput } from './helpers';

// Covers a gap noted after the initial E2E pass: about-values CRUD
// (add/remove up to ABOUT_VALUE_LIMIT = 10) was never exercised. Each test
// gets a fresh browser context, so localStorage always starts from
// INIT_ABOUT_VALUES (3 seeded values: Qualität, Diskretion, Perfektion).

test('adding a value appears in the Über-Uns section on the landing page', async ({ page }) => {
  const marker = `E2E Vertrauen ${Date.now()}`;

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Über Uns', exact: true }).click();
  await expect(page.locator('text=3 / 10')).toBeVisible();

  await page.getByRole('button', { name: 'Wert hinzufügen' }).click();
  await expect(page.locator('text=4 / 10')).toBeVisible();

  const fourthCard = page.locator('text=WERT 4').locator('xpath=ancestor::div[contains(@class,"space-y-3")][1]');
  await fieldInput(fourthCard, 'Titel').fill(marker);

  await page.goto('/de#uber-uns');
  await expect(page.locator('#uber-uns')).toContainText(marker);
});

test('reaching the 10-value limit hides "Wert hinzufügen"', async ({ page }) => {
  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Über Uns', exact: true }).click();

  const addBtn = page.getByRole('button', { name: 'Wert hinzufügen' });
  for (let i = 0; i < 7; i++) {
    await addBtn.click();
  }
  await expect(page.locator('text=10 / 10')).toBeVisible();
  await expect(addBtn).toHaveCount(0);

  await page.goto('/de');
  const valueCards = page.locator('#uber-uns h3');
  await expect(valueCards).toHaveCount(10);
});

test('deleting values down to 1 hides the delete button', async ({ page }) => {
  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Über Uns', exact: true }).click();

  const deleteBtn = page.locator('button[title="Wert löschen"]');
  // 3 seeded values -> delete down to 1
  await deleteBtn.first().click();
  await deleteBtn.first().click();

  await expect(page.locator('text=1 / 10')).toBeVisible();
  await expect(deleteBtn).toHaveCount(0);

  await page.goto('/de');
  await expect(page.locator('#uber-uns h3')).toHaveCount(1);
});
