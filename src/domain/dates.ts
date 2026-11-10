import type { DayKey, MonthKey } from './types';

/*
 * All calendar maths uses the device's local date parts, never toISOString().
 * The web tracker built month keys with toISOString(), which is UTC: in Lagos (UTC+1)
 * "next month" stayed put, "previous" skipped a month, and between midnight and 1 am
 * the default date was yesterday (PLAN.md bugs B1 and B3).
 */

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(d: Date): DayKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` as DayKey;
}

export function monthKey(d: Date): MonthKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}` as MonthKey;
}

export function todayKey(now: Date = new Date()): DayKey {
  return dayKey(now);
}

export function parseMonth(m: MonthKey): { year: number; month: number } {
  const [y, mm] = m.split('-');
  return { year: Number(y), month: Number(mm) };
}

export function parseDay(d: DayKey): Date {
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(y, m - 1, dd);
}

export function monthOfDay(d: DayKey): MonthKey {
  return d.slice(0, 7) as MonthKey;
}

export function addMonths(m: MonthKey, delta: number): MonthKey {
  const { year, month } = parseMonth(m);
  // Day 1 at local midnight never overflows into a neighbouring month.
  return monthKey(new Date(year, month - 1 + delta, 1));
}

export function daysInMonth(m: MonthKey): number {
  const { year, month } = parseMonth(m);
  return new Date(year, month, 0).getDate();
}

export function dayOfMonth(d: DayKey): number {
  return Number(d.slice(8, 10));
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function monthName(m: MonthKey): string {
  return MONTHS[parseMonth(m).month - 1];
}

export function monthLabel(m: MonthKey, now: Date = new Date()): string {
  const { year } = parseMonth(m);
  return year === now.getFullYear() ? monthName(m) : `${monthName(m)} ${year}`;
}

export function shortMonth(m: MonthKey): string {
  return monthName(m).slice(0, 3);
}

/** "Today", "Yesterday", "Monday 3 November". */
export function dayLabel(d: DayKey, now: Date = new Date()): string {
  const today = dayKey(now);
  const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (d === today) return 'Today';
  if (d === dayKey(y)) return 'Yesterday';
  const date = parseDay(d);
  const base = `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear() ? base : `${base} ${date.getFullYear()}`;
}

/** "9 Nov". */
export function shortDay(d: DayKey): string {
  const date = parseDay(d);
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

export function addDays(d: DayKey, delta: number): DayKey {
  const date = parseDay(d);
  return dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta));
}
