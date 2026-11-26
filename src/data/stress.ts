import { addMonths, daysInMonth } from '@/domain/dates';
import { CURRENCIES } from '@/domain/money';
import { CURRENCY_CODES, type CurrencyCode, type DayKey, type Expense, type MonthKey } from '@/domain/types';

/*
 * Development only: a large, realistic data set to check the app stays smooth at scale
 * (docs/SCALE-PLAN.md §8). Never reachable in production: the only button that loads it is inside
 * an `if (__DEV__)` block in Settings, which production builds remove.
 */

/** Small seeded random generator, so every run produces the same data. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;
    return s / 2 ** 32;
  };
}

const NOTES = ['', '', '', 'Lunch', 'Fuel', 'Data bundle', 'Market', 'Taxi', 'Electricity', 'Church', 'School fees', 'Pharmacy'];

/**
 * `count` expenses over the `months` months ending with `lastMonth`, in all twenty currencies: about
 * 60% in `main`, the rest spread across the other nineteen. Spread over the starter categories.
 */
export function makeStressExpenses({
  count = 10_000,
  months = 24,
  lastMonth,
  main = 'NGN',
  categoryIds,
  seed = 7,
}: {
  count?: number;
  months?: number;
  lastMonth: MonthKey;
  main?: CurrencyCode;
  categoryIds: string[];
  seed?: number;
}): Expense[] {
  const rand = seeded(seed);
  const others = CURRENCY_CODES.filter((c) => c !== main);
  const now = Date.now();
  const out: Expense[] = [];
  for (let i = 0; i < count; i++) {
    const month = addMonths(lastMonth, -Math.floor(rand() * months));
    const day = 1 + Math.floor(rand() * daysInMonth(month));
    const currency = rand() < 0.6 ? main : others[Math.floor(rand() * others.length)];
    const whole = 100 + Math.floor(rand() * 49_900);
    out.push({
      id: `stress-${seed}-${i}`,
      amount: whole * CURRENCIES[currency].minor,
      currency,
      categoryId: categoryIds[Math.floor(rand() * categoryIds.length)],
      day: `${month}-${String(day).padStart(2, '0')}` as DayKey,
      note: NOTES[Math.floor(rand() * NOTES.length)],
      createdAt: now - i,
      updatedAt: now - i,
    });
  }
  return out;
}
