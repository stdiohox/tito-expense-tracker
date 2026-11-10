// Run: npm run check:dates. Guards the web tracker's bugs B1 (month navigation in UTC+1) and
// B3 (yesterday's date after midnight), plus money parsing and summaries.
// The timezone is set before anything reads the clock, so a plain `node` run still tests Lagos.
process.env.TZ = process.env.TZ ?? 'Africa/Lagos';

const assert = (await import('node:assert/strict')).default;
const { addDays, addMonths, dayKey, daysInMonth, monthKey } = await import('../src/domain/dates.ts');
const { formatMoney, parseAmount } = await import('../src/domain/money.ts');
const { summarise } = await import('../src/domain/summary.ts');

assert.equal(addMonths('2026-11', 1), '2026-12');
assert.equal(addMonths('2026-11', -1), '2026-10');
assert.equal(addMonths('2026-12', 1), '2027-01');
assert.equal(addMonths('2027-01', -1), '2026-12');
assert.equal(addMonths('2026-03', -1), '2026-02');
assert.equal(daysInMonth('2028-02'), 29);
assert.equal(dayKey(new Date(2026, 10, 10, 0, 30)), '2026-11-10');
assert.equal(monthKey(new Date(2026, 11, 1, 0, 5)), '2026-12');
assert.equal(addDays('2026-03-08', 1), '2026-03-09'); // DST change in the US
assert.equal(addDays('2026-11-01', -1), '2026-10-31');

assert.equal(formatMoney(18_450_000, 'NGN'), '₦184,500');
assert.equal(formatMoney(125_050, 'NGN'), '₦1,250.50');
assert.equal(formatMoney(1_499, 'USD'), '$14.99');
assert.equal(formatMoney(99_960_000, 'NGN', { compact: true }), '₦1m');
assert.equal(formatMoney(4_500_000, 'NGN', { compact: true }), '₦45k');
assert.equal(formatMoney(-250_000, 'NGN'), '−₦2,500');

assert.equal(parseAmount('2,500', 'NGN'), 250_000);
assert.equal(parseAmount('1,250.50', 'NGN'), 125_050);
assert.equal(parseAmount('12,5', 'NGN'), 1_250); // decimal comma, never 125 naira
assert.equal(parseAmount('1.250,50', 'NGN'), 125_050);
assert.equal(parseAmount('1,2,3', 'NGN'), null);
assert.equal(parseAmount('.5', 'NGN'), 50);
assert.equal(parseAmount('5.', 'NGN'), 500);
assert.equal(parseAmount('0', 'NGN'), null);
assert.equal(parseAmount('12.345', 'NGN'), null);

const cats = [
  { id: 'food', name: 'Food', icon: 'food', budget: null, builtIn: true },
  { id: 'other', name: 'Other', icon: 'other', budget: null, builtIn: true },
] as const;
const mk = (id: string, day: string, amount: number, categoryId: string, currency = 'NGN') =>
  ({ id, day, amount, categoryId, currency, note: '', createdAt: 0, updatedAt: 0 }) as never;
const s = summarise(
  [mk('a', '2026-02-01', 100, 'food'), mk('b', '2026-02-28', 50, 'gone'), mk('c', '2026-02-10', 7, 'food', 'USD'), mk('d', '2026-02-31', 9, 'food')],
  [...cats] as never,
  '2026-02',
  'NGN',
);
assert.equal(s.total, 150); // the malformed day 31 Feb is skipped
assert.equal(s.cumulative.length, 28);
assert.equal(s.cumulative[27], 150);
assert.deepEqual(s.byCategory.map((b) => [b.category.id, b.total]), [['food', 100], ['other', 50]]); // unknown category counted under Other
assert.deepEqual(s.otherCurrencies, [{ currency: 'USD', total: 7, count: 1 }]);

console.log(`dates, money and summaries OK in ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
