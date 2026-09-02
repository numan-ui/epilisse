import { test } from 'node:test';
import assert from 'node:assert/strict';
import { themeVarsToCss } from './css.ts';
import { deriveTokens } from './derive.ts';
import { ANTIQUE_ROSE } from './presets.ts';

test('wraps vars in an html:root rule', () => {
  const css = themeVarsToCss({ '--color-primary': '#a34e5b' });
  assert.equal(css, 'html:root{--color-primary:#a34e5b}');
});

test('passes through hex and rgba values', () => {
  const css = themeVarsToCss({
    '--a': '#fff',
    '--b': '#A34E5B',
    '--c': 'rgba(255, 255, 255, 0.8)',
    '--d': 'rgb(1,2,3)',
  });
  assert.ok(css.includes('--a:#fff'));
  assert.ok(css.includes('--c:rgba(255, 255, 255, 0.8)'));
  assert.ok(css.includes('--d:rgb(1,2,3)'));
});

test('drops entries that could break out of the declaration', () => {
  const css = themeVarsToCss({
    '--evil': 'red;}html{display:none}',
    '--evil2': 'url(javascript:alert(1))',
    '--evil-name}': '#fff',
    '--ok': '#123456',
  });
  assert.equal(css, 'html:root{--ok:#123456}');
});

test('a full derived Antique Rose map is entirely serialisable', () => {
  const { vars } = deriveTokens(ANTIQUE_ROSE);
  const css = themeVarsToCss(vars);
  // every key made it through the whitelist
  for (const key of Object.keys(vars)) assert.ok(css.includes(`${key}:`), key);
  assert.ok(!css.includes('}html'), 'no injection');
});
