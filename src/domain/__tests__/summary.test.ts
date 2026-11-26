import { describe, expect, it } from '@jest/globals';
import { STARTER_CATEGORIES } from '@/domain/categories';
import { budgetFor, compareWords, pace, summarise } from '@/domain/summary';
import type { Category, CurrencyCode, DayKey, Expense } from '@/domain/types';

let n = 0;
const ex = (day: string, amount: number, categoryId = 'food', currency: CurrencyCode = 'NGN'): Expense => ({
  id: `e${(n += 1)}`,
  day: day as DayKey,
  amount,
  categoryId,
  currency,
  note: '',
  createdAt: n,
  updatedAt: n,
});
const cats: Category[] = STARTER_CATEGORIES.map((c) => ({ ...c }));

describe('summarise', () => {
  const expenses = [
    ex('2026-11-01', 100_00),
    ex('2026-11-01', 50_00, 'transport'),
    ex('2026-11-15', 200_00),
    ex('2026-11-30', 25_00, 'rent'),
    ex('2026-11-10', 7_00, 'food', 'USD'),
    ex('2026-10-31', 999_00), // last month
    ex('2026-12-01', 999_00), // next month
  ];
  const s = summarise(expenses, cats, '2026-11', 'NGN');

  it('totals one currency for one month', () => {
    expect(s.total).toBe(375_00);
    expect(s.count).toBe(4);
  });

  it('keeps other currencies separate, never converted', () => {
    expect(s.otherCurrencies).toEqual([{ currency: 'USD', total: 7_00, count: 1 }]);
  });

  it('groups by category, biggest first', () => {
    expect(s.byCategory.map((b) => [b.category.id, b.total])).toEqual([
      ['food', 300_00],
      ['transport', 50_00],
      ['rent', 25_00],
    ]);
  });

  it('gives per-day and running totals for the whole month', () => {
    expect(s.perDay).toHaveLength(30);
    expect(s.perDay[0]).toBe(150_00);
    expect(s.cumulative[14]).toBe(350_00);
    expect(s.cumulative[29]).toBe(375_00);
  });

  it('counts an unknown category under Other and ignores a malformed day', () => {
    const t = summarise([ex('2026-11-02', 10_00, 'gone'), ex('2026-11-31' as string, 5_00)], cats, '2026-11', 'NGN');
    expect(t.byCategory).toEqual([expect.objectContaining({ total: 10_00 })]);
    expect(t.byCategory[0].category.id).toBe('other');
    expect(t.total).toBe(10_00);
  });

  it('is empty for a month with nothing in it', () => {
    const e = summarise(expenses, cats, '2025-01', 'NGN');
    expect(e.total).toBe(0);
    expect(e.byCategory).toEqual([]);
    expect(e.cumulative.every((v) => v === 0)).toBe(true);
  });
});

describe('budgets', () => {
  const food: Category = { ...cats[1], budget: 90_000_00, budgetCurrency: 'NGN' };

  it('applies only in the currency it was set in', () => {
    expect(budgetFor(food, 'NGN')).toBe(90_000_00);
    expect(budgetFor(food, 'USD')).toBeNull();
  });

  it('exists from the moment it is set, at ₦0 spent', () => {
    const s = summarise([], [food], '2026-11', 'NGN');
    expect(budgetFor(food, 'NGN')).toBe(90_000_00);
    expect(s.byCategory.find((b) => b.category.id === food.id)?.total ?? 0).toBe(0);
  });

  it('is absent without a budget', () => {
    expect(budgetFor(cats[0], 'NGN')).toBeNull();
  });
});

describe('pace', () => {
  const now = summarise([ex('2026-11-01', 100_00), ex('2026-11-10', 100_00)], cats, '2026-11', 'NGN');
  const before = summarise([ex('2026-10-01', 50_00), ex('2026-10-05', 50_00), ex('2026-10-20', 500_00)], cats, '2026-10', 'NGN');

  it('compares with last month by the same day', () => {
    expect(pace(now, before, '2026-11-12')).toEqual({ day: 12, spentByNow: 200_00, lastMonthByNow: 100_00, delta: 100_00 });
  });

  it('is null when last month had nothing', () => {
    const empty = summarise([], cats, '2026-10', 'NGN');
    expect(pace(now, empty, '2026-11-12')).toBeNull();
  });

  it('uses the whole month for a past month', () => {
    expect(pace(before, summarise([ex('2026-09-30', 10_00)], cats, '2026-09', 'NGN'), '2026-11-26')?.day).toBe(31);
  });
});

describe('compareWords', () => {
  it('treats small differences as about the same, per currency', () => {
    expect(compareWords(8_000, 100_000, 'NGN')).toBe('same'); // ₦80 < ₦100
    expect(compareWords(8_000, 100_000, 'USD')).toBe('more'); // $80 is not "the same"
    expect(compareWords(-8_000, 100_000, 'USD')).toBe('less');
    expect(compareWords(50, 1_000, 'JPY')).toBe('same'); // ¥50 < ¥100
  });
});
