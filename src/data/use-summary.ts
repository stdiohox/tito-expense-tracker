import { useMemo } from 'react';

import { addMonths } from '@/domain/dates';
import { summarise, type MonthSummary } from '@/domain/summary';
import type { MonthKey } from '@/domain/types';

import { useStore } from './store';

export function useSummary(month: MonthKey): { now: MonthSummary; before: MonthSummary } {
  const { expenses, categories, settings } = useStore();
  return useMemo(
    () => ({
      now: summarise(expenses, categories, month, settings.currency),
      before: summarise(expenses, categories, addMonths(month, -1), settings.currency),
    }),
    [expenses, categories, month, settings.currency],
  );
}
