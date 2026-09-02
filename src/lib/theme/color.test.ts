import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseHex,
  toHex,
  isValidHex,
  luminance,
  contrastRatio,
  rgbToHsl,
  hslToRgb,
  adjustL,
  withSL,
  mix,
  rgba,
  ensureContrast,
  readableOn,
} from './color.ts';

test('parseHex handles #rgb and #rrggbb', () => {
  assert.deepEqual(parseHex('#fff'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(parseHex('C87D87'), { r: 200, g: 125, b: 135 });
});

test('parseHex rejects garbage', () => {
  assert.throws(() => parseHex('#12'));
  assert.throws(() => parseHex('nope'));
});

test('isValidHex is a type guard for real hex strings', () => {
  assert.equal(isValidHex('#A34E5B'), true);
  assert.equal(isValidHex('red'), false);
  assert.equal(isValidHex(123), false);
  assert.equal(isValidHex(undefined), false);
});

test('toHex clamps and round-trips', () => {
  assert.equal(toHex({ r: 300, g: -5, b: 128 }), '#ff0080');
  assert.equal(toHex(parseHex('#745b00')), '#745b00');
});

test('luminance ordering: black < mid < white', () => {
  assert.ok(luminance('#000000') < luminance('#777777'));
  assert.ok(luminance('#777777') < luminance('#ffffff'));
});

test('contrastRatio matches known WCAG anchors', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 0.01);
  assert.ok(Math.abs(contrastRatio('#777777', '#777777') - 1) < 0.01);
  assert.equal(contrastRatio('#ffffff', '#000000'), contrastRatio('#000000', '#ffffff'));
});

test('hsl round-trips within rounding tolerance', () => {
  for (const hex of ['#745b00', '#c87d87', '#6b7556', '#fdf6f1', '#241a1c']) {
    const back = toHex(hslToRgb(rgbToHsl(parseHex(hex))));
    const a = parseHex(hex);
    const b = parseHex(back);
    assert.ok(Math.abs(a.r - b.r) <= 2 && Math.abs(a.g - b.g) <= 2 && Math.abs(a.b - b.b) <= 2, `${hex} -> ${back}`);
  }
});

test('adjustL moves lightness in the requested direction', () => {
  assert.ok(luminance(adjustL('#808080', 0.2)) > luminance('#808080'));
  assert.ok(luminance(adjustL('#808080', -0.2)) < luminance('#808080'));
});

test('withSL keeps hue, forces lightness', () => {
  const out = withSL('#c87d87', 0.4, 0.9);
  assert.ok(luminance(out) > 0.7);
  assert.ok(Math.abs(rgbToHsl(parseHex(out)).h - rgbToHsl(parseHex('#c87d87')).h) < 2);
});

test('mix endpoints and midpoint', () => {
  assert.equal(mix('#000000', '#ffffff', 0), '#000000');
  assert.equal(mix('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
});

test('rgba emits a css rgba() string', () => {
  assert.equal(rgba('#c87d87', 0.5), 'rgba(200, 125, 135, 0.5)');
});

test('ensureContrast leaves already-passing colours alone', () => {
  assert.equal(ensureContrast('#000000', '#ffffff', 4.5), '#000000');
});

test('ensureContrast darkens light text on a light background until AA passes', () => {
  const bg = '#fdf6f1';
  const fixed = ensureContrast('#f0c4cb', bg, 4.5);
  assert.ok(contrastRatio(fixed, bg) >= 4.5, `ratio was ${contrastRatio(fixed, bg)}`);
  assert.ok(luminance(fixed) < luminance('#f0c4cb'));
});

test('ensureContrast lightens dark text on a dark background', () => {
  const bg = '#1a1712';
  const fixed = ensureContrast('#3a3226', bg, 4.5);
  assert.ok(contrastRatio(fixed, bg) >= 4.5);
  assert.ok(luminance(fixed) > luminance('#3a3226'));
});

test('readableOn picks the higher-contrast option', () => {
  assert.equal(readableOn('#fdf6f1'), '#1b1b1b');
  assert.equal(readableOn('#1a1712'), '#ffffff');
});
