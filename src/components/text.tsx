import { Text, type TextProps, type TextStyle } from 'react-native';

import { type } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';
import type { Palette } from '@/theme/tokens';

type Role = keyof typeof type;
type Tone = 'ink' | 'inkSoft' | 'inkMute' | 'accent' | 'onBrand' | 'onBrandSoft' | 'burgundy' | 'positive' | 'danger' | 'onButton';

export function T({
  variant = 'body',
  tone = 'ink',
  numeric,
  style,
  ...rest
}: TextProps & { variant?: Role; tone?: Tone; numeric?: boolean }) {
  const { c } = useTheme();
  const base: TextStyle = { ...type[variant], color: c[tone as keyof Palette], ...(numeric ? { fontVariant: ['tabular-nums'] } : null) };
  return <Text maxFontSizeMultiplier={2} {...rest} style={[base, style]} />;
}
