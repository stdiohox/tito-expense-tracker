import { useColorScheme } from '@/hooks/use-color-scheme';

import { categoryColors, dark, light, type Palette } from './tokens';
import type { CategoryIcon } from '@/domain/types';

export function useTheme(): { c: Palette; scheme: 'light' | 'dark' } {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
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
