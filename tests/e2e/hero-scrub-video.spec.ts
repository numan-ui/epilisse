import { test, expect } from '@playwright/test';

// The first hero slide carries a contained portrait video card on its right.
// Scroll position drives the playhead — the figure comes to life as you scroll
// and rewinds as you scroll back — with the hero pinned briefly so the reveal
// has room. Desktop only; phones get nothing, reduced-motion gets a still.
//
// Desktop Chrome (1280x720) satisfies the >= lg gate.

const CARD = '[data-testid="hero-scrub-video"]';
const VIDEO = '[data-testid="hero-scrub-video-el"]';
const SOUND = '[data-testid="hero-scrub-video-sound"]';

const currentTime = (page: import('@playwright/test').Page) =>
  page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.currentTime);

async function waitForMetadata(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const v = document.querySelector(
      '[data-testid="hero-scrub-video-el"]',
    ) as HTMLVideoElement | null;
    return !!v && v.readyState >= 1 && v.duration > 0;
  });
}

test.describe('hero scrub video — desktop', () => {
  test('renders a muted card on the first slide', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator(CARD)).toBeVisible();
    expect(
      await page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.muted),
    ).toBe(true);
  });

  test('scrolling drives the playhead forward, scrolling back rewinds it', async ({
    page,
  }) => {
    await page.goto('/de');
    await waitForMetadata(page);

    const start = await currentTime(page);

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(1800); // scrub catch-up
    const forward = await currentTime(page);
    expect(forward).toBeGreaterThan(start + 0.2);

    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(1800);
    const back = await currentTime(page);
    expect(back).toBeLessThan(forward);
  });

  test('the left copy advances through beats as the video scrubs', async ({
    page,
  }) => {
    await page.goto('/de');
    await waitForMetadata(page);

    await expect(page.locator(CARD)).toContainText('reinsten Form');

    await page.evaluate(() => window.scrollTo(0, 1900));
    await page.waitForTimeout(1600);
    await expect(page.locator(CARD)).toContainText(/erwacht|erweckt|Entfalte/i);
  });

  test('the sound toggle unmutes the video', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator(SOUND)).toBeVisible();
    await page.locator(SOUND).click();
    expect(
      await page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.muted),
    ).toBe(false);
  });
});

test.describe('hero scrub video — reduced motion', () => {
  test('card shows a still, never scrubs, offers no sound control', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/de');

    await expect(page.locator(CARD)).toBeVisible();
    await expect(page.locator(SOUND)).toHaveCount(0);

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(1500);
    expect(await currentTime(page)).toBe(0);
  });
});

test.describe('hero scrub video — not on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('video is hidden on a phone viewport, story slider still renders', async ({
    page,
  }) => {
    await page.goto('/de');
    const card = page.locator(CARD);
    await expect(card).toBeAttached(); // in the DOM…
    await expect(card).toBeHidden(); // …but display:none below lg
    await expect(page.locator('[aria-label="Slide 1"]').first()).toBeVisible();
  });
});
