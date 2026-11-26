import { useMemo } from 'react';

import * as repo from '@/db/repo';
import type { SqlDb } from '@/db/sql';
import { addMonths } from '@/domain/dates';
import type { CurrencyCode, Expense, MonthKey } from '@/domain/types';

import { useDb } from './store';

/*
 * Read hooks over the expenses in SQLite. Each re-queries when the data changes (after any write)
 * or when its arguments change, and otherwise returns the same object, so memoised children don't
 * redraw. Screens use these instead of an expenses array.
 */

/**
 * Runs `read` against the database, and again only when the data version or one of the keys
 * changes. The keys must be every value `read` uses (up to three).
 */
export function useQuery<T>(read: (db: SqlDb) => T, a?: unknown, b?: unknown, c?: unknown): T {
  const { db, version } = useDb();
  // The version and the keys are the cache key; `read` itself is a new closure each render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => read(db), [db, version, a, b, c]);
}

/** A month's expenses in one currency, newest first (Expenses tab). */
export function useMonthExpenses(month: MonthKey, currency: CurrencyCode): Expense[] {
  return useQuery((db) => repo.monthExpenses(db, month, currency), month, currency);
}

/** The latest few expenses of a month, any currency (Home → Latest). */
export function useRecentExpenses(month: MonthKey, limit: number): Expense[] {
  return useQuery((db) => repo.recentExpenses(db, month, limit), month, limit);
}

/** One expense, or undefined when it doesn't exist (or was deleted). */
export function useExpense(id: string | undefined): Expense | undefined {
  return useQuery((db) => (id ? repo.getExpense(db, id) : undefined), id);
}

/** How many expenses there are, in every currency and month. */
export function useExpenseCount(): number {
  return useQuery(repo.countExpenses);
}

/** Every currency that has expenses. */
export function useUsedCurrencies(): CurrencyCode[] {
  return useQuery(repo.usedCurrencies);
}

/** The month of the first expense, or null when there are none. */
export function useFirstMonth(): MonthKey | null {
  return useQuery(repo.firstMonth);
}

/** A category's expenses in a month and its total the month before, in one currency (category detail). */
export function useCategoryMonth(
  categoryId: string,
  currency: CurrencyCode,
  month: MonthKey,
): { items: Expense[]; total: number; lastTotal: number } {
  return useQuery((db) => {
    // The rows are on screen anyway; last month only needs its total, added up in SQL.
    const items = repo.categoryExpenses(db, categoryId, currency, month);
    return {
      items,
      total: items.reduce((s, e) => s + e.amount, 0),
      lastTotal: repo.categoryTotal(db, categoryId, currency, addMonths(month, -1)),
    };
  }, categoryId, currency, month);
}
