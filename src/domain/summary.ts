import { dayOfMonth, daysInMonth, monthOfDay } from './dates';
import { CURRENCIES } from './money';
import type { Category, CategoryId, CurrencyCode, DayKey, Expense, MonthKey } from './types';

export type CategoryTotal = { category: Category; total: number; count: number };

export type MonthSummary = {
  month: MonthKey;
  currency: CurrencyCode;
  total: number;
  count: number;
  byCategory: CategoryTotal[];
  /** Totals in other currencies, never converted. */
  otherCurrencies: { currency: CurrencyCode; total: number; count: number }[];
  /** Cumulative spend at the end of each day, index 0 = day 1. */
  cumulative: number[];
};

/** The budget only applies when it was set in the currency being viewed. */
export function budgetFor(category: Category, currency: CurrencyCode): number | null {
  return category.budget !== null && category.budgetCurrency === currency ? category.budget : null;
}

export function summarise(
  expenses: Expense[],
  categories: Category[],
  month: MonthKey,
  currency: CurrencyCode,
): MonthSummary {
  const days = daysInMonth(month);
  const perDay = new Array<number>(days).fill(0);
  const byCat = new Map<CategoryId, { total: number; count: number }>();
  const other = new Map<CurrencyCode, { total: number; count: number }>();
  const known = new Set(categories.map((c) => c.id));
  const fallback = known.has('other') ? 'other' : categories[0]?.id;
  let total = 0;
  let count = 0;

  for (const e of expenses) {
    if (monthOfDay(e.day) !== month) continue;
    if (e.currency !== currency) {
      const o = other.get(e.currency) ?? { total: 0, count: 0 };
      o.total += e.amount;
      o.count += 1;
      other.set(e.currency, o);
      continue;
    }
    const d = dayOfMonth(e.day);
    if (!(d >= 1 && d <= days)) continue; // malformed day: never poison the chart with NaN
    total += e.amount;
    count += 1;
    perDay[d - 1] += e.amount;
    // An expense whose category no longer exists still counts, under Other.
    const catId = known.has(e.categoryId) ? e.categoryId : fallback;
    if (catId === undefined) continue;
    const c = byCat.get(catId) ?? { total: 0, count: 0 };
    c.total += e.amount;
    c.count += 1;
    byCat.set(catId, c);
  }

  const cumulative: number[] = [];
  perDay.reduce((acc, v, i) => (cumulative[i] = acc + v), 0);

  const byCategory = categories
    .map((category) => ({ category, ...(byCat.get(category.id) ?? { total: 0, count: 0 }) }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    month,
    currency,
    total,
    count,
    byCategory,
    otherCurrencies: [...other].map(([c, v]) => ({ currency: c, ...v })),
    cumulative,
  };
}

/**
 * How this month compares with last month at the same day of the month.
 * Positive delta = spending more than last month's pace.
 */
export function pace(
  current: MonthSummary,
  previous: MonthSummary,
  today: DayKey,
): { day: number; spentByNow: number; lastMonthByNow: number; delta: number } | null {
  const isCurrent = monthOfDay(today) === current.month;
  const day = isCurrent ? dayOfMonth(today) : current.cumulative.length;
  const spentByNow = current.cumulative[day - 1] ?? 0;
  if (previous.total === 0) return null;
  const prevDay = Math.min(day, previous.cumulative.length);
  const lastMonthByNow = previous.cumulative[prevDay - 1] ?? 0;
  return { day, spentByNow, lastMonthByNow, delta: spentByNow - lastMonthByNow };
}

/**
 * "₦12,050 less than …" / "about the same as …" phrasing shared by Home and Reports.
 * "Same" when the difference is under the currency's floor (₦100, $1) or 2% of the base.
 */
export function compareWords(delta: number, base: number, currency: CurrencyCode): 'less' | 'more' | 'same' {
  if (Math.abs(delta) < Math.max(CURRENCIES[currency].sameBelow, base * 0.02)) return 'same';
  return delta < 0 ? 'less' : 'more';
}
