import path from 'path';
import { test, expect } from '@playwright/test';

// Covers a gap noted after the initial E2E pass: category tile image upload
// (admin/behandlungen/[categoryId] "Kategorie-Bild") was never exercised.
// The upload is a client-side FileReader -> base64 data URL stored in
// localStorage (no real backend), so we assert the resulting <img> src is a
// data: URI both in the admin preview and on the public landing bento tile.
//
// The category-image upload is scoped to the "KATEGORIE-BILD" section
// specifically: the laser category also has a preset campaign with its own
// image-upload control earlier in the DOM, so a bare `input[type=file]`
// or `img` first-match would silently hit the wrong upload.

const FIXTURE = path.join(__dirname, 'fixtures', 'test-image.png');

test('uploading a category image replaces the admin preview and the public bento tile image', async ({ page }) => {
  await page.goto('/de/admin/behandlungen/laser');

  const section = page.locator('section', { has: page.getByText('KATEGORIE-BILD') });
  await section.locator('input[type="file"]').setInputFiles(FIXTURE);

  const adminPreview = section.locator('img');
  await expect(adminPreview).toHaveAttribute('src', /^data:image\//);

  await page.goto('/de');
  const bentoImg = page.locator('a[href$="/laser-haarentfernung"] img');
  await expect(bentoImg).toHaveAttribute('src', /^data:image\//);
});

test('removing a category image falls back to the default stock photo on the landing page', async ({ page }) => {
  await page.goto('/de/admin/behandlungen/laser');

  const section = page.locator('section', { has: page.getByText('KATEGORIE-BILD') });
  await section.locator('input[type="file"]').setInputFiles(FIXTURE);

  const adminPreview = section.locator('img');
  await expect(adminPreview).toHaveAttribute('src', /^data:image\//);

  // The "Entfernen" control sits in an always-present but opacity-0 overlay
  // that only becomes visible on hover; it intercepts real hover/click
  // targeting on the image underneath, so force the click directly instead.
  await section.getByText('Entfernen', { exact: true }).click({ force: true });

  await page.goto('/de');
  const bentoImg = page.locator('a[href$="/laser-haarentfernung"] img');
  await expect(bentoImg).toHaveAttribute('src', /^https:\/\/lh3\.googleusercontent\.com\//);
});
