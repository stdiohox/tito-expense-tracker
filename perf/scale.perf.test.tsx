/*
 * Performance at scale (docs/SCALE-PLAN.md §8). Not part of `npm test`; run with `npm run perf`.
 * Loads the development stress data (10,000 expenses over 24 months in 20 currencies) and times
 * the work behind Home, Expenses, Reports and search. Prints a table; fails only if something
 * takes far longer than a frame budget allows, so it stays useful on slower machines.
 */
import { afterAll, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { makeStressExpenses } from '@/data/stress';
import { STARTER_CATEGORIES } from '@/domain/categories';
import { addMonths, monthKey } from '@/domain/dates';
import { summarise } from '@/domain/summary';
import { CURRENCY_CODES } from '@/domain/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockReanimated, mockWorklets } = require('../jest.mocks');
Object.assign(jest.requireMock('react-native-reanimated') as object, mockReanimated());
Object.assign(jest.requireMock('react-native-worklets') as object, mockWorklets());

jest.setTimeout(240_000);

// renderRouter switches Jest to fake timers, which freeze clock.now(); use the real clock.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const clock: { now: () => number } = jest.requireActual<{ performance: { now: () => number } }>('perf_hooks').performance;

const results: [string, number][] = [];
let rowsMounted = 0;
const time = <T,>(label: string, fn: () => T, runs = 5): T => {
  let out!: T;
  const t0 = clock.now();
  for (let i = 0; i < runs; i++) out = fn();
  results.push([label, (clock.now() - t0) / runs]);
  return out;
};
const timeAsync = async (label: string, fn: () => Promise<unknown>) => {
  const t0 = clock.now();
  await fn();
  results.push([label, clock.now() - t0]);
};

const press = async (label: string | RegExp) => fireEvent.press(screen.getAllByLabelText(label).at(-1)!);
const type = async (label: string | RegExp, text: string) => fireEvent.changeText(screen.getAllByLabelText(label).at(-1)!, text);

describe('10,000 expenses', () => {
  const month = monthKey(new Date());
  const categories = STARTER_CATEGORIES.map((c) => ({ ...c }));
  const expenses = makeStressExpenses({ lastMonth: month, categoryIds: categories.map((c) => c.id) });

  it('data work stays within a frame', () => {
    expect(expenses).toHaveLength(10_000);
    expect(new Set(expenses.map((e) => e.currency)).size).toBe(20);
    time('Month summary, one currency (Home, Expenses, Reports)', () => summarise(expenses, categories, month, 'NGN'));
    time('Home: a summary for each of the 20 currencies (one pass, as Home does it)', () => {
      const byCurrency = new Map<string, typeof expenses>();
      for (const e of expenses) if (e.day.startsWith(month)) byCurrency.set(e.currency, [...(byCurrency.get(e.currency) ?? []), e]);
      return CURRENCY_CODES.map((c) => summarise(byCurrency.get(c) ?? [], categories, month, c));
    });
    time('Reports: 6 months of history', () => [0, 1, 2, 3, 4, 5].map((i) => summarise(expenses, categories, addMonths(month, -i), 'NGN')));
    time('Expenses: group one month into days', () => {
      const byDay = new Map<string, number>();
      for (const e of expenses) if (e.day.startsWith(month) && e.currency === 'NGN') byDay.set(e.day, (byDay.get(e.day) ?? 0) + 1);
      return byDay;
    });
    time('Search: one keystroke over the month', () => expenses.filter((e) => e.day.startsWith(month) && e.note.toLowerCase().includes('fuel')));
    for (const [label, ms] of results) expect(ms).toBeLessThan(100);
  });

  it('screens render and switch with the stress data loaded', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });
    await screen.findByLabelText('Skip to the last slide');
    await press('Skip to the last slide');
    await press('Create an account');
    await screen.findByLabelText('First name');
    await type('First name', 'Ada');
    await type('Last name', 'Obi');
    await type('Email', 'ada@example.test');
    await type('Password', 'testpass123');
    await press('Create account');
    await screen.findByText('Your currencies');
    await press('Continue');
    await press('Continue');
    await press('Finish');
    await screen.findByText('Hello, Ada');
    await press('Settings');
    await fireEvent.press(screen.getAllByText('Load stress data (10,000 expenses)').at(-1)!);
    await screen.findByText(/^Loaded 10,000 expenses/);

    await timeAsync('Render: open Home', async () => {
      await press('Home');
      await screen.findAllByText('Where it went');
    });
    await timeAsync('Render: open Expenses', async () => {
      await press('Expenses');
      await screen.findByLabelText(/^Search .* by note or category$/);
    });
    rowsMounted = screen.queryAllByHintText('Opens this expense to edit or delete', { includeHiddenElements: true }).length;
    await timeAsync('Render: search Expenses for "fuel"', async () => {
      await type(/^Search .* by note or category$/, 'fuel');
      await screen.findAllByText('Fuel');
    });
    await timeAsync('Render: open Reports', async () => {
      await press('Reports');
      await screen.findByText('Day by day');
    });
    await timeAsync('Render: previous month on Reports', async () => {
      await press(/^Previous month/);
      await screen.findByText('Day by day');
    });
  });

  afterAll(() => {
    // eslint-disable-next-line no-console
    console.log(`Expense rows mounted when Expenses opens: ${rowsMounted}`);
    // eslint-disable-next-line no-console
    console.log(['', '| What | Time (ms) |', '|---|---|', ...results.map(([l, ms]) => `| ${l} | ${ms.toFixed(1)} |`)].join('\n'));
  });
});
