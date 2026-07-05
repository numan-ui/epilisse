import { Locator, Page } from '@playwright/test';

/**
 * Admin forms use a `Field` component: a `<label>` immediately followed by
 * its input/textarea as the next DOM sibling, with no `htmlFor`/`id` link.
 * This locates the control by its label text. When a label repeats (e.g.
 * multiple "Titel" fields across repeated cards), scope `within` to the
 * containing card/section first.
 */
export function fieldInput(scope: Page | Locator, label: string): Locator {
  return scope
    .locator(`label:text-is("${label}")`)
    .locator('xpath=following-sibling::*[1]')
    .locator('xpath=self::input | self::textarea | .//input | .//textarea')
    .first();
}
