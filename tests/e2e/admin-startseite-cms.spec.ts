import { test, expect } from '@playwright/test';
import { fieldInput } from './helpers';

// The Startseite CMS writes to localStorage; the same browser context must be
// reused between the admin edit and the public-page read (matches the
// round-trip verification pattern used during manual QA of this feature).

test('Hero-Slider edit reflects on the landing page hero', async ({ page }) => {
  const marker = `E2E Headline ${Date.now()}`;

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Hero-Slider', exact: true }).click();

  const headlineInput = fieldInput(page, 'Headline').first();
  await headlineInput.fill(marker);
  await headlineInput.blur();

  await page.goto('/de');
  await expect(page.locator('h1').first()).toHaveText(marker);
});

test('Footer copyright edit reflects on the public footer', async ({ page }) => {
  const marker = `© E2E Copyright ${Date.now()}`;

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Footer', exact: true }).click();

  const copyrightInput = fieldInput(page, 'Copyright-Zeile');
  await copyrightInput.fill(marker);
  await copyrightInput.blur();

  await page.goto('/de');
  await expect(page.locator('footer')).toContainText(marker);
});

test('Kontakt-Texte address edit reflects on the contact section', async ({ page }) => {
  const marker = `E2E Musterweg ${Date.now()}, 80331 München`;

  await page.goto('/de/admin/startseite');
  await page.getByRole('button', { name: 'Kontakt-Texte', exact: true }).click();

  const addressInput = fieldInput(page, 'Adresse');
  await addressInput.fill(marker);
  await addressInput.blur();

  await page.goto('/de');
  await expect(page.locator('address').first()).toHaveText(marker);
});
