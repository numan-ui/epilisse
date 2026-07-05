import { test, expect } from '@playwright/test';

// /api/book needs live Supabase credentials to actually write to the DB
// (not yet configured — see project memory). Stub it here so the UI flow
// (category -> services -> contact form -> success) can be verified without
// a real backend; the route contract itself (request/response shape) is
// exercised separately once credentials exist.
async function stubBookingApi(page: import('@playwright/test').Page) {
  await page.route('**/api/book', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ customerId: 'stub-customer-id', appointments: [] }),
    });
  });
}

test.describe('Booking modal — opened from a service page', () => {
  test('preselects the category and skips the category picker', async ({ page }) => {
    await stubBookingApi(page);
    await page.goto('/de/laser-haarentfernung');

    await page.getByRole('button', { name: 'Termin Buchen' }).first().click();

    // Category step is skipped — goes straight to services for "Laser-Haarentfernung"
    await expect(page.getByText('Laser-Haarentfernung — wählen Sie ein oder mehrere Services')).toBeVisible();
    await expect(page.getByText('Wählen Sie eine Kategorie')).not.toBeVisible();
  });

  test('selecting multiple services from the same category, then booking, succeeds', async ({ page }) => {
    await stubBookingApi(page);
    await page.goto('/de/laser-haarentfernung');
    await page.getByRole('button', { name: 'Termin Buchen' }).first().click();

    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await expect(page.getByRole('button', { name: 'Weiter (2 ausgewählt)' })).toBeEnabled();

    await page.getByRole('button', { name: /Weiter/ }).click();

    await page.getByLabel('Name *').or(page.locator('input[type="text"]')).first().fill('E2E Test Kundin');
    await page.locator('input[type="email"]').fill('e2e-booking@example.com');
    await page.locator('input[type="tel"]').fill('+49 176 00000000');

    await page.getByRole('button', { name: 'Termin anfragen' }).click();

    await expect(page.getByText('Anfrage erhalten!')).toBeVisible();
    await expect(page.getByText('E2E Test Kundin', { exact: false })).toBeVisible();
  });

  test('switching category resets the previously selected services', async ({ page }) => {
    await stubBookingApi(page);
    await page.goto('/de');
    // Generic homepage CTA has no preselected category — starts on the category grid.
    await page.getByRole('button', { name: 'Termin Buchen' }).first().click();
    await expect(page.getByText('Wählen Sie eine Kategorie')).toBeVisible();

    await page.getByRole('button', { name: 'auto_awesome Laser-Haarentfernung' }).click();
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await expect(page.getByRole('button', { name: 'Weiter (2 ausgewählt)' })).toBeVisible();

    await page.getByRole('button', { name: 'Zurück' }).click();
    await page.getByRole('button', { name: 'face Gesichtsästhetik' }).click();

    await expect(page.getByRole('button', { name: 'Weiter (0 ausgewählt)' })).toBeVisible();
  });

  test('cannot proceed without selecting a service', async ({ page }) => {
    await stubBookingApi(page);
    await page.goto('/de/laser-haarentfernung');
    await page.getByRole('button', { name: 'Termin Buchen' }).first().click();

    await expect(page.getByRole('button', { name: 'Weiter (0 ausgewählt)' })).toBeDisabled();
  });

  test('shows a validation error when contact fields are missing', async ({ page }) => {
    await stubBookingApi(page);
    await page.goto('/de/laser-haarentfernung');
    await page.getByRole('button', { name: 'Termin Buchen' }).first().click();

    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: /Weiter/ }).click();
    await page.getByRole('button', { name: 'Termin anfragen' }).click();

    await expect(page.getByText('Bitte Name, E-Mail und Telefon angeben.')).toBeVisible();
  });
});

test.describe('Booking modal — opened from the homepage', () => {
  test('generic CTA opens the category picker first', async ({ page }) => {
    await stubBookingApi(page);
    await page.goto('/de');
    await page.getByRole('button', { name: 'Termin Buchen' }).first().click();

    await expect(page.getByText('Wählen Sie eine Kategorie')).toBeVisible();
  });
});
