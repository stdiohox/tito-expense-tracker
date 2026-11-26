import type { CurrencyCode } from './types';


export type Currency = {
  /** Shown before the amount: "₦", "$", "KSh". */
  symbol: string;
  /** A space between symbol and amount, for letter symbols: "KSh 1,200", "CFA 5,000". */
  spaced: boolean;
  name: string;
  /** Flag emoji and the country or area, for the currency picker. */
  flag: string;
  country: string;
  /** Digits after the decimal point (ISO 4217): 2 for most, 0 for the yen and the CFA franc. */
  decimals: number;
  /** Minor units per whole unit: 10 ** decimals. */
  minor: number;
  /**
   * Differences smaller than this (minor units) read as "about the same" when comparing months,
   * roughly a dollar's worth, so the wording means the same thing in every currency.
   */
  sameBelow: number;
};

const cur = (symbol: string, name: string, flag: string, country: string, decimals: number, sameBelowWhole: number, spaced = false): Currency => ({
  symbol,
  spaced,
  name,
  flag,
  country,
  decimals,
  minor: 10 ** decimals,
  sameBelow: sameBelowWhole * 10 ** decimals,
});

/** Every supported currency. Symbols avoid clashes: $ is the US dollar; CA$, A$, CN¥ and ¥ tell the others apart. */
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  NGN: cur('₦', 'Nigerian naira', '🇳🇬', 'Nigeria', 2, 100),
  USD: cur('$', 'US dollar', '🇺🇸', 'United States', 2, 1),
  GBP: cur('£', 'British pound', '🇬🇧', 'United Kingdom', 2, 1),
  EUR: cur('€', 'Euro', '🇪🇺', 'Euro area', 2, 1),
  CAD: cur('CA$', 'Canadian dollar', '🇨🇦', 'Canada', 2, 1),
  AUD: cur('A$', 'Australian dollar', '🇦🇺', 'Australia', 2, 1),
  GHS: cur('GH₵', 'Ghanaian cedi', '🇬🇭', 'Ghana', 2, 10),
  KES: cur('KSh', 'Kenyan shilling', '🇰🇪', 'Kenya', 2, 100, true),
  ZAR: cur('R', 'South African rand', '🇿🇦', 'South Africa', 2, 10),
  XOF: cur('CFA', 'West African CFA franc', '🌍', 'West Africa (UEMOA)', 0, 500, true),
  EGP: cur('E£', 'Egyptian pound', '🇪🇬', 'Egypt', 2, 50),
  AED: cur('AED', 'UAE dirham', '🇦🇪', 'United Arab Emirates', 2, 5, true),
  SAR: cur('SAR', 'Saudi riyal', '🇸🇦', 'Saudi Arabia', 2, 5, true),
  INR: cur('₹', 'Indian rupee', '🇮🇳', 'India', 2, 100),
  CNY: cur('CN¥', 'Chinese yuan', '🇨🇳', 'China', 2, 10),
  JPY: cur('¥', 'Japanese yen', '🇯🇵', 'Japan', 0, 100),
};

/** Every symbol and code, longest first, so "CA$" is stripped before "$" and "E£" before "£". */
const STRIP = new RegExp(
  [...new Set(Object.entries(CURRENCIES).flatMap(([code, c]) => [c.symbol, code]))]
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'gi',
);

const group = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const trim = (s: string) => s.replace(/\.0$/, '');

function compactBody(abs: number, per: number): string | null {
  const whole = abs / per;
  if (whole < 10_000) return null;
  if (whole < 1_000_000) {
    const k = whole / 1_000;
    const rounded = Number(k.toFixed(k >= 100 ? 0 : 1));
    // 999,600 rounds to "1000k": promote to millions instead.
    if (rounded < 1_000) return `${trim(rounded.toFixed(k >= 100 ? 0 : 1))}k`;
  }
  return `${trim((whole / 1_000_000).toFixed(1))}m`;
}

/**
 * ₦184,500, ₦1,250.50, KSh 1,200 or ¥1,500. Decimals only when the amount has them (never for
 * the yen or the CFA franc).
 * Hand-rolled rather than Intl so output is identical on Hermes (iOS/Android) and web.
 */
export function formatMoney(
  minor: number,
  currency: CurrencyCode,
  opts: { compact?: boolean; signed?: boolean } = {},
): string {
  const { symbol, spaced, minor: per, decimals } = CURRENCIES[currency];
  const value = Math.round(minor);
  const neg = value < 0;
  const abs = Math.abs(value);
  let body = opts.compact ? compactBody(abs, per) : null;
  if (body === null) {
    const whole = Math.floor(abs / per);
    const frac = abs % per;
    body = frac === 0 ? group(whole) : `${group(whole)}.${String(frac).padStart(decimals, '0')}`;
  }
  const sign = neg ? '−' : opts.signed ? '+' : '';
  return `${sign}${symbol}${spaced ? ' ' : ''}${body}`;
}

/**
 * Parse what the user typed into minor units; null if invalid.
 * Accepts "2500", "2,500", "1,250.50", "1250.5", ".5", "5." and a decimal comma
 * ("12,5", "1.250,50") as typed on comma-decimal phone keyboards. Commas count as
 * thousands separators only in thousands positions, so "12,5" is 12.50, never 125.
 */
export function parseAmount(input: string, currency: CurrencyCode): number | null {
  const { minor: per, decimals: dp } = CURRENCIES[currency];
  let s = input.replace(STRIP, '').replace(/\s/g, '');
  if (!s) return null;
  if (/^\d{1,3}(,\d{3})+(\.\d*)?$/.test(s)) {
    s = s.replace(/,/g, ''); // 1,250 or 1,250.50
  } else if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.'); // 1.250,50 (only with a decimal comma: "12.345" stays invalid)
  } else if (/^\d*,\d{0,2}$/.test(s)) {
    s = s.replace(',', '.'); // 12,5
  }
  // At most as many decimals as the currency has: none for the yen or the CFA franc.
  const shape = dp === 0 ? /^\d+\.?$/ : new RegExp(`^(\\d+(\\.\\d{0,${dp}})?|\\.\\d{1,${dp}})$`);
  if (!shape.test(s)) return null;
  const [whole = '', frac = ''] = s.split('.');
  const value = Number(whole || '0') * per + (dp ? Number(frac.padEnd(dp, '0')) : 0);
  return value > 0 && Number.isSafeInteger(value) ? value : null;
}

/** Minor units back to an editable string ("2500", "1250.50"). */
export function amountToInput(minor: number, currency: CurrencyCode): string {
  const { minor: per, decimals } = CURRENCIES[currency];
  const frac = minor % per;
  return frac === 0 ? String(minor / per) : `${Math.floor(minor / per)}.${String(frac).padStart(decimals, '0')}`;
}
