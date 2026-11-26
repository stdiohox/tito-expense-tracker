import { beforeEach, describe, expect, it } from '@jest/globals';

import { STARTER_CATEGORIES } from '@/domain/categories';

import { openDatabase } from '../open';
import * as profile from '../profile';
import * as repo from '../repo';
import type { SqlDb } from '../sql';

let db: SqlDb;
beforeEach(async () => {
  db = await openDatabase(`profile-${Math.random()}.db`);
});

describe('categories', () => {
  it('writes the starter set once, in order', async () => {
    await profile.seedCategories(db, STARTER_CATEGORIES, 1);
    await profile.seedCategories(db, STARTER_CATEGORIES, 2);
    expect(profile.loadCategories(db)).toEqual(STARTER_CATEGORIES);
  });

  it('keeps budgets, their currency, hidden and new categories, in order', async () => {
    await profile.seedCategories(db, STARTER_CATEGORIES, 1);
    const food = STARTER_CATEGORIES.find((c) => c.id === 'food')!;
    await profile.saveCategory(db, { ...food, budget: 90_000_00, budgetCurrency: 'NGN' }, 2);
    await profile.saveCategory(db, { ...STARTER_CATEGORIES[0], hidden: true }, 3);
    await profile.saveCategory(db, { id: 'c1', name: 'Gym', icon: 'health', budget: 50_00, budgetCurrency: 'USD', builtIn: false }, 4);
    const loaded = profile.loadCategories(db);
    expect(loaded.find((c) => c.id === 'food')).toEqual({ ...food, budget: 90_000_00, budgetCurrency: 'NGN' });
    expect(loaded[0]).toEqual({ ...STARTER_CATEGORIES[0], hidden: true });
    expect(loaded.at(-1)).toEqual({ id: 'c1', name: 'Gym', icon: 'health', budget: 50_00, budgetCurrency: 'USD', builtIn: false });
  });

  it('removing a budget clears its currency too', async () => {
    await profile.saveCategory(db, { id: 'c1', name: 'Gym', icon: 'health', budget: 50_00, budgetCurrency: 'USD', builtIn: false }, 1);
    await profile.saveCategory(db, { id: 'c1', name: 'Gym', icon: 'health', budget: null, budgetCurrency: 'USD', builtIn: false }, 2);
    expect(profile.loadCategories(db)).toEqual([{ id: 'c1', name: 'Gym', icon: 'health', budget: null, builtIn: false }]);
  });

  it('each save writes an outbox row (create, then update with the version it was based on)', async () => {
    await profile.saveCategory(db, { id: 'c1', name: 'Gym', icon: 'health', budget: null, builtIn: false }, 1);
    await profile.saveCategory(db, { id: 'c1', name: 'Gym & sport', icon: 'health', budget: null, builtIn: false }, 2);
    expect(repo.pendingChanges(db).map((r) => [r.entity, r.entity_id, r.op, r.base_version])).toEqual([
      ['category', 'c1', 'create', null],
      ['category', 'c1', 'update', 1],
    ]);
  });
});

describe('settings', () => {
  it('saves and reads back any JSON value', async () => {
    await profile.saveSettings(db, { currency: 'GHS', secondCurrency: null, reminderOn: false, firstName: 'Ada' }, 1, true);
    await profile.saveSettings(db, { currency: 'KES' }, 2, true);
    expect(profile.loadSettings(db)).toEqual({ currency: 'KES', secondCurrency: null, reminderOn: false, firstName: 'Ada' });
  });

  it('preferences go to the outbox; device-only state does not', async () => {
    await profile.saveSettings(db, { appearance: 'dark' }, 1, true);
    await profile.saveSettings(db, { signedIn: true, setupStep: 1 }, 2, false);
    expect(repo.pendingChanges(db).map((r) => [r.entity, r.entity_id])).toEqual([['setting', 'appearance']]);
  });

  it('skips a damaged value instead of failing', async () => {
    await db.runAsync(`INSERT INTO settings (id, value, created_at, updated_at) VALUES ('currency', '{not json', 1, 1)`);
    expect(profile.loadSettings(db)).toEqual({});
  });
});

describe('account deletion', () => {
  it('wipes every table', async () => {
    await profile.seedCategories(db, STARTER_CATEGORIES, 1);
    await profile.saveSettings(db, { firstName: 'Ada', signedIn: true }, 1, true);
    await repo.insertExpense(db, { id: 'e1', amount: 100, currency: 'NGN', categoryId: 'food', day: '2026-11-01', note: '', createdAt: 1, updatedAt: 1 });
    await repo.wipeAll(db);
    for (const table of ['expenses', 'categories', 'settings', 'outbox']) {
      expect(await db.getFirstAsync(`SELECT COUNT(*) AS n FROM ${table}`)).toEqual({ n: 0 });
    }
  });
});
