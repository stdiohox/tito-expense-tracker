import { describe, expect, it } from '@jest/globals';
import { CURRENCIES, REGIONS, amountToInput, currencyInfo, formatMoney, parseAmount, searchCurrencies } from '@/domain/money';
import { CURRENCY_CODES, type CurrencyCode } from '@/domain/types';

const expected: Record<CurrencyCode, { whole: string; frac: string | null }> = {
  NGN: { whole: '₦2,500', frac: '₦1,250.50' },
  GHS: { whole: 'GH₵2,500', frac: 'GH₵1,250.50' },
  KES: { whole: 'KSh 2,500', frac: 'KSh 1,250.50' },
  ZAR: { whole: 'R2,500', frac: 'R1,250.50' },
  XAF: { whole: 'FCFA 2,500', frac: null },
  XOF: { whole: 'CFA 2,500', frac: null },
  EGP: { whole: 'E£2,500', frac: 'E£1,250.50' },
  MAD: { whole: 'MAD 2,500', frac: 'MAD 1,250.50' },
  UGX: { whole: 'USh 2,500', frac: null },
  TZS: { whole: 'TSh 2,500', frac: 'TSh 1,250.50' },
  EUR: { whole: '€2,500', frac: '€1,250.50' },
  GBP: { whole: '£2,500', frac: '£1,250.50' },
  USD: { whole: '$2,500', frac: '$1,250.50' },
  CAD: { whole: 'CA$2,500', frac: 'CA$1,250.50' },
  AED: { whole: 'AED 2,500', frac: 'AED 1,250.50' },
  SAR: { whole: 'SAR 2,500', frac: 'SAR 1,250.50' },
  INR: { whole: '₹2,500', frac: '₹1,250.50' },
  JPY: { whole: '¥2,500', frac: null },
  CNY: { whole: 'CN¥2,500', frac: 'CN¥1,250.50' },
  AUD: { whole: 'A$2,500', frac: 'A$1,250.50' },
};

describe('the currency list', () => {
  it('has the twenty currencies in picker order, grouped by region', () => {
    expect(CURRENCY_CODES).toHaveLength(20);
    expect(Object.keys(CURRENCIES).sort()).toEqual([...CURRENCY_CODES].sort());
    expect([...new Set(CURRENCY_CODES.map((c) => CURRENCIES[c].region))]).toEqual([...REGIONS]);
  });

  it('uses ISO decimals: none for XAF, XOF, UGX and JPY', () => {
    expect(CURRENCY_CODES.filter((c) => CURRENCIES[c].decimals === 0)).toEqual(['XAF', 'XOF', 'UGX', 'JPY']);
    for (const c of CURRENCY_CODES) expect(CURRENCIES[c].minor).toBe(10 ** CURRENCIES[c].decimals);
  });

  it('never gives two currencies the same symbol', () => {
    expect(new Set(CURRENCY_CODES.map((c) => CURRENCIES[c].symbol)).size).toBe(20);
  });
});

describe.each(CURRENCY_CODES)('%s', (code) => {
  const per = CURRENCIES[code].minor;
  const e = expected[code];

  it('formats whole amounts and compact totals', () => {
    expect(formatMoney(2_500 * per, code)).toBe(e.whole);
    expect(formatMoney(45_000 * per, code, { compact: true })).toMatch(/45k$/);
    expect(formatMoney(-2_500 * per, code)).toBe(`−${e.whole}`);
  });

  it('parses typed amounts, with or without its symbol or code', () => {
    expect(parseAmount('2,500', code)).toBe(2_500 * per);
    expect(parseAmount('2500', code)).toBe(2_500 * per);
    expect(parseAmount(e.whole, code)).toBe(2_500 * per);
    expect(parseAmount(`${code} 2500`, code)).toBe(2_500 * per);
    expect(parseAmount('0', code)).toBeNull();
    expect(parseAmount('', code)).toBeNull();
    expect(parseAmount('abc', code)).toBeNull();
  });

  it(e.frac ? 'handles two decimals' : 'rejects decimals', () => {
    if (e.frac) {
      expect(formatMoney(1_250 * per + 50, code)).toBe(e.frac);
      expect(parseAmount('1,250.50', code)).toBe(1_250 * per + 50);
      expect(parseAmount('1.250,50', code)).toBe(1_250 * per + 50); // decimal comma keyboard
      expect(parseAmount('12,5', code)).toBe(12 * per + 50);
      expect(parseAmount('1.234', code)).toBeNull();
    } else {
      expect(parseAmount('12.5', code)).toBeNull();
      expect(parseAmount('12,5', code)).toBeNull();
    }
  });

  it('round-trips through the edit field', () => {
    const v = parseAmount('3,075', code)!;
    expect(amountToInput(v, code)).toBe('3075');
  });
});

describe('search', () => {
  it.each([
    ['Germany', 'EUR'],
    ['Gabon', 'XAF'],
    ["Côte d'Ivoire", 'XOF'],
    ['cote divoire', 'XOF'],
    ['Dubai', 'AED'],
    ['naira', 'NGN'],
    ['Uganda', 'UGX'],
  ])('"%s" finds %s', (q, code) => {
    expect(searchCurrencies(q)).toContain(code);
  });

  it('shows everything for an empty search and nothing for nonsense', () => {
    expect(searchCurrencies('')).toHaveLength(20);
    expect(searchCurrencies('zzzz')).toEqual([]);
  });
});

describe('safety', () => {
  it('keeps a currency that is no longer on the list working', () => {
    expect(currencyInfo('XYZ').symbol).toBe('XYZ');
    expect(formatMoney(250_000, 'XYZ' as CurrencyCode)).toBe('XYZ 2,500');
    expect(parseAmount('2,500', 'XYZ' as CurrencyCode)).toBe(250_000);
  });

  it('shows a dash for a corrupt amount, never NaN', () => {
    expect(formatMoney(Number.NaN, 'NGN')).toBe('₦—');
    expect(formatMoney(Number.POSITIVE_INFINITY, 'KES')).toBe('KSh —');
  });

  it('strips longer symbols whole: CA$, FCFA, CN¥', () => {
    expect(parseAmount('CA$12.50', 'CAD')).toBe(1_250);
    expect(parseAmount('FCFA 5,000', 'XAF')).toBe(5_000);
    expect(parseAmount('CN¥12.50', 'CNY')).toBe(1_250);
  });
});
