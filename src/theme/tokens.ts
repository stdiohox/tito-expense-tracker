import { Platform } from 'react-native';

import type { CategoryIcon } from '@/domain/types';

/*
 * Tito Finance palette (redesign): deep navy #141033, royal blue #2631AD (brand, primary buttons),
 * electric blue #2F5BE7 (gradient, links, active tab, progress), icy blue #CBE9FD (light-mode
 * gradient end, light tints), aqua mint #2AFFCC (the ONE pop: today, active dots, % badges, success;
 * only on dark or blue surfaces, with teal popOnGround for light ones), white, and burgundy/rose for
 * over-budget and errors (always with words). Dark mode is built on the deep navy.
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
  /** Brand surfaces (Home header, onboarding): solid fallback, and the gradient BrandGradient draws. */
  brand: string;
  brandStart: string;
  brandMid: string;
  brandEnd: string;
  /** Soft highlight in the top-right corner of the gradient. */
  brandGlow: string;
  /** Colour the gradient's bottom band fades to (icy blue in light mode, the ground in dark). */
  brandFade: string;
  onBrand: string;
  onBrandSoft: string;
  /** Glass cards on the gradient: a translucent navy tint (see glass) with a light edge. */
  glassTint: string;
  glassEdge: string;
  /** Interactive accent on ground/surface: links, active tab, progress fills, selection. */
  accent: string;
  /** Primary button fill and its label. */
  button: string;
  onButton: string;
  buttonPressed: string;
  accentTint: string;
  /** The ONE pop (aqua mint). Only on dark or blue surfaces: today dot, active dots, success. */
  pop: string;
  /** The pop as it may appear on this scheme's ground and surface (teal in light, mint in dark). */
  popOnGround: string;
  /** Percent badges: background and text. */
  badge: string;
  onBadge: string;
  /** Budget passed and errors. Always paired with words; never an alarm red. */
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
  /** Label on the white onboarding button (royal blue in both schemes). */
  onWelcomeButton: string;
  /** Switch thumb. */
  thumb: string;
  /** Shadows of the floating elements (DESIGN.md, Shadow Vocabulary). */
  fabShadow: string;
  toastShadow: string;
  /** Keyboard focus outline on the web build (web-focus.ts). */
  focusRing: string;
  /** The floating dock: frosted white glass in both modes (see dockGlass); its content uses the light palette. */
  dock: string;
  /** Initials avatar on the brand gradient: icy disc, navy letters. */
  avatar: string;
  onAvatar: string;
};

export const light: Palette = {
  ground: '#F1F5FC',
  surface: '#FFFFFF',
  raised: '#FFFFFF',
  ink: '#141033',
  inkSoft: '#4D4E74',
  inkMute: '#69698B',
  line: '#E1E7F3',
  fieldBorder: '#8589A7',
  switchOff: '#8589A7',
  brand: '#2631AD',
  brandStart: '#141033',
  brandMid: '#2631AD',
  brandEnd: '#2F5BE7',
  brandGlow: '#CBE9FD',
  brandFade: '#CBE9FD',
  onBrand: '#FFFFFF',
  onBrandSoft: '#E1EAFB',
  glassTint: '#141033',
  glassEdge: '#FFFFFF',
  accent: '#2F5BE7',
  button: '#2631AD',
  onButton: '#FFFFFF',
  buttonPressed: '#1C2589',
  accentTint: '#E2EEFD',
  pop: '#2AFFCC',
  popOnGround: '#0D7B62',
  badge: '#E9FFFA',
  onBadge: '#0D7B62',
  burgundy: '#7A1F3D',
  positive: '#2B6E47',
  danger: '#7A1F3D',
  dangerTint: '#F7E3E9',
  barMuted: '#7A86D0',
  chartLine: '#CBE9FD',
  chartGhost: 'rgba(255,255,255,0.45)',
  toast: '#141033',
  onToast: '#FFFFFF',
  toastAction: '#CBE9FD',
  onWelcomeButton: '#2631AD',
  thumb: '#FFFFFF',
  fabShadow: '#141033',
  toastShadow: '#000000',
  focusRing: '#2F5BE7',
  dock: '#FFFFFF',
  avatar: '#CBE9FD',
  onAvatar: '#141033',
};

export const dark: Palette = {
  ground: '#141033',
  surface: '#1E1A4A',
  raised: '#29245E',
  ink: '#F4F5FF',
  inkSoft: '#B7B9D8',
  inkMute: '#9194B6',
  line: '#2C2862',
  fieldBorder: '#6A6999',
  switchOff: '#6A6999',
  brand: '#1F2690',
  brandStart: '#141033',
  brandMid: '#1F2690',
  brandEnd: '#2A50CF',
  brandGlow: '#CBE9FD',
  brandFade: '#141033',
  onBrand: '#FFFFFF',
  onBrandSoft: '#C6D8F8',
  glassTint: '#141033',
  glassEdge: '#FFFFFF',
  accent: '#7693EF',
  button: '#3560E8',
  onButton: '#FFFFFF',
  buttonPressed: '#2631AD',
  accentTint: '#212665',
  pop: '#2AFFCC',
  popOnGround: '#2AFFCC',
  badge: '#10383F',
  onBadge: '#2AFFCC',
  burgundy: '#E58AA3',
  positive: '#86D0A4',
  danger: '#E58AA3',
  dangerTint: '#3A1838',
  barMuted: '#505FAD',
  chartLine: '#CBE9FD',
  chartGhost: 'rgba(255,255,255,0.4)',
  toast: '#29245E',
  onToast: '#FFFFFF',
  toastAction: '#CBE9FD',
  onWelcomeButton: '#2631AD',
  thumb: '#FFFFFF',
  fabShadow: '#000000',
  toastShadow: '#000000',
  focusRing: '#7693EF',
  dock: '#FFFFFF',
  avatar: '#CBE9FD',
  onAvatar: '#141033',
};

/**
 * Geometry of the brand gradient, shared by BrandGradient and the contrast check: where the middle
 * stop sits, the peak opacity of the icy top-right glow and of the white bottom-left sheen, and the
 * height of the bottom band (no content sits in it) that fades to brandFade.
 */
export const brandGradient = {
  mid: { light: 0.45, dark: 0.5 },
  glow: { light: 0.22, dark: 0.14 },
  sheen: { light: 0.06, dark: 0.04 },
  /**
   * Optional white flare in the top-right corner (screen heroes): peak opacity, fading to 0 at
   * flareRadius of the box. Heroes keep text out of that corner, so text contrast is unaffected.
   */
  flare: { light: 0.55, dark: 0.45 },
  flareRadius: 0.32,
  fade: 28,
} as const;

/**
 * Frosted glass on the gradient: a navy tint, then a white frost over it, and a light edge.
 * 10% frost is the most that keeps white, soft and mint text at AA over every point of the
 * gradient (check-contrast.mjs); the frosted look also comes from the edge and a top highlight.
 */
export const glass = {
  tint: { light: 0.25, dark: 0.3 },
  frost: { light: 0.1, dark: 0.1 },
  edge: { light: 0.32, dark: 0.28 },
} as const;

/**
 * The dock's frosted white glass: fill opacity, and the ink-tinted edge. 94% is the most see-through
 * the dock can be while its grey labels stay at AA even when deep navy scrolls behind it
 * (check-contrast.mjs); the glass look also comes from the edge, a top highlight and the shadow.
 */
export const dockGlass = {
  fill: { light: 0.94, dark: 0.94 },
  edge: { light: 0.1, dark: 0.1 },
} as const;

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
export const radius = { s: 8, m: 12, l: 16, xl: 20, xxl: 28, pill: 999 } as const;

/** Outfit in three weights. Its `tnum` feature gives every digit the same width (590 units). */
export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
} as const;

/** Type roles (sizes in pt; scaled by the OS font-size setting). Amounts add tabular figures. */
export const type = {
  hero: { fontFamily: fonts.semibold, fontSize: 40, lineHeight: 46, letterSpacing: -0.8 },
  total: { fontFamily: fonts.semibold, fontSize: 44, lineHeight: 50, letterSpacing: -1 },
  largeTitle: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  sub: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
} as const;
