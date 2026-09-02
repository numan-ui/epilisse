import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveTokens } from './derive.ts';
import { GOLD_LUX, ANTIQUE_ROSE } from './presets.ts';
import { contrastRatio, isValidHex } from './color.ts';
import { THEME_FIELDS } from './types.ts';

const EXPECTED_VARS = [
  '--color-primary',
  '--color-on-primary',
  '--color-primary-container',
  '--color-on-primary-container',
  '--color-secondary',
  '--color-secondary-container',
  '--color-tertiary',
  '--color-tertiary-container',
  '--color-surface',
  '--color-background',
  '--color-surface-container',
  '--color-on-surface',
  '--color-on-surface-variant',
  '--color-outline',
  '--color-outline-variant',
  '--hero-panel-top',
  '--hero-panel-bottom',
  '--hero-on-panel',
  '--brand-glow',
];

for (const [name, input] of [
  ['Gold Lux', GOLD_LUX],
  ['Antique Rose', ANTIQUE_ROSE],
] as const) {
  test(`${name}: emits every var the app expects`, () => {
    const { vars } = deriveTokens(input);
    for (const key of EXPECTED_VARS) {
      assert.ok(vars[key], `missing ${key}`);
    }
  });

  test(`${name}: the 8 inputs land unchanged on their primary token`, () => {
    const { vars } = deriveTokens(input);
    assert.equal(vars['--color-primary'].toLowerCase(), input.brand.toLowerCase());
    assert.equal(vars['--color-primary-container'].toLowerCase(), input.brandHover.toLowerCase());
    assert.equal(vars['--color-surface'].toLowerCase(), input.surface.toLowerCase());
    assert.equal(vars['--color-surface-container'].toLowerCase(), input.card.toLowerCase());
    assert.equal(vars['--color-tertiary-container'].toLowerCase(), input.accent.toLowerCase());
  });

  test(`${name}: button label clears AA on the button`, () => {
    const { vars } = deriveTokens(input);
    assert.ok(contrastRatio(vars['--color-on-primary'], vars['--color-primary']) >= 4.5);
  });

  test(`${name}: body text clears AA on the page`, () => {
    const { vars } = deriveTokens(input);
    assert.ok(contrastRatio(vars['--color-on-surface'], vars['--color-surface']) >= 4.5);
    assert.ok(contrastRatio(vars['--color-on-surface-variant'], vars['--color-surface']) >= 4.4);
  });

  test(`${name}: text on cards clears AA`, () => {
    const { vars } = deriveTokens(input);
    assert.ok(
      contrastRatio(vars['--color-on-surface'], vars['--color-surface-container']) >= 4.4,
    );
  });

  test(`${name}: every colour var is a valid hex or rgba string`, () => {
    const { vars } = deriveTokens(input);
    for (const [k, val] of Object.entries(vars)) {
      const ok = isValidHex(val) || /^rgba\(/.test(val);
      assert.ok(ok, `${k} = ${val}`);
    }
  });
}

test('a mid-grey body text on white gets darkened, with a note', () => {
  const { vars, notes } = deriveTokens({ ...GOLD_LUX, surface: '#FFFFFF', text: '#8A8A8A' });
  assert.ok(contrastRatio(vars['--color-on-surface'], '#FFFFFF') >= 4.5);
  assert.ok(notes.some((n) => n.includes('metin')));
});

test('a pale-pink button label on a pale-pink button gets fixed, with a note', () => {
  const { vars, notes } = deriveTokens({
    ...ANTIQUE_ROSE,
    brand: '#F0C4CB',
    onBrand: '#FFFFFF',
  });
  assert.ok(contrastRatio(vars['--color-on-primary'], vars['--color-primary']) >= 4.5);
  assert.ok(notes.some((n) => n.includes('Buton yazı')));
});

test('light hero panel → dark hero text; dark hero panel → white hero text', () => {
  const light = deriveTokens({ ...ANTIQUE_ROSE, heroPanel: '#FDF7F2' });
  assert.ok(contrastRatio(light.vars['--hero-on-panel'], '#FDF7F2') >= 6);

  const dark = deriveTokens({ ...GOLD_LUX, heroPanel: '#1A1712' });
  assert.equal(dark.vars['--hero-on-panel'], '#ffffff');
});

test('presets themselves produce no correction notes', () => {
  assert.deepEqual(deriveTokens(GOLD_LUX).notes, []);
  assert.deepEqual(deriveTokens(ANTIQUE_ROSE).notes, []);
});

test('THEME_FIELDS is the 8 documented keys', () => {
  assert.equal(THEME_FIELDS.length, 8);
});
