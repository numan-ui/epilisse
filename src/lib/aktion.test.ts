import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INIT_AKTIONEN,
  AKTION_HOME_LIMIT,
  AKTION_CATEGORY_LIMIT,
  INIT_LANDING_CONTENT,
} from '../app/[locale]/admin/behandlungen/data.ts';

const KNOWN_CATEGORIES = ['laser', 'gesicht', 'mani'];

test('INIT_AKTIONEN: both limits are 10', () => {
  assert.equal(AKTION_HOME_LIMIT, 10);
  assert.equal(AKTION_CATEGORY_LIMIT, 10);
});

test('INIT_AKTIONEN: every seed entry has a known category and both booleans', () => {
  assert.ok(INIT_AKTIONEN.length > 0);
  for (const a of INIT_AKTIONEN) {
    assert.ok(KNOWN_CATEGORIES.includes(a.category), `unknown category: ${a.category}`);
    assert.equal(typeof a.activeInCategory, 'boolean');
    assert.equal(typeof a.activeOnHome, 'boolean');
    assert.ok(a.id);
  }
});

test('INIT_AKTIONEN: carries the former promo banner as a home-active Aktion', () => {
  const home = INIT_AKTIONEN.filter((a) => a.activeOnHome);
  assert.ok(home.length >= 1);
  assert.ok(home.every((a) => a.activeInCategory));
});

test('INIT_LANDING_CONTENT: navAktionen default is "Aktionen"', () => {
  assert.equal(INIT_LANDING_CONTENT.navAktionen, 'Aktionen');
});

import {
  countdownLabel,
  validityText,
  deriveAktionen,
  homeAktionen,
  categoryAktionen,
} from './aktion.ts';

const BASE = new Date('2026-09-07T09:00:00');

test('countdownLabel: null without endDate', () => {
  assert.equal(countdownLabel(undefined, BASE), null);
});
test('countdownLabel: null when more than 10 days out', () => {
  assert.equal(countdownLabel('2026-09-30', BASE), null);
});
test('countdownLabel: counts down inside the 10-day window', () => {
  assert.equal(countdownLabel('2026-09-12', BASE), 'Noch 5 Tage');
});
test('countdownLabel: singular on the last full day', () => {
  assert.equal(countdownLabel('2026-09-08', BASE), 'Noch 1 Tag');
});
test('countdownLabel: "Endet heute" on the end day', () => {
  assert.equal(countdownLabel('2026-09-07', BASE), 'Endet heute');
});
test('countdownLabel: "Abgelaufen" once past', () => {
  assert.equal(countdownLabel('2026-09-01', BASE), 'Abgelaufen');
});

test('validityText: range', () => {
  assert.equal(validityText('2026-09-01', '2026-09-30'), 'Gültig 01.09.2026–30.09.2026');
});
test('validityText: end only', () => {
  assert.equal(validityText(undefined, '2026-09-30'), 'Gültig bis 30.09.2026');
});
test('validityText: start only', () => {
  assert.equal(validityText('2026-09-01', undefined), 'Gültig ab 01.09.2026');
});
test('validityText: null with no dates', () => {
  assert.equal(validityText(), null);
});

test('deriveAktionen: passes through an existing aktionen array', () => {
  const arr = [{
    id: 'x', category: 'laser', label: '', title: 'T', desc: '',
    price: '', cta: '', icon: '', image: '', activeInCategory: true, activeOnHome: false,
  }];
  assert.equal(deriveAktionen({ aktionen: arr }), arr);
});
test('deriveAktionen: maps legacy campaigns (active -> activeInCategory, never home)', () => {
  const out = deriveAktionen({
    campaigns: {
      laser: [{ id: 'c1', label: 'L', title: 'T', desc: 'D', price: '10€', cta: 'GO', icon: 'i', image: '', active: true }],
    },
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 'c1');
  assert.equal(out[0].category, 'laser');
  assert.equal(out[0].activeInCategory, true);
  assert.equal(out[0].activeOnHome, false);
});
test('deriveAktionen: maps legacy promo banners to home-active laser Aktionen', () => {
  const out = deriveAktionen({
    promoBanners: [{ id: 'p1', label: 'L', title: 'T', desc: 'D', ctaPrimary: 'GO', ctaSecondary: '', image: '/x.png' }],
  });
  assert.equal(out[0].id, 'p1');
  assert.equal(out[0].category, 'laser');
  assert.equal(out[0].cta, 'GO');
  assert.equal(out[0].activeInCategory, true);
  assert.equal(out[0].activeOnHome, true);
});

const SEL_LIST = [
  { id: '1', category: 'laser', activeInCategory: true, activeOnHome: true },
  { id: '2', category: 'laser', activeInCategory: true, activeOnHome: false },
  { id: '3', category: 'laser', activeInCategory: false, activeOnHome: true },
  { id: '4', category: 'mani', activeInCategory: true, activeOnHome: true },
] as never[];

test('homeAktionen: needs both flags', () => {
  assert.deepEqual(homeAktionen(SEL_LIST).map((a) => a.id), ['1', '4']);
});
test('categoryAktionen: filters by category + activeInCategory', () => {
  assert.deepEqual(categoryAktionen(SEL_LIST, 'laser').map((a) => a.id), ['1', '2']);
});
