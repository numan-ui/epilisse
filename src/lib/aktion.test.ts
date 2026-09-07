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
