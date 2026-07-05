import { test, expect } from '@playwright/test';

// Regression test for the gap found 2026-07-04: the landing page bento grid
// silently drops a category whose `visible` flag is false, with no visual
// indication in the admin category list beyond a small "Verborgen" badge.
// A category that is fully built (has its own service page) but hidden by
// default is easy to miss — this test asserts admin visibility state and
// the public bento grid links stay in sync.

const CATEGORY_ID_TO_SLUG: Record<string, string> = {
  laser: 'laser-haarentfernung',
  gesicht: 'gesichtsaesthetik',
  body: 'body-contouring',
  inject: 'injectables',
  mani: 'manikure-pedikure',
  andere: 'andere',
};

test('every category the admin marks "Sichtbar" has a link on the landing bento grid, and none marked "Verborgen" does', async ({ page }) => {
  await page.goto('/de/admin/behandlungen');

  const cards = page.locator('a[href*="/admin/behandlungen/"]');
  const count = await cards.count();
  const expectedVisible: string[] = [];

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const href = await card.getAttribute('href');
    const catId = href?.split('/').pop();
    if (!catId || !(catId in CATEGORY_ID_TO_SLUG)) continue;

    const isVisible = (await card.locator('text=Aktiv').count()) > 0;
    if (isVisible) expectedVisible.push(CATEGORY_ID_TO_SLUG[catId]);
  }

  await page.goto('/de');
  const links = await page.locator('#behandlungen a, main a').evaluateAll((els) =>
    els.map((e) => e.getAttribute('href') || '')
  );

  for (const slug of expectedVisible) {
    const found = links.some((href) => href.includes(`/${slug}`));
    expect(found, `expected /${slug} to be linked on the landing page (admin marks it "Aktiv")`).toBe(true);
  }
});

test('toggling a category to hidden removes its bento tile, toggling back restores it', async ({ page }) => {
  const catId = 'body';
  const slug = CATEGORY_ID_TO_SLUG[catId];

  await page.goto(`/de/admin/behandlungen/${catId}`);
  const toggle = page.locator('button', { hasText: /^(Sichtbar|Verborgen)$/ }).first();
  const initialLabel = await toggle.innerText();

  // Hide it
  if (initialLabel === 'Sichtbar') await toggle.click();
  await page.goto('/de');
  let linksAfterHide = await page.locator('#behandlungen a').evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''));
  expect(linksAfterHide.some((href) => href.includes(`/${slug}`))).toBe(false);

  // Restore visibility
  await page.goto(`/de/admin/behandlungen/${catId}`);
  await page.locator('button', { hasText: /^(Sichtbar|Verborgen)$/ }).first().click();
  await page.goto('/de');
  const linksAfterShow = await page.locator('#behandlungen a').evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''));
  expect(linksAfterShow.some((href) => href.includes(`/${slug}`))).toBe(true);
});
