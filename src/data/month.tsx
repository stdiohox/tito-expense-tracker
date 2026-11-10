import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { addMonths, dayKey } from '@/domain/dates';
import type { DayKey, MonthKey } from '@/domain/types';

type MonthState = {
  month: MonthKey;
  current: MonthKey;
  today: DayKey;
  isCurrent: boolean;
  prev: () => void;
  next: () => void;
  set: (m: MonthKey) => void;
};

const Ctx = createContext<MonthState | null>(null);

/**
 * The month being viewed (shared by Home, Expenses and Reports) and the local "today".
 * Today refreshes when the app returns to the foreground and at local midnight, so a phone
 * left open across the 1st moves to the new month instead of showing the old one as current.
 */
export function MonthProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState<DayKey>(() => dayKey(new Date()));
  const current = today.slice(0, 7) as MonthKey;
  const [month, setMonth] = useState<MonthKey>(current);
  const [followCurrent, setFollowCurrent] = useState(true);

  useEffect(() => {
    const refresh = () => setToday(dayKey(new Date()));
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1).getTime() - now.getTime();
    const timer = setTimeout(refresh, midnight);
    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [today]);

  // While the user is looking at "this month", roll forward with the calendar.
  const shown = followCurrent ? current : month;

  const value = useMemo<MonthState>(() => {
    const go = (m: MonthKey) => {
      const clamped = m > current ? current : m;
      setMonth(clamped);
      setFollowCurrent(clamped === current);
    };
    return {
      month: shown,
      current,
      today,
      isCurrent: shown === current,
      prev: () => go(addMonths(shown, -1)),
      next: () => go(addMonths(shown, 1)),
      set: go,
    };
  }, [shown, current, today]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMonth(): MonthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMonth must be used inside MonthProvider');
  return v;
}

/** Local calendar "today", kept fresh. */
export function useToday(): DayKey {
  return useMonth().today;
}
