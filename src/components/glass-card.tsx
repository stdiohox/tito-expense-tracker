import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { glass, radius, space } from '@/theme/tokens';
import { hexAlpha, useTheme } from '@/theme/use-theme';

/**
 * A glass card for the brand gradient: a translucent navy tint with a thin light edge. A plain
 * translucent fill rather than a blur, so it looks the same in Expo Go, on Android and on the web;
 * the tint darkens what is behind it, which keeps white text on it above AA (check-contrast.mjs).
 */
export function GlassCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, scheme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: hexAlpha(c.glassTint, glass.tint[scheme]),
          borderColor: hexAlpha(c.glassEdge, glass.edge[scheme]),
          borderWidth: 1,
          borderRadius: radius.xl,
          padding: space.l,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
