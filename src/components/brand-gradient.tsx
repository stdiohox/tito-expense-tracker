import { useId } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { brandGlowOpacity } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The brand surface (Home header, Welcome): a static diagonal gradient, navy (top left) to Tito
 * indigo to French blue (bottom right), with a soft sky-blue glow in the top-right corner, where
 * there is no text. Never animated, so there is nothing for Reduce Motion to turn off.
 * scripts/check-contrast.mjs samples this exact geometry, so keep the two in step.
 */
export function BrandGradient({ style, children, ...rest }: ViewProps) {
  const { c, scheme } = useTheme();
  // Gradient ids are global in the web DOM; useId keeps two instances apart (minus its colons).
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View style={[{ backgroundColor: c.brand, overflow: 'hidden' }, style]} {...rest}>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants">
        <Defs>
          <LinearGradient id={`${id}base`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0" stopColor={c.brandStart} />
            <Stop offset="0.5" stopColor={c.brandMid} />
            <Stop offset="1" stopColor={c.brandEnd} />
          </LinearGradient>
          <RadialGradient id={`${id}glow`} cx="100%" cy="0%" fx="100%" fy="0%" r="60%">
            <Stop offset="0" stopColor={c.brandGlow} stopOpacity={brandGlowOpacity[scheme]} />
            <Stop offset="1" stopColor={c.brandGlow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}base)`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}glow)`} />
      </Svg>
      {children}
    </View>
  );
}
