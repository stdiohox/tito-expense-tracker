import { describe, expect, it } from '@jest/globals';
import { addDays, addMonths, dayKey, dayLabel, dayOfMonth, daysInMonth, monthKey, monthName, monthOfDay, todayKey } from '@/domain/dates';

// Jest runs in Africa/Lagos (UTC+1, no daylight saving), the time zone that broke the web
// tracker: toISOString() turned local midnight into the previous day.

describe('local calendar keys in Lagos', () => {
  it('is running in Lagos', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Africa/Lagos');
  });

  it('keeps just-after-midnight on the right day (bug B3)', () => {
    expect(dayKey(new Date(2026, 10, 10, 0, 30))).toBe('2026-11-10');
    expect(dayKey(new Date(2026, 10, 10, 0, 0, 0))).toBe('2026-11-10');
    expect(todayKey(new Date(2026, 0, 1, 0, 1))).toBe('2026-01-01');
  });

  it('keeps the 1st of the month in its month (bug B1)', () => {
    expect(monthKey(new Date(2026, 11, 1, 0, 5))).toBe('2026-12');
    expect(monthKey(new Date(2026, 10, 30, 23, 59))).toBe('2026-11');
  });
});

describe('month arithmetic', () => {
  it('moves across year ends', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2027-01', -1)).toBe('2026-12');
    expect(addMonths('2026-11', -24)).toBe('2024-11');
  });

  it('never skips a short month', () => {
    expect(addMonths('2026-03', -1)).toBe('2026-02');
    expect(addMonths('2026-01', 1)).toBe('2026-02');
  });

  it('knows month lengths, including leap years', () => {
    expect(daysInMonth('2028-02')).toBe(29);
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2026-11')).toBe(30);
    expect(daysInMonth('2026-12')).toBe(31);
  });
});

describe('days', () => {
  it('adds days across months and years', () => {
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('reads parts of a day key', () => {
    expect(dayOfMonth('2026-11-09')).toBe(9);
    expect(monthOfDay('2026-11-09')).toBe('2026-11');
    expect(monthName('2026-11')).toBe('November');
  });

  it('labels today and yesterday by the local clock', () => {
    const now = new Date(2026, 10, 26, 0, 15); // 00:15 in Lagos
    expect(dayLabel('2026-11-26', now)).toBe('Today');
    expect(dayLabel('2026-11-25', now)).toBe('Yesterday');
  });
});
