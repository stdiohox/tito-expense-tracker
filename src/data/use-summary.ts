import { useMemo } from 'react';

import { addMonths } from '@/domain/dates';
import { summarise, type MonthSummary } from '@/domain/summary';
import type { CurrencyCode, MonthKey } from '@/domain/types';

import { useStore } from './store';

/** This month and last month in one currency (the main one unless given). Never converts. */
export function useSummary(month: MonthKey, currency?: CurrencyCode): { now: MonthSummary; before: MonthSummary } {
  const { expenses, categories, settings } = useStore();
  const cur = currency ?? settings.currency;
  return useMemo(
    () => ({
      now: summarise(expenses, categories, month, cur),
      before: summarise(expenses, categories, addMonths(month, -1), cur),
    }),
    [expenses, categories, month, cur],
  );
}
