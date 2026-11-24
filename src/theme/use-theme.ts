import { createContext, createElement, useContext, type ReactNode } from 'react';

import type { AppearanceMode, CategoryIcon } from '@/domain/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { categoryColors, dark, light, type Palette } from './tokens';

const ModeCtx = createContext<AppearanceMode>('system');

/**
 * The user's Appearance choice (Settings). The root layout fills it from the store, so the theme
 * layer never reads data itself. "system" follows the phone; "light" and "dark" force one.
 */
export function AppearanceProvider({ mode, children }: { mode: AppearanceMode; children: ReactNode }) {
  return createElement(ModeCtx.Provider, { value: mode }, children);
}

export function useTheme(): { c: Palette; scheme: 'light' | 'dark' } {
  const system = useColorScheme();
  const mode = useContext(ModeCtx);
  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return { c: scheme === 'dark' ? dark : light, scheme };
}

export function useCategoryColor(icon: CategoryIcon): { fg: string; bg: string } {
  const { scheme } = useTheme();
  const fg = categoryColors[icon][scheme];
  return { fg, bg: hexAlpha(fg, scheme === 'dark' ? 0.18 : 0.12) };
}

export function hexAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
