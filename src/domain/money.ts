import type { CurrencyCode } from './types';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; minor: number }> = {
  NGN: { symbol: '₦', name: 'Nigerian naira', minor: 100 },
  USD: { symbol: '$', name: 'US dollar', minor: 100 },
};

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
 * ₦184,500 or ₦1,250.50. Decimals only when the amount has them.
 * Hand-rolled rather than Intl so output is identical on Hermes (iOS/Android) and web.
 */
export function formatMoney(
  minor: number,
  currency: CurrencyCode,
  opts: { compact?: boolean; signed?: boolean } = {},
): string {
  const { symbol, minor: per } = CURRENCIES[currency];
  const value = Math.round(minor);
  const neg = value < 0;
  const abs = Math.abs(value);
  let body = opts.compact ? compactBody(abs, per) : null;
  if (body === null) {
    const whole = Math.floor(abs / per);
    const frac = abs % per;
    body = frac === 0 ? group(whole) : `${group(whole)}.${String(frac).padStart(2, '0')}`;
  }
  const sign = neg ? '−' : opts.signed ? '+' : '';
  return `${sign}${symbol}${body}`;
}

/**
 * Parse what the user typed into minor units; null if invalid.
 * Accepts "2500", "2,500", "1,250.50", "1250.5", ".5", "5." and a decimal comma
 * ("12,5", "1.250,50") as typed on comma-decimal phone keyboards. Commas count as
 * thousands separators only in thousands positions, so "12,5" is 12.50, never 125.
 */
export function parseAmount(input: string, currency: CurrencyCode): number | null {
  let s = input.replace(/[\s₦$]/g, '');
  if (!s) return null;
  if (/^\d{1,3}(,\d{3})+(\.\d{0,2})?$/.test(s)) {
    s = s.replace(/,/g, ''); // 1,250 or 1,250.50
  } else if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.'); // 1.250,50 (only with a decimal comma: "12.345" stays invalid)
  } else if (/^\d*,\d{0,2}$/.test(s)) {
    s = s.replace(',', '.'); // 12,5
  }
  if (!/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(s)) return null;
  const [whole = '', frac = ''] = s.split('.');
  const per = CURRENCIES[currency].minor;
  const value = Number(whole || '0') * per + Number(frac.padEnd(2, '0'));
  return value > 0 && Number.isSafeInteger(value) ? value : null;
}

/** Minor units back to an editable string ("2500", "1250.50"). */
export function amountToInput(minor: number, currency: CurrencyCode): string {
  const per = CURRENCIES[currency].minor;
  const frac = minor % per;
  return frac === 0 ? String(minor / per) : `${Math.floor(minor / per)}.${String(frac).padStart(2, '0')}`;
}
