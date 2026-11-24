import { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { brandGlowOpacity } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The brand surface (Home header, Welcome): a static diagonal gradient, navy (top left) to Tito
 * indigo to French blue (bottom right), with a soft sky-blue glow in the top-right corner, where
 * there is no text. Never animated, so there is nothing for Reduce Motion to turn off.
 * scripts/check-contrast.mjs samples this exact geometry, so keep the two in step.
 *
 * Only SVG props go on <Svg>: on the web, react-native-svg forwards every prop to the DOM <svg>,
 * so React Native props such as `accessible` or `importantForAccessibility` break there. Hiding
 * from screen readers and letting touches through is done on the wrapping View instead. Like
 * PaceChart, the drawing waits for a measured size and gets plain numbers for width and height.
 */
export function BrandGradient({ style, children, ...rest }: ViewProps) {
  const { c, scheme } = useTheme();
  // Gradient ids are global in the web DOM; useId keeps two instances apart (minus its colons).
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  return (
    <View style={[{ backgroundColor: c.brand, overflow: 'hidden' }, style]} {...rest}>
      <View
        onLayout={onLayout}
        accessible={false}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {size.w > 0 && size.h > 0 ? (
          <Svg width={size.w} height={size.h}>
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
            <Rect x={0} y={0} width={size.w} height={size.h} fill={`url(#${id}base)`} />
            <Rect x={0} y={0} width={size.w} height={size.h} fill={`url(#${id}glow)`} />
          </Svg>
        ) : null}
      </View>
      {children}
    </View>
  );
}
