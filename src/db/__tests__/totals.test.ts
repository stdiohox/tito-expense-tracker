import { beforeAll, describe, expect, it } from '@jest/globals';

import { makeStressExpenses } from '@/data/stress';
import { STARTER_CATEGORIES } from '@/domain/categories';
import { addMonths } from '@/domain/dates';
import { summarise, summariseGroups, type MonthSummary } from '@/domain/summary';
import { CURRENCY_CODES, type Category, type Expense } from '@/domain/types';

import { openDatabase } from '../open';
import * as repo from '../repo';
import type { SqlDb } from '../sql';

/*
 * The totals on Home, Expenses and Reports come from SQL (repo.monthGroups, repo.monthTotals).
 * summarise() over the expenses in JavaScript is the reference: both must give the same answer,
 * in every one of the twenty currencies.
 */

const MONTH = '2026-11';
// Includes an expense in a category that no longer exists (counted under Other).
const categories: Category[] = STARTER_CATEGORIES.map((c) => ({ ...c }));
let db: SqlDb;
let live: Expense[];

/** otherCurrencies order isn't meaningful; compare it sorted. */
const normal = (s: MonthSummary) => ({ ...s, otherCurrencies: [...s.otherCurrencies].sort((a, b) => a.currency.localeCompare(b.currency)) });

beforeAll(async () => {
  db = await openDatabase('totals.db');
  const all = makeStressExpenses({ count: 3_000, months: 6, lastMonth: MONTH, categoryIds: [...categories.map((c) => c.id), 'gone'] });
  await repo.replaceAllExpenses(db, all);
  // Soft-delete some: they must drop out of every total.
  for (const e of all.slice(0, 200)) await repo.deleteExpense(db, e.id, 9_999);
  live = all.slice(200);
});

describe('totals in SQL match summarise()', () => {
  it.each(CURRENCY_CODES)('month summary in %s, this month and each of the five before', (currency) => {
    for (let i = 0; i < 6; i++) {
      const m = addMonths(MONTH, -i);
      const fromSql = summariseGroups(repo.monthGroups(db, m), categories, m, currency);
      expect(normal(fromSql)).toEqual(normal(summarise(live, categories, m, currency)));
    }
  });

  it.each(CURRENCY_CODES)('month-by-month totals in %s', (currency) => {
    const months = [0, 1, 2, 3, 4, 5, 6].map((i) => addMonths(MONTH, -i));
    expect(repo.monthTotals(db, months, currency)).toEqual(months.map((m) => ({ month: m, total: summarise(live, categories, m, currency).total })));
  });

  it('a category total matches adding up its expenses', () => {
    for (const currency of ['NGN', 'USD', 'JPY'] as const) {
      const expected = live.filter((e) => e.categoryId === 'food' && e.currency === currency && e.day.startsWith(MONTH)).reduce((s, e) => s + e.amount, 0);
      expect(repo.categoryTotal(db, 'food', currency, MONTH)).toBe(expected);
    }
  });

  it('an empty month is all zeros, not missing', () => {
    expect(repo.monthGroups(db, '2020-01')).toEqual([]);
    expect(summariseGroups([], categories, '2020-01', 'NGN')).toEqual(summarise([], categories, '2020-01', 'NGN'));
    expect(repo.monthTotals(db, ['2020-01'], 'NGN')).toEqual([{ month: '2020-01', total: 0 }]);
  });

  it('the month query uses the index on day', async () => {
    const plan = await db.getAllAsync<{ detail: string }>(
      `EXPLAIN QUERY PLAN SELECT currency, category_id, day, SUM(amount), COUNT(*) FROM expenses WHERE deleted_at IS NULL AND day BETWEEN ? AND ? GROUP BY currency, category_id, day`,
      `${MONTH}-00`,
      `${MONTH}-99`,
    );
    expect(plan.map((p) => p.detail).join(' ')).toMatch(/expenses_day/);
  });
});
