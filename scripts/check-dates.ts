// Run: npm run check:dates. Guards the web tracker's bugs B1 (month navigation in UTC+1) and
// B3 (yesterday's date after midnight), plus money parsing and summaries.
// The timezone is set before anything reads the clock, so a plain `node` run still tests Lagos.
process.env.TZ = process.env.TZ ?? 'Africa/Lagos';

const assert = (await import('node:assert/strict')).default;
const { addDays, addMonths, dayKey, daysInMonth, monthKey } = await import('../src/domain/dates.ts');
const { CURRENCIES, REGIONS, amountToInput, currencyInfo, formatMoney, parseAmount, searchCurrencies } = await import('../src/domain/money.ts');
const { CURRENCY_CODES } = await import('../src/domain/types.ts');
const { compareWords, summarise } = await import('../src/domain/summary.ts');

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

// Every currency: the list matches the type, and each parses, formats and round-trips.
assert.deepEqual(Object.keys(CURRENCIES).sort(), [...CURRENCY_CODES].sort());
assert.equal(CURRENCY_CODES.length, 20);
// The picker order, grouped by region.
assert.deepEqual([...CURRENCY_CODES], [
  'NGN', 'GHS', 'KES', 'ZAR', 'XAF', 'XOF', 'EGP', 'MAD', 'UGX', 'TZS',
  'EUR', 'GBP',
  'USD', 'CAD',
  'AED', 'SAR', 'INR', 'JPY', 'CNY',
  'AUD',
]);
assert.deepEqual(
  REGIONS.map((r) => CURRENCY_CODES.filter((c) => CURRENCIES[c].region === r).length),
  [10, 2, 2, 5, 1],
);
// Regions appear in one unbroken run each, in REGIONS order.
assert.deepEqual([...new Set(CURRENCY_CODES.map((c) => CURRENCIES[c].region))], [...REGIONS]);
// ISO 4217 decimals: none for the two CFA francs, the Ugandan shilling and the yen.
assert.deepEqual(CURRENCY_CODES.filter((c) => CURRENCIES[c].decimals === 0), ['XAF', 'XOF', 'UGX', 'JPY']);
// Symbols never clash.
assert.equal(new Set(CURRENCY_CODES.map((c) => CURRENCIES[c].symbol)).size, CURRENCY_CODES.length);
assert.equal(CURRENCIES.EUR.flag, '🇪🇺');
const expected: Record<string, { whole: string; frac: string | null; compact: string }> = {
  NGN: { whole: '₦2,500', frac: '₦1,250.50', compact: '₦45k' },
  USD: { whole: '$2,500', frac: '$1,250.50', compact: '$45k' },
  GBP: { whole: '£2,500', frac: '£1,250.50', compact: '£45k' },
  EUR: { whole: '€2,500', frac: '€1,250.50', compact: '€45k' },
  CAD: { whole: 'CA$2,500', frac: 'CA$1,250.50', compact: 'CA$45k' },
  AUD: { whole: 'A$2,500', frac: 'A$1,250.50', compact: 'A$45k' },
  GHS: { whole: 'GH₵2,500', frac: 'GH₵1,250.50', compact: 'GH₵45k' },
  KES: { whole: 'KSh 2,500', frac: 'KSh 1,250.50', compact: 'KSh 45k' },
  ZAR: { whole: 'R2,500', frac: 'R1,250.50', compact: 'R45k' },
  XOF: { whole: 'CFA 2,500', frac: null, compact: 'CFA 45k' },
  EGP: { whole: 'E£2,500', frac: 'E£1,250.50', compact: 'E£45k' },
  AED: { whole: 'AED 2,500', frac: 'AED 1,250.50', compact: 'AED 45k' },
  SAR: { whole: 'SAR 2,500', frac: 'SAR 1,250.50', compact: 'SAR 45k' },
  INR: { whole: '₹2,500', frac: '₹1,250.50', compact: '₹45k' },
  CNY: { whole: 'CN¥2,500', frac: 'CN¥1,250.50', compact: 'CN¥45k' },
  JPY: { whole: '¥2,500', frac: null, compact: '¥45k' },
  XAF: { whole: 'FCFA 2,500', frac: null, compact: 'FCFA 45k' },
  MAD: { whole: 'MAD 2,500', frac: 'MAD 1,250.50', compact: 'MAD 45k' },
  UGX: { whole: 'USh 2,500', frac: null, compact: 'USh 45k' },
  TZS: { whole: 'TSh 2,500', frac: 'TSh 1,250.50', compact: 'TSh 45k' },
};
for (const code of CURRENCY_CODES) {
  const c = CURRENCIES[code];
  const e = expected[code];
  assert.ok(c.symbol && c.name && c.flag && c.country, `${code} has symbol, name, flag and country`);
  assert.equal(c.minor, 10 ** c.decimals, `${code} minor units`);
  const per = c.minor;
  assert.equal(formatMoney(2_500 * per, code), e.whole, `${code} whole`);
  assert.equal(formatMoney(45_000 * per, code, { compact: true }), e.compact, `${code} compact`);
  assert.equal(parseAmount('2,500', code), 2_500 * per, `${code} parses 2,500`);
  assert.equal(parseAmount(e.whole, code), 2_500 * per, `${code} parses its own formatted amount`);
  assert.equal(parseAmount(`${code} 2500`, code), 2_500 * per, `${code} parses with its code`);
  assert.equal(parseAmount('0', code), null, `${code} rejects zero`);
  if (e.frac) {
    assert.equal(formatMoney(1_250 * per + 50, code), e.frac, `${code} decimals`);
    assert.equal(parseAmount('1,250.50', code), 1_250 * per + 50, `${code} parses decimals`);
    assert.equal(parseAmount(e.frac, code), 1_250 * per + 50, `${code} parses its own decimals`);
    assert.equal(parseAmount('1.250,50', code), 1_250 * per + 50, `${code} decimal comma`);
    assert.equal(parseAmount('1.234', code), null, `${code} rejects three decimals`);
  } else {
    assert.equal(parseAmount('12.5', code), null, `${code} has no decimals`);
    assert.equal(parseAmount('12,5', code), null, `${code} rejects a decimal comma`);
  }
  assert.equal(amountToInput(parseAmount('3,075', code)!, code), '3075', `${code} round-trips`);
}
// Search finds a currency by any country that uses it, ignoring case, accents and punctuation.
const finds = (q: string, code: string) => assert.ok(searchCurrencies(q).includes(code as never), `"${q}" finds ${code}`);
for (const place of ['Germany', 'Austria', 'Finland', 'Portugal', 'Italy', 'France', 'Spain', 'Ireland', 'Netherlands', 'Belgium']) finds(place, 'EUR');
for (const place of ['Cameroon', 'Gabon', 'Chad', 'Congo', 'Central African Republic', 'Equatorial Guinea']) finds(place, 'XAF');
for (const place of ['Senegal', "Côte d'Ivoire", 'cote divoire', 'Mali', 'Burkina Faso', 'Benin', 'Togo', 'Niger', 'Guinea-Bissau']) finds(place, 'XOF');
for (const place of ['UAE', 'United Arab Emirates', 'Dubai', 'abu dhabi']) finds(place, 'AED');
finds('naira', 'NGN');
finds('USh', 'UGX');
finds('tanzania', 'TZS');
finds('morocco', 'MAD');
assert.deepEqual(searchCurrencies('dubai'), ['AED']);
assert.deepEqual(searchCurrencies('gabon'), ['XAF']);
assert.equal(searchCurrencies('').length, 20);
assert.deepEqual(searchCurrencies('zzzz'), []);
// "FCFA" is stripped whole, so it never leaves an "F" behind.
assert.equal(parseAmount('FCFA 5,000', 'XAF'), 5_000);
assert.equal(parseAmount('USh 5,000', 'UGX'), 5_000);
assert.equal(formatMoney(5_000, 'UGX'), 'USh 5,000');
// A code no longer on the list (older saved data) still formats, parses and compares: no crash.
const old = 'XYZ' as never;
assert.equal(currencyInfo('XYZ').symbol, 'XYZ');
assert.equal(formatMoney(250_000, old), 'XYZ 2,500');
assert.equal(formatMoney(125_050, old), 'XYZ 1,250.50');
assert.equal(parseAmount('2,500', old), 250_000);
assert.equal(compareWords(10, 100_000, old), 'same');
const legacy = summarise([{ id: 'z', day: '2026-02-05', amount: 900, categoryId: 'food', currency: 'XYZ', note: '', createdAt: 0, updatedAt: 0 }] as never, [{ id: 'food', name: 'Food', icon: 'food', budget: null, builtIn: true }] as never, '2026-02', 'NGN');
assert.deepEqual(legacy.otherCurrencies, [{ currency: 'XYZ', total: 900, count: 1 }]);

// The yen and the CFA franc have no minor units: 1,500 yen is stored as 1500.
assert.equal(CURRENCIES.JPY.decimals, 0);
assert.equal(CURRENCIES.XOF.decimals, 0);
assert.equal(parseAmount('1,500', 'JPY'), 1_500);
assert.equal(parseAmount('¥1500', 'JPY'), 1_500);
assert.equal(formatMoney(1_500, 'JPY'), '¥1,500');
assert.equal(formatMoney(-1_500, 'JPY'), '−¥1,500');
assert.equal(parseAmount('1500.', 'JPY'), 1_500);
// Symbols that contain other symbols are stripped whole, never half.
assert.equal(parseAmount('CA$12.50', 'CAD'), 1_250);
assert.equal(parseAmount('E£12.50', 'EGP'), 1_250);
assert.equal(parseAmount('CN¥12.50', 'CNY'), 1_250);
assert.equal(parseAmount('KSh 1,200', 'KES'), 120_000);
assert.equal(formatMoney(-120_000, 'KES'), '−KSh 1,200');

// "About the same" floor is per currency: ₦100 or $1, or 2% of last month, whichever is larger.
assert.equal(compareWords(8_000, 100_000, 'NGN'), 'same'); // ₦80 < ₦100
assert.equal(compareWords(8_000, 100_000, 'USD'), 'more'); // $80 on $1,000 is not "the same"
assert.equal(compareWords(-8_000, 100_000, 'USD'), 'less');
assert.equal(compareWords(50, 10_000, 'USD'), 'same'); // 50 cents < $1
assert.equal(compareWords(1_500, 100_000, 'USD'), 'same'); // $15 < 2% of $1,000
assert.equal(compareWords(-20_000, 100_000_00, 'NGN'), 'same'); // ₦200 < 2% of ₦100,000
assert.equal(compareWords(300_000, 100_000_00, 'NGN'), 'more'); // ₦3,000 > ₦2,000

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

// A hidden category (setup step 3) disappears from pickers, but its expenses still count.
const hiddenFood = [{ ...cats[0], hidden: true }, cats[1]];
const h = summarise([mk('e', '2026-02-03', 40, 'food')], hiddenFood as never, '2026-02', 'NGN');
assert.equal(h.total, 40);
assert.deepEqual(h.byCategory.map((b) => [b.category.id, b.total]), [['food', 40]]);

console.log(`dates, money and summaries OK in ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
