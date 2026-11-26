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
import { openDatabase } from '@/db/open';
import * as repo from '@/db/repo';
import { STARTER_CATEGORIES } from '@/domain/categories';
import { addMonths, monthKey } from '@/domain/dates';
import { summarise, summariseGroups } from '@/domain/summary';
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
  let out = fn(); // warm-up run, not timed (first-call compile and JIT)
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

  // The same work the screens do now: totals added up in SQLite (GROUP BY, indexed on day), and
  // only the viewed month's rows read for lists and search. The 10,000 expenses never all come
  // into JavaScript. (Jest runs SQLite through Node's built-in copy; see jest.sqlite.js.)
  it('data work stays within a frame', async () => {
    expect(expenses).toHaveLength(10_000);
    expect(new Set(expenses.map((e) => e.currency)).size).toBe(20);
    const db = await openDatabase('perf.db');
    await repo.replaceAllExpenses(db, expenses);
    expect(repo.countExpenses(db)).toBe(10_000);

    time('Month summary, one currency (Home, Expenses, Reports)', () => summariseGroups(repo.monthGroups(db, month), categories, month, 'NGN'));
    time('Home: a summary for each of the 20 currencies (one query, as Home does it)', () => {
      const byCurrency = new Map<string, ReturnType<typeof repo.monthGroups>>();
      for (const g of repo.monthGroups(db, month)) byCurrency.set(g.currency, [...(byCurrency.get(g.currency) ?? []), g]);
      return CURRENCY_CODES.map((c) => summariseGroups(byCurrency.get(c) ?? [], categories, month, c));
    });
    time('Reports: 6 months of history', () => repo.monthTotals(db, [0, 1, 2, 3, 4, 5].map((i) => addMonths(month, -i)), 'NGN'));
    // The Expenses tab reads its month once (again only after a change or a month switch) and
    // groups it; each search keystroke then filters those rows without going back to the database.
    const monthRows = time('Expenses: read one month and group it into days', () => {
      const rows = repo.monthExpenses(db, month, 'NGN');
      const byDay = new Map<string, number>();
      for (const e of rows) byDay.set(e.day, (byDay.get(e.day) ?? 0) + 1);
      return rows;
    });
    time('Search: one keystroke over the month', () => monthRows.filter((e) => e.note.toLowerCase().includes('fuel')));
    // The old way, for comparison: summarise() over all 10,000 expenses in JavaScript.
    time('Reference: summarise() over all 10,000 in JavaScript', () => summarise(expenses, categories, month, 'NGN'));
    for (const [, ms] of results) expect(ms).toBeLessThan(100);
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
