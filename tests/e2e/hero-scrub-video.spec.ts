import { test, expect } from '@playwright/test';

// The first hero slide carries a contained portrait reveal on its right — a
// pre-extracted WebP frame sequence painted to <canvas>, indexed by scroll
// position: the figure comes to life as you scroll and rewinds as you scroll
// back, with the hero pinned briefly so the reveal has room. Desktop only;
// phones get nothing, reduced-motion gets the poster still.
//
// Desktop Chrome (1280x720) satisfies the >= lg gate. Scrolling is Lenis-
// smoothed site-wide, so the assertions poll for the frame index to settle
// rather than reading it immediately after a scrollTo.

const CARD = '[data-testid="hero-scrub-video"]';
const CANVAS = '[data-testid="hero-scrub-canvas"]';

const frame = (page: import('@playwright/test').Page) =>
  page
    .locator(CANVAS)
    .evaluate((c: HTMLCanvasElement) => Number(c.dataset.frame ?? 'NaN'));

async function waitForFirstFrame(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const c = document.querySelector(
      '[data-testid="hero-scrub-canvas"]',
    ) as HTMLCanvasElement | null;
    return !!c && c.dataset.frame != null;
  });
}

test.describe('hero scrub — desktop', () => {
  test('renders the reveal canvas on the first slide', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator(CARD)).toBeVisible();
    await expect(page.locator(CANVAS)).toBeVisible();
    await waitForFirstFrame(page);
    expect(await frame(page)).toBe(0);
  });

  test('scrolling drives the frame forward, scrolling back rewinds it', async ({
    page,
  }) => {
    await page.goto('/de');
    await waitForFirstFrame(page);
    expect(await frame(page)).toBe(0);

    await page.evaluate(() => window.scrollTo(0, 6000));
    await expect.poll(() => frame(page), { timeout: 5000 }).toBeGreaterThan(20);
    const forward = await frame(page);

    await page.evaluate(() => window.scrollTo(0, 500));
    await expect
      .poll(() => frame(page), { timeout: 5000 })
      .toBeLessThan(forward - 5);
  });

  test('the left copy advances through beats as the reveal scrubs', async ({
    page,
  }) => {
    await page.goto('/de');
    await waitForFirstFrame(page);

    await expect(page.locator(CARD)).toContainText('reinsten Form');

    await page.evaluate(() => window.scrollTo(0, 9000));
    await expect(page.locator(CARD)).toContainText(/erwacht|erweckt|Entfalte/i, {
      timeout: 5000,
    });
  });
});

test.describe('hero scrub — reduced motion', () => {
  test('shows the poster still and never scrubs', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/de');

    await expect(page.locator(CARD)).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 6000));
    await page.waitForTimeout(1200);
    // draw() is never wired under reduced motion → no frame index is ever set.
    expect(await frame(page)).toBeNaN();
  });
});

test.describe('hero scrub — not on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('reveal is hidden on a phone viewport, story slider still renders', async ({
    page,
  }) => {
    await page.goto('/de');
    const card = page.locator(CARD);
    await expect(card).toBeAttached(); // in the DOM…
    await expect(card).toBeHidden(); // …but display:none below lg
    await expect(page.locator('[aria-label="Slide 1"]').first()).toBeVisible();
  });
});
