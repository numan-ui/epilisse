import { test, expect } from '@playwright/test';
import { fieldInput } from './helpers';

// Covers a gap noted after the initial E2E pass: hero-slide add/remove at the
// HERO_SLIDE_LIMIT = 10 boundary was never exercised. Each test gets a fresh
// browser context, so localStorage always starts from INIT_HERO_SLIDES
// (4 seeded slides).
//
// The public hero renders each slide's "Slide N" aria-label twice (a top
// progress-bar button and a mobile-only dot, see helpers.ts / public-smoke
// gotcha) — count *distinct* aria-label values, not raw element count, to
// get the true slide count.

async function distinctSlideLabelCount(page: import('@playwright/test').Page) {
  const labels = await page.locator('[aria-label^="Slide "]').evaluateAll((els) =>
    els.map((e) => e.getAttribute('aria-label'))
  );
  return new Set(labels).size;
}

test('adding a hero slide increases the public slide count', async ({ page }) => {
  const marker = `E2E Slide ${Date.now()}`;

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Hero-Slider', exact: true }).click();
  await expect(page.locator('text=4 / 10')).toBeVisible();

  await page.getByRole('button', { name: 'Slide hinzufügen' }).click();
  await expect(page.locator('text=5 / 10')).toBeVisible();

  const fifthCard = page.locator('text=SLIDE 5').locator('xpath=ancestor::div[contains(@class,"space-y-4")][1]');
  await fieldInput(fifthCard, 'Headline').fill(marker);

  await page.goto('/de');
  expect(await distinctSlideLabelCount(page)).toBe(5);
});

test('reaching the 10-slide limit hides "Slide hinzufügen", removing one shows it again', async ({ page }) => {
  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Hero-Slider', exact: true }).click();

  const addBtn = page.getByRole('button', { name: 'Slide hinzufügen' });
  for (let i = 0; i < 6; i++) {
    await addBtn.click();
  }
  await expect(page.locator('text=10 / 10')).toBeVisible();
  await expect(addBtn).toHaveCount(0);

  await page.goto('/de');
  expect(await distinctSlideLabelCount(page)).toBe(10);

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Hero-Slider', exact: true }).click();
  await page.locator('button[title="Slide löschen"]').first().click();

  await expect(page.locator('text=9 / 10')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Slide hinzufügen' })).toBeVisible();
});

test('the last remaining hero slide cannot be deleted', async ({ page }) => {
  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Hero-Slider', exact: true }).click();

  const deleteBtn = page.locator('button[title="Slide löschen"]');
  // 4 seeded slides -> delete down to 1
  await deleteBtn.first().click();
  await deleteBtn.first().click();
  await deleteBtn.first().click();

  await expect(page.locator('text=1 / 10')).toBeVisible();
  await expect(deleteBtn).toHaveCount(0);

  await page.goto('/de');
  expect(await distinctSlideLabelCount(page)).toBe(1);
});
