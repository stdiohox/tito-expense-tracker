import { beforeEach, describe, expect, it } from '@jest/globals';

import type { Expense } from '@/domain/types';

import { openDatabase } from '../open';
import * as repo from '../repo';
import type { SqlDb } from '../sql';

let db: SqlDb;
let n = 0;
const expense = (over: Partial<Expense> = {}): Expense => {
  n += 1;
  return {
    id: `e${n}`,
    amount: 2_500_00,
    currency: 'NGN',
    categoryId: 'food',
    day: '2026-11-03',
    note: '',
    createdAt: 1_000 + n,
    updatedAt: 1_000 + n,
    ...over,
  };
};
const outbox = () => repo.pendingChanges(db).map((r) => ({ entity: r.entity, id: r.entity_id, op: r.op, base: r.base_version }));

beforeEach(async () => {
  db = await openDatabase(`repo-${Math.random()}.db`);
});

describe('expenses: create, read, update', () => {
  it('stores an expense and reads it back the same', async () => {
    const e = expense({ note: 'Lunch', day: '2026-11-04' });
    await repo.insertExpense(db, e);
    expect(repo.getExpense(db, e.id)).toEqual(e);
    expect(repo.monthExpenses(db, '2026-11')).toEqual([e]);
    expect(repo.countExpenses(db)).toBe(1);
  });

  it('lists a month newest first, one currency when asked', async () => {
    const a = expense({ day: '2026-11-02' });
    const b = expense({ day: '2026-11-09' });
    const c = expense({ day: '2026-11-09', currency: 'USD', amount: 15_00 });
    const old = expense({ day: '2026-10-30' });
    for (const e of [a, b, c, old]) await repo.insertExpense(db, e);
    expect(repo.monthExpenses(db, '2026-11').map((e) => e.id)).toEqual([c.id, b.id, a.id]);
    expect(repo.monthExpenses(db, '2026-11', 'NGN').map((e) => e.id)).toEqual([b.id, a.id]);
    expect(repo.recentExpenses(db, '2026-11', 2).map((e) => e.id)).toEqual([c.id, b.id]);
    expect(repo.firstMonth(db)).toBe('2026-10');
    expect(repo.usedCurrencies(db).sort()).toEqual(['NGN', 'USD']);
  });

  it('saves an edit and bumps the version', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    expect(await repo.updateExpense(db, { ...e, amount: 3_000_00, updatedAt: 9_999 })).toBe(true);
    expect(repo.getExpense(db, e.id)).toMatchObject({ amount: 3_000_00, updatedAt: 9_999 });
    expect(await db.getFirstAsync(`SELECT version FROM expenses WHERE id = ?`, e.id)).toEqual({ version: 2 });
  });

  it('refuses data it should never store', async () => {
    await expect(repo.insertExpense(db, expense({ amount: 0 }))).rejects.toThrow();
    await expect(repo.insertExpense(db, expense({ amount: 12.5 }))).rejects.toThrow();
    await expect(repo.insertExpense(db, expense({ day: '2026-02-31' }))).rejects.toThrow();
    await expect(repo.insertExpense(db, expense({ currency: 'XYZ' as Expense['currency'] }))).rejects.toThrow();
    expect(repo.countExpenses(db)).toBe(0);
  });
});

describe('soft delete and undo', () => {
  it('delete keeps a tombstone and hides the expense everywhere', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    expect(await repo.deleteExpense(db, e.id, 5_000)).toEqual(e);
    expect(repo.getExpense(db, e.id)).toBeUndefined();
    expect(repo.monthExpenses(db, '2026-11')).toEqual([]);
    expect(repo.countExpenses(db)).toBe(0);
    expect(repo.usedCurrencies(db)).toEqual([]);
    expect(await db.getFirstAsync(`SELECT deleted_at, updated_at FROM expenses WHERE id = ?`, e.id)).toEqual({ deleted_at: 5_000, updated_at: 5_000 });
  });

  it('a second delete finds nothing', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    await repo.deleteExpense(db, e.id, 5_000);
    expect(await repo.deleteExpense(db, e.id, 5_001)).toBeUndefined();
  });

  it('an edit after a delete is refused: the delete wins', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    await repo.deleteExpense(db, e.id, 5_000);
    expect(await repo.updateExpense(db, { ...e, amount: 1_00 })).toBe(false);
  });

  it('undo clears deleted_at with an updated_at newer than the delete, even if the clock went back', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    await repo.deleteExpense(db, e.id, 5_000);
    expect(await repo.restoreExpense(db, e.id, 4_000)).toBe(true);
    const row = await db.getFirstAsync<{ deleted_at: number | null; updated_at: number; version: number }>(
      `SELECT deleted_at, updated_at, version FROM expenses WHERE id = ?`,
      e.id,
    );
    expect(row?.deleted_at).toBeNull();
    expect(row?.updated_at).toBeGreaterThan(5_000);
    expect(row?.version).toBe(3);
    expect(repo.getExpense(db, e.id)).toMatchObject({ id: e.id, amount: e.amount });
  });

  it('undo of something not deleted does nothing', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    expect(await repo.restoreExpense(db, e.id, 9_000)).toBe(false);
  });
});

describe('outbox', () => {
  it('writes one row per change, in order, with the version it was based on', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    await repo.updateExpense(db, { ...e, note: 'Fuel', updatedAt: 2_000 });
    await repo.deleteExpense(db, e.id, 3_000);
    await repo.restoreExpense(db, e.id, 4_000);
    expect(outbox()).toEqual([
      { entity: 'expense', id: e.id, op: 'create', base: null },
      { entity: 'expense', id: e.id, op: 'update', base: 1 },
      { entity: 'expense', id: e.id, op: 'delete', base: 2 },
      { entity: 'expense', id: e.id, op: 'restore', base: 3 },
    ]);
    const last = JSON.parse(repo.pendingChanges(db).at(-1)!.payload);
    expect(last).toMatchObject({ id: e.id, note: 'Fuel', deleted_at: null, version: 4 });
  });

  it('a failed write leaves no outbox row', async () => {
    await expect(repo.insertExpense(db, expense({ day: 'nope' as Expense['day'] }))).rejects.toThrow();
    const e = expense();
    await repo.insertExpense(db, e);
    await expect(repo.insertExpense(db, e)).rejects.toThrow(); // same id twice
    expect(outbox()).toHaveLength(1);
  });

  it('a refused edit or a repeated delete adds nothing', async () => {
    const e = expense();
    await repo.insertExpense(db, e);
    await repo.deleteExpense(db, e.id, 3_000);
    await repo.deleteExpense(db, e.id, 3_001);
    await repo.updateExpense(db, { ...e, note: 'late' });
    expect(outbox().map((r) => r.op)).toEqual(['create', 'delete']);
  });
});
