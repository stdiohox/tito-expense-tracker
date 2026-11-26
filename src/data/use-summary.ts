import * as repo from '@/db/repo';
import { addMonths } from '@/domain/dates';
import { summariseGroups, type MonthSummary, type SpendGroup } from '@/domain/summary';
import type { CurrencyCode, MonthKey } from '@/domain/types';

import { useQuery } from './expenses';
import { useStore } from './store';

/*
 * Month totals come from SQLite already added up by currency, category and day (repo.monthGroups),
 * so their cost doesn't grow with the number of expenses. Never converts between currencies.
 */

/** This month and last month in one currency (the main one unless given). */
export function useSummary(month: MonthKey, currency?: CurrencyCode): { now: MonthSummary; before: MonthSummary } {
  const { categories, settings } = useStore();
  const cur = currency ?? settings.currency;
  return useQuery(
    (db) => {
      const prev = addMonths(month, -1);
      return {
        now: summariseGroups(repo.monthGroups(db, month), categories, month, cur),
        before: summariseGroups(repo.monthGroups(db, prev), categories, prev, cur),
      };
    },
    categories,
    month,
    cur,
  );
}

/** A month summary for each currency asked for, from one query (Home's currency cards and budgets). */
export function useMonthSummaries(month: MonthKey, codes: readonly CurrencyCode[]): Map<CurrencyCode, MonthSummary> {
  const { categories } = useStore();
  const key = codes.join(',');
  return useQuery(
    (db) => {
      // One query; then each currency is summarised from only its own groups.
      const byCurrency = new Map<CurrencyCode, SpendGroup[]>();
      for (const g of repo.monthGroups(db, month)) {
        const list = byCurrency.get(g.currency);
        if (list) list.push(g);
        else byCurrency.set(g.currency, [g]);
      }
      const codes = key ? (key.split(',') as CurrencyCode[]) : [];
      return new Map(codes.map((code) => [code, summariseGroups(byCurrency.get(code) ?? [], categories, month, code)]));
    },
    categories,
    month,
    key,
  );
}

/** Each month's total in one currency, from one query (Reports → Month by month). */
export function useMonthTotals(months: readonly MonthKey[], currency: CurrencyCode): { month: MonthKey; total: number }[] {
  const key = months.join(',');
  return useQuery((db) => repo.monthTotals(db, key ? (key.split(',') as MonthKey[]) : [], currency), key, currency);
}
