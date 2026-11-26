import * as repo from '@/db/repo';
import { addMonths } from '@/domain/dates';
import { summarise, type MonthSummary } from '@/domain/summary';
import type { CurrencyCode, MonthKey } from '@/domain/types';

import { useQuery } from './expenses';
import { useStore } from './store';

/** This month and last month in one currency (the main one unless given). Never converts. */
export function useSummary(month: MonthKey, currency?: CurrencyCode): { now: MonthSummary; before: MonthSummary } {
  const { categories, settings } = useStore();
  const cur = currency ?? settings.currency;
  return useQuery(
    (db) => ({
      now: summarise(repo.monthExpenses(db, month), categories, month, cur),
      before: summarise(repo.monthExpenses(db, addMonths(month, -1)), categories, addMonths(month, -1), cur),
    }),
    categories,
    month,
    cur,
  );
}

/** A month summary for each currency asked for (Home's currency cards and budgets). Never converts. */
export function useMonthSummaries(month: MonthKey, codes: readonly CurrencyCode[]): Map<CurrencyCode, MonthSummary> {
  const { categories } = useStore();
  const key = codes.join(',');
  return useQuery(
    (db) => {
      const rows = repo.monthExpenses(db, month);
      return new Map(key ? key.split(',').map((code) => [code as CurrencyCode, summarise(rows, categories, month, code as CurrencyCode)]) : []);
    },
    categories,
    month,
    key,
  );
}

/** Each month's total in one currency (Reports → Month by month). */
export function useMonthTotals(months: readonly MonthKey[], currency: CurrencyCode): { month: MonthKey; total: number }[] {
  const { categories } = useStore();
  const key = months.join(',');
  return useQuery(
    (db) =>
      (key ? (key.split(',') as MonthKey[]) : []).map((m) => ({
        month: m,
        total: summarise(repo.monthExpenses(db, m, currency), categories, m, currency).total,
      })),
    categories,
    key,
    currency,
  );
}
