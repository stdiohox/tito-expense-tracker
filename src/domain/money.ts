import { CURRENCY_CODES, type CurrencyCode } from './types';

/** Picker groups, in display order. */
export const REGIONS = ['Africa', 'Europe', 'Americas', 'Middle East and Asia', 'Oceania'] as const;
export type Region = (typeof REGIONS)[number];

export type Currency = {
  /** Shown before the amount: "₦", "$", "KSh". */
  symbol: string;
  /** A space between symbol and amount, for letter symbols: "KSh 1,200", "USh 5,000". */
  spaced: boolean;
  name: string;
  /** Flag emoji and the country or area shown in the picker. */
  flag: string;
  country: string;
  region: Region;
  /** Every country or place that uses it, so the picker search finds it by any of them. */
  places: string[];
  /** Digits after the decimal point (ISO 4217): 2 for most; 0 for XAF, XOF, UGX and JPY. */
  decimals: number;
  /** Minor units per whole unit: 10 ** decimals. */
  minor: number;
  /**
   * Differences smaller than this (minor units) read as "about the same" when comparing months,
   * roughly a dollar's worth, so the wording means the same thing in every currency.
   */
  sameBelow: number;
};

const cur = (
  symbol: string,
  name: string,
  flag: string,
  country: string,
  region: Region,
  places: string[],
  decimals: number,
  sameBelowWhole: number,
  spaced = false,
): Currency => ({ symbol, spaced, name, flag, country, region, places, decimals, minor: 10 ** decimals, sameBelow: sameBelowWhole * 10 ** decimals });

/**
 * Every supported currency, in picker order. Symbols never clash: $ is the US dollar; CA$, A$,
 * CN¥ and ¥ tell the others apart, and the two CFA francs are FCFA (central) and CFA (west).
 */
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  // Africa
  NGN: cur('₦', 'Nigerian naira', '🇳🇬', 'Nigeria', 'Africa', ['Nigeria'], 2, 100),
  GHS: cur('GH₵', 'Ghanaian cedi', '🇬🇭', 'Ghana', 'Africa', ['Ghana'], 2, 10),
  KES: cur('KSh', 'Kenyan shilling', '🇰🇪', 'Kenya', 'Africa', ['Kenya'], 2, 100, true),
  ZAR: cur('R', 'South African rand', '🇿🇦', 'South Africa', 'Africa', ['South Africa'], 2, 10),
  XAF: cur('FCFA', 'Central African CFA franc', '🌍', 'Central Africa (CEMAC)', 'Africa',
    ['Cameroon', 'Gabon', 'Chad', 'Congo', 'Republic of the Congo', 'Central African Republic', 'Equatorial Guinea'], 0, 500, true),
  XOF: cur('CFA', 'West African CFA franc', '🌍', 'West Africa (UEMOA)', 'Africa',
    ['Senegal', "Côte d'Ivoire", 'Ivory Coast', 'Mali', 'Burkina Faso', 'Benin', 'Togo', 'Niger', 'Guinea-Bissau'], 0, 500, true),
  EGP: cur('E£', 'Egyptian pound', '🇪🇬', 'Egypt', 'Africa', ['Egypt'], 2, 50),
  MAD: cur('MAD', 'Moroccan dirham', '🇲🇦', 'Morocco', 'Africa', ['Morocco'], 2, 10, true),
  UGX: cur('USh', 'Ugandan shilling', '🇺🇬', 'Uganda', 'Africa', ['Uganda'], 0, 3_000, true),
  TZS: cur('TSh', 'Tanzanian shilling', '🇹🇿', 'Tanzania', 'Africa', ['Tanzania', 'Zanzibar'], 2, 2_000, true),
  // Europe
  EUR: cur('€', 'Euro', '🇪🇺', 'Euro area', 'Europe',
    ['Euro area', 'Eurozone', 'European Union', 'Europe', 'Germany', 'Austria', 'Finland', 'Portugal', 'Italy', 'France', 'Spain', 'Ireland', 'Netherlands', 'Belgium'], 2, 1),
  GBP: cur('£', 'British pound', '🇬🇧', 'United Kingdom', 'Europe', ['United Kingdom', 'UK', 'Britain', 'Great Britain', 'England', 'Scotland', 'Wales', 'Northern Ireland'], 2, 1),
  // Americas
  USD: cur('$', 'US dollar', '🇺🇸', 'United States', 'Americas', ['United States', 'USA', 'US', 'America'], 2, 1),
  CAD: cur('CA$', 'Canadian dollar', '🇨🇦', 'Canada', 'Americas', ['Canada'], 2, 1),
  // Middle East and Asia
  AED: cur('AED', 'UAE dirham', '🇦🇪', 'United Arab Emirates', 'Middle East and Asia', ['UAE', 'United Arab Emirates', 'Dubai', 'Abu Dhabi'], 2, 5, true),
  SAR: cur('SAR', 'Saudi riyal', '🇸🇦', 'Saudi Arabia', 'Middle East and Asia', ['Saudi Arabia', 'KSA'], 2, 5, true),
  INR: cur('₹', 'Indian rupee', '🇮🇳', 'India', 'Middle East and Asia', ['India'], 2, 100),
  JPY: cur('¥', 'Japanese yen', '🇯🇵', 'Japan', 'Middle East and Asia', ['Japan'], 0, 100),
  CNY: cur('CN¥', 'Chinese yuan', '🇨🇳', 'China', 'Middle East and Asia', ['China'], 2, 10),
  // Oceania
  AUD: cur('A$', 'Australian dollar', '🇦🇺', 'Australia', 'Oceania', ['Australia'], 2, 1),
};

export const isKnownCurrency = (code: string): code is CurrencyCode => Object.prototype.hasOwnProperty.call(CURRENCIES, code);

/**
 * Details for any currency code. A code that is no longer on the list (from older saved data)
 * still works: it shows as its code ("XYZ 2,500") with two decimals, and is never dropped.
 */
export function currencyInfo(code: string): Currency {
  return isKnownCurrency(code) ? CURRENCIES[code] : cur(code, code, '🏳️', 'Other', 'Africa', [], 2, 1, true);
}

/** Lower case, accents and punctuation removed: "Côte d'Ivoire" matches "cote divoire". */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9$£€¥₦₵₹]+/g, '');

/** Codes whose code, name, symbol, country or any place using it contains `query`, in list order. */
export function searchCurrencies(query: string): CurrencyCode[] {
  const q = fold(query);
  if (!q) return [...CURRENCY_CODES];
  return CURRENCY_CODES.filter((code) => {
    const k = CURRENCIES[code];
    return [code, k.name, k.symbol, k.country, ...k.places].some((t) => fold(t).includes(q));
  });
}

/** Every symbol and code, longest first, so "CA$" is stripped before "$" and "FCFA" before "CFA". */
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
  const { symbol, spaced, minor: per, decimals } = currencyInfo(currency);
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
  const { minor: per, decimals: dp } = currencyInfo(currency);
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
  const { minor: per, decimals } = currencyInfo(currency);
  const frac = minor % per;
  return frac === 0 ? String(minor / per) : `${Math.floor(minor / per)}.${String(frac).padStart(decimals, '0')}`;
}
