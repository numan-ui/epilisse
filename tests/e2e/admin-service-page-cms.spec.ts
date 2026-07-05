import { test, expect } from '@playwright/test';
import { fieldInput } from './helpers';

// admin category id -> public route slug (see admin/behandlungen/data.ts CATEGORIES
// and FRONTEND_SLUG mapping)
const CATEGORY_ID = 'laser';
const PUBLIC_SLUG = 'laser-haarentfernung';

test('editing hero H1 + info paragraph in admin reflects on the public service page', async ({ page }) => {
  const h1Marker = `E2E Laser H1 ${Date.now()}`;
  const paragraphMarker = `E2E info paragraph ${Date.now()}`;

  await page.goto(`/de/admin/behandlungen/${CATEGORY_ID}`);

  // "Seiteninhalt" accordion is collapsed by default
  const accordionToggle = page.getByText('Hero · Info & Vorteile · Kampagnen-Banner');
  await accordionToggle.click();

  await page.getByRole('button', { name: 'Hero', exact: true }).click();
  const h1Input = fieldInput(page, 'H1 (Seitentitel)');
  await h1Input.fill(h1Marker);
  await h1Input.blur();

  await page.getByRole('button', { name: 'Info & Vorteile', exact: true }).click();
  const paragraphInput = fieldInput(page, 'Absatz 1');
  await paragraphInput.fill(paragraphMarker);
  await paragraphInput.blur();

  await page.goto(`/de/${PUBLIC_SLUG}`);
  await expect(page.locator('h1').first()).toHaveText(h1Marker);
  await expect(page.locator('body')).toContainText(paragraphMarker);
});
