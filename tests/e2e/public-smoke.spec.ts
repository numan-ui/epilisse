import { test, expect } from '@playwright/test';

const SERVICE_PAGES = [
  'laser-haarentfernung',
  'gesichtsaesthetik',
  'body-contouring',
  'injectables',
  'manikure-pedikure',
];

test.describe('Landing page', () => {
  test('loads with hero, nav sections and footer', async ({ page }) => {
    const res = await page.goto('/de');
    expect(res?.ok()).toBeTruthy();

    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('#behandlungen')).toBeAttached();
    await expect(page.locator('#preise')).toBeAttached();
    await expect(page.locator('#uber-uns')).toBeAttached();
    await expect(page.locator('#kontakt')).toBeAttached();
    await expect(page.locator('address').first()).toBeVisible();
  });

  test('hero slider advances when a slide dot is clicked', async ({ page }) => {
    await page.goto('/de');
    // All slides stay mounted (only `opacity` toggles), so scope to the
    // currently-active slide container rather than `h1.first()`.
    const activeSlideHeadline = () => page.locator('section.relative.h-\\[921px\\] > div.opacity-100 h1');

    const firstHeadline = await activeSlideHeadline().innerText();

    // "Slide N" aria-label is shared by the top progress-bar button (always
    // visible) and a mobile-only dot (`md:hidden`) — target the former.
    const slide2 = page.getByLabel('Slide 2', { exact: true }).first();
    await slide2.click();
    await expect(activeSlideHeadline()).not.toHaveText(firstHeadline);
  });

  test('language switch DE -> EN changes locale', async ({ page }) => {
    await page.goto('/de');
    await page.getByRole('link', { name: 'EN', exact: true }).first().click();
    await expect(page).toHaveURL(/\/en(\/|$)/);
  });
});

test.describe('Service pages', () => {
  for (const slug of SERVICE_PAGES) {
    test(`${slug} loads with hero + footer`, async ({ page }) => {
      const res = await page.goto(`/de/${slug}`);
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });
  }
});
