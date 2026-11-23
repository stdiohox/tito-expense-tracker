import { Platform } from 'react-native';

import type { CategoryIcon } from '@/domain/types';

/*
 * Tito Finance brand: indigo #272c77 (primary), clay #C75D3F and gold #C89B3C (supporting).
 * Light ground is a cool near-white leaning to the indigo hue, not the web tracker's cream.
 * Every text colour here is checked by scripts/check-contrast.mjs (WCAG AA).
 */

export type Palette = {
  ground: string;
  surface: string;
  raised: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  line: string;
  /** Resting border of text fields: 3:1 against surface and ground (WCAG 1.4.11). */
  fieldBorder: string;
  /** Switch track when off: 3:1 against surface, and the white thumb 3:1 against it. */
  switchOff: string;
  /** Brand header and auth welcome. */
  brand: string;
  onBrand: string;
  onBrandSoft: string;
  /** Interactive accent on ground/surface: links, icons, selection. */
  accent: string;
  /** Primary button fill and its label. */
  button: string;
  onButton: string;
  buttonPressed: string;
  accentTint: string;
  /** "Today" marker only. */
  gold: string;
  /** Budget passed. Never used as an alarm red. */
  clay: string;
  clayTint: string;
  positive: string;
  danger: string;
  dangerTint: string;
  /** Non-selected bars in charts (3:1 against ground). */
  barMuted: string;
  chartLine: string;
  chartGhost: string;
  chartFill: string;
  scrim: string;
};

export const light: Palette = {
  ground: '#F5F6FB',
  surface: '#FFFFFF',
  raised: '#FFFFFF',
  ink: '#14163A',
  inkSoft: '#43476A',
  inkMute: '#5E6283',
  line: '#E3E5F0',
  fieldBorder: '#878BA5',
  switchOff: '#878BA5',
  brand: '#272C77',
  onBrand: '#FFFFFF',
  onBrandSoft: '#C8CBF0',
  accent: '#2F359A',
  button: '#272C77',
  onButton: '#FFFFFF',
  buttonPressed: '#1D2160',
  accentTint: '#EBECF8',
  gold: '#E0B04C',
  clay: '#A4462A',
  clayTint: '#F8E7E1',
  positive: '#2B6E47',
  danger: '#A4462A',
  dangerTint: '#F8E7E1',
  barMuted: '#8589B8',
  chartLine: '#FFFFFF',
  chartGhost: 'rgba(255,255,255,0.45)',
  chartFill: 'rgba(255,255,255,0.16)',
  scrim: 'rgba(20,22,58,0.4)',
};

export const dark: Palette = {
  ground: '#0D0E22',
  surface: '#16183A',
  raised: '#1E2148',
  ink: '#F1F2FA',
  inkSoft: '#BEC1DB',
  inkMute: '#9A9EBE',
  line: '#2A2D58',
  fieldBorder: '#63678C',
  switchOff: '#63678C',
  brand: '#1E2263',
  onBrand: '#FFFFFF',
  onBrandSoft: '#B9BDEB',
  accent: '#AEB3FF',
  button: '#AEB3FF',
  onButton: '#14163A',
  buttonPressed: '#9198F2',
  accentTint: '#262A5E',
  gold: '#E7BE62',
  clay: '#F0947B',
  clayTint: '#3A2430',
  positive: '#86D0A4',
  danger: '#F0947B',
  dangerTint: '#3A2430',
  barMuted: '#5E63A0',
  chartLine: '#FFFFFF',
  chartGhost: 'rgba(255,255,255,0.4)',
  chartFill: 'rgba(174,179,255,0.18)',
  scrim: 'rgba(0,0,0,0.55)',
};

/** Category icon colour per scheme; the disc behind it is the same hue at low alpha. */
export const categoryColors: Record<CategoryIcon, { light: string; dark: string }> = {
  rent: { light: '#3443A0', dark: '#9EA8F6' },
  food: { light: '#2B6E47', dark: '#86D0A4' },
  transport: { light: '#1D5C94', dark: '#86BDEB' },
  bills: { light: '#87600F', dark: '#E7BE62' },
  airtime: { light: '#5A3E9E', dark: '#BBA6F1' },
  family: { light: '#A4462A', dark: '#F0947B' },
  faith: { light: '#77502F', dark: '#DDB591' },
  personal: { light: '#9C3A67', dark: '#EE9FC4' },
  health: { light: '#A53737', dark: '#F29C9C' },
  entertainment: { light: '#246868', dark: '#80CFCF' },
  shopping: { light: '#843D9C', dark: '#DCA3EE' },
  other: { light: '#53577A', dark: '#B3B6CF' },
  savings: { light: '#2B6E47', dark: '#86D0A4' },
  education: { light: '#1D5C94', dark: '#86BDEB' },
  gift: { light: '#9C3A67', dark: '#EE9FC4' },
  business: { light: '#3443A0', dark: '#9EA8F6' },
};

/** Minimum touch target: 44 pt on iOS, 48 dp on Android. */
export const TARGET = Platform.select({ android: 48, default: 44 });

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32, huge: 44 } as const;
export const radius = { s: 8, m: 12, l: 16, pill: 999 } as const;

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
  display: 'Fraunces_600SemiBold',
} as const;

/** Type roles (sizes in pt; scaled by the OS font-size setting). */
export const type = {
  total: { fontFamily: fonts.display, fontSize: 44, lineHeight: 50, letterSpacing: -0.6 },
  largeTitle: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  title: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  headline: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  sub: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
} as const;
