import { test, expect } from '@playwright/test';

const FIELDS = [
  'brand',
  'onBrand',
  'brandHover',
  'surface',
  'card',
  'text',
  'accent',
  'heroPanel',
];

test.describe('theme', () => {
  test('GET /api/theme returns the eight brand colours as hex', async ({ request }) => {
    const res = await request.get('/api/theme');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    for (const f of FIELDS) {
      expect(body[f], f).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test('PUT /api/theme is rejected without an admin session', async ({ request }) => {
    const res = await request.put('/api/theme', {
      data: {
        brand: '#A34E5B',
        onBrand: '#FFFFFF',
        brandHover: '#C87D87',
        surface: '#FDF6F1',
        card: '#F7E9E2',
        text: '#241A1C',
        accent: '#6B7556',
        heroPanel: '#FDF7F2',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('the default site injects no theme override', async ({ page }) => {
    await page.goto('/de');
    // While the saved theme equals Gold Lux the layout must not emit the block.
    await expect(page.locator('style#theme-vars')).toHaveCount(0);
  });
});
