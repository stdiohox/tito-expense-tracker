import { STARTER_CATEGORIES } from '@/domain/categories';
import { addMonths, dayKey, daysInMonth, monthKey, parseMonth } from '@/domain/dates';
import type { Category, DayKey, Expense, MonthKey } from '@/domain/types';

/*
 * SAMPLE DATA for the phase-1 preview. Synthetic: no real person's spending.
 * Replaced by the user's own data once accounts and sync land (phase 2).
 */

export const SAMPLE_CATEGORIES: Category[] = STARTER_CATEGORIES.map((c) =>
  c.id === 'food'
    ? { ...c, budget: 9_000_000, budgetCurrency: 'NGN' as const }
    : c.id === 'transport'
      ? { ...c, budget: 4_500_000, budgetCurrency: 'NGN' as const }
      : c.id === 'airtime'
        ? { ...c, budget: 600_000, budgetCurrency: 'NGN' as const }
        : c,
);

type Rule = {
  categoryId: string;
  notes: string[];
  /** naira range */
  min: number;
  max: number;
  /** chance per day, or fixed days of month */
  chance?: number;
  days?: number[];
  sundays?: boolean;
};

const RULES: Rule[] = [
  { categoryId: 'rent', notes: ['Monthly rent'], min: 150_000, max: 150_000, days: [1] },
  { categoryId: 'food', notes: ['Market run, Mile 12', 'Groceries, Shoprite', 'Lunch at work', 'Suya', 'Bread and eggs', 'Rice and oil'], min: 1_500, max: 9_000, chance: 0.7 },
  { categoryId: 'transport', notes: ['Bolt to the office', 'Danfo fare', 'Keke', 'Fuel', 'BRT card top-up'], min: 800, max: 6_500, chance: 0.75 },
  { categoryId: 'bills', notes: ['Prepaid electricity', 'Water bill', 'DStv subscription', 'Estate dues'], min: 8_000, max: 22_000, days: [3, 12, 20] },
  { categoryId: 'airtime', notes: ['MTN data 10GB', 'Airtel airtime', 'Glo data bundle'], min: 1_000, max: 5_000, chance: 0.18 },
  { categoryId: 'family', notes: ["Mum's upkeep", 'School fees support', 'Sent to Tunde'], min: 15_000, max: 30_000, days: [5, 25] },
  { categoryId: 'faith', notes: ['Sunday offering', 'Tithe'], min: 2_000, max: 6_000, sundays: true },
  { categoryId: 'personal', notes: ['Haircut', 'Toiletries', 'Laundry'], min: 2_000, max: 7_000, chance: 0.1 },
  { categoryId: 'health', notes: ['Pharmacy', 'Malaria drugs', 'Clinic visit'], min: 3_000, max: 12_000, chance: 0.05 },
  { categoryId: 'entertainment', notes: ['Cinema, Ikeja City Mall', 'Netflix', 'Dinner out with friends'], min: 4_000, max: 15_000, chance: 0.08 },
  { categoryId: 'shopping', notes: ['New shoes', 'Phone charger', 'Shirt'], min: 5_000, max: 25_000, chance: 0.06 },
];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function monthExpenses(month: MonthKey, upToDay: number, seed: number, scale: number): Expense[] {
  const r = rng(seed);
  const { year, month: m } = parseMonth(month);
  const out: Expense[] = [];
  for (let d = 1; d <= upToDay; d++) {
    const date = new Date(year, m - 1, d);
    const day = dayKey(date) as DayKey;
    for (const rule of RULES) {
      const hit = rule.days
        ? rule.days.includes(d)
        : rule.sundays
          ? date.getDay() === 0
          : r() < (rule.chance ?? 0);
      if (!hit) continue;
      const naira = Math.round((rule.min + r() * (rule.max - rule.min)) * scale / 50) * 50;
      const t = date.getTime() + Math.floor(r() * 12 * 3600_000) + 7 * 3600_000;
      out.push({
        id: `sample-${month}-${d}-${rule.categoryId}-${out.length}`,
        amount: naira * 100,
        currency: 'NGN',
        categoryId: rule.categoryId,
        day,
        note: rule.notes[Math.floor(r() * rule.notes.length)],
        createdAt: t,
        updatedAt: t,
      });
    }
  }
  return out;
}

export function sampleExpenses(now: Date = new Date()): Expense[] {
  const current = monthKey(now);
  const previous = addMonths(current, -1);
  const twoBack = addMonths(current, -2);
  return [
    ...monthExpenses(twoBack, daysInMonth(twoBack), 7, 1.0),
    ...monthExpenses(previous, daysInMonth(previous), 11, 1.12),
    ...monthExpenses(current, now.getDate(), 23, 1.0),
    {
      id: 'sample-usd-1',
      amount: 1_499,
      currency: 'USD',
      categoryId: 'entertainment',
      day: dayKey(new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 3))),
      note: 'Spotify (card in dollars)',
      createdAt: now.getTime() - 3 * 86400_000,
      updatedAt: now.getTime() - 3 * 86400_000,
    },
  ];
}
