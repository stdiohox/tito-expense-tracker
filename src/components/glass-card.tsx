import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { glass, radius, space } from '@/theme/tokens';
import { hexAlpha, useTheme } from '@/theme/use-theme';

/**
 * A frosted glass card for the brand gradient: a navy tint, a white frost over it, a light edge,
 * a brighter highlight along the top and a small two-circle mark in the top-right corner. Plain
 * translucent fills rather than a blur, so it looks the same in Expo Go, on Android and on the
 * web. The tint and frost are set so white, soft and mint text on it stay above AA
 * (check-contrast.mjs); the highlight and the mark are decorative and carry no text.
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
          overflow: 'hidden',
        },
        style,
      ]}>
      <View
        accessible={false}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: hexAlpha(c.glassEdge, glass.frost[scheme]) }} />
        <View style={{ position: 'absolute', top: 0, left: space.l, right: space.l, height: 1, backgroundColor: hexAlpha(c.glassEdge, 0.55) }} />
        <View style={{ position: 'absolute', top: space.l, right: space.l + 14, width: 24, height: 24, borderRadius: 12, backgroundColor: hexAlpha(c.glassEdge, 0.28) }} />
        <View style={{ position: 'absolute', top: space.l, right: space.l, width: 24, height: 24, borderRadius: 12, backgroundColor: hexAlpha(c.brandGlow, 0.5) }} />
      </View>
      {children}
    </View>
  );
}
