import { Platform } from 'react-native';

import type { CategoryIcon } from '@/domain/types';

/*
 * Tito Finance palette: navy #0B1B3F, Tito indigo #272C77 (brand and primary buttons), French blue
 * #2F5DA8 (links and accents), sky blue #8EC9F0 (glow and the pace line), champagne ivory #F6EFE2
 * (light ground), gold #C89B3C (the one "crown" pop, small marks only) and burgundy #7A1F3D (over
 * budget and errors, always with words). Dark mode is built on the navy.
 * Every text and indicator pair here is checked by scripts/check-contrast.mjs (WCAG AA).
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
  /** The "crown": small highlights and active marks only, never a large fill. Decorative on light grounds. */
  gold: string;
  /** Gold lifted to 3:1 on the brand header, for the pace chart's "today" dot. */
  goldOnBrand: string;
  /** Budget passed. Always paired with words; never an alarm red. */
  burgundy: string;
  positive: string;
  danger: string;
  dangerTint: string;
  /** Non-selected bars in charts (3:1 against ground). */
  barMuted: string;
  chartLine: string;
  chartGhost: string;
  /** Snackbar background, its text and its action ("Undo"). */
  toast: string;
  onToast: string;
  toastAction: string;
  /** Label on the white Welcome button (the brand indigo in both schemes). */
  onWelcomeButton: string;
  /** Switch thumb. */
  thumb: string;
  /** Shadows of the two floating elements (DESIGN.md, Shadow Vocabulary). */
  fabShadow: string;
  toastShadow: string;
  /** Keyboard focus outline on the web build (web-focus.ts). */
  focusRing: string;
};

export const light: Palette = {
  ground: '#F6EFE2',
  surface: '#FFFDF8',
  raised: '#FFFDF8',
  ink: '#0B1B3F',
  inkSoft: '#424F70',
  inkMute: '#5E6A88',
  line: '#E7DFD0',
  fieldBorder: '#838796',
  switchOff: '#838796',
  brand: '#272C77',
  onBrand: '#FFFFFF',
  onBrandSoft: '#C4E0F5',
  accent: '#2F5DA8',
  button: '#272C77',
  onButton: '#FFFFFF',
  buttonPressed: '#1D2160',
  accentTint: '#E3EBF7',
  gold: '#C89B3C',
  goldOnBrand: '#D5B36B',
  burgundy: '#7A1F3D',
  positive: '#2B6E47',
  danger: '#7A1F3D',
  dangerTint: '#F5E3E8',
  barMuted: '#6C88BA',
  chartLine: '#8EC9F0',
  chartGhost: 'rgba(255,255,255,0.45)',
  toast: '#0B1B3F',
  onToast: '#FFFFFF',
  toastAction: '#8EC9F0',
  onWelcomeButton: '#272C77',
  thumb: '#FFFFFF',
  fabShadow: '#0B1B3F',
  toastShadow: '#000000',
  focusRing: '#2F5DA8',
};

export const dark: Palette = {
  ground: '#0B1B3F',
  surface: '#122752',
  raised: '#1A3262',
  ink: '#F6EFE2',
  inkSoft: '#ADB4C5',
  inkMute: '#8992AD',
  line: '#1F3363',
  fieldBorder: '#667599',
  switchOff: '#667599',
  brand: '#1E2263',
  onBrand: '#FFFFFF',
  onBrandSoft: '#B4D3EE',
  accent: '#8EC9F0',
  button: '#AEB3FF',
  onButton: '#0B1B3F',
  buttonPressed: '#9198F2',
  accentTint: '#1C3A6B',
  gold: '#C89B3C',
  goldOnBrand: '#C89B3C',
  burgundy: '#E58AA3',
  positive: '#86D0A4',
  danger: '#E58AA3',
  dangerTint: '#3A1830',
  barMuted: '#4A6B99',
  chartLine: '#8EC9F0',
  chartGhost: 'rgba(255,255,255,0.4)',
  toast: '#1A3262',
  onToast: '#FFFFFF',
  toastAction: '#8EC9F0',
  onWelcomeButton: '#272C77',
  thumb: '#FFFFFF',
  fabShadow: '#000000',
  toastShadow: '#000000',
  focusRing: '#8EC9F0',
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
