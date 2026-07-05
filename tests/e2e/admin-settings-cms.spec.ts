import { test, expect } from '@playwright/test';
import { fieldInput } from './helpers';

test('booking CTA on a service page opens the in-house booking modal, not the Kalender-URL setting', async ({ page }) => {
  // Kalender-URL is a legacy admin field, no longer wired to the CTA since the
  // booking modal (category -> service(s) -> contact form) replaced the
  // Google Calendar link — see project_booking_flow_gap memory.
  await page.goto('/de/laser-haarentfernung');
  await page.getByRole('button', { name: 'Termin Buchen' }).first().click();
  await expect(page.getByText('Laser-Haarentfernung — wählen Sie ein oder mehrere Services')).toBeVisible();
});

test('phone edit reflects on landing contact section and service page footer', async ({ page }) => {
  const phone = `+49 89 ${Date.now().toString().slice(-6)}`;

  await page.goto('/de/admin/einstellungen');
  // "Studio-Informationen" is the default active section
  const phoneInput = fieldInput(page, 'Telefon');
  await phoneInput.fill(phone);
  await phoneInput.blur();

  await page.goto('/de');
  const phoneHref = phone.replace(/\s/g, '');
  await expect(page.locator(`a[href="tel:${phoneHref}"]`).first()).toBeVisible();

  await page.goto('/de/laser-haarentfernung');
  await expect(page.locator('footer')).toContainText(phone);
});
