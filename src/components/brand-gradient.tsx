import { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { brandGradient } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The brand surface (Home header, onboarding): a static diagonal gradient, deep navy (top left)
 * through royal blue to electric blue (bottom right), with two soft light highlights: an icy-blue
 * glow in the top-right corner and a faint white sheen bottom-left. With `fade`, a band at the
 * bottom melts into brandFade (icy blue in light mode, the navy ground in dark) or `fadeTo`; BrandGradient adds
 * that band's height below its children, so no content ever sits on it.
 * With `flare`, a brighter white highlight fills the top-right corner (the hero look); keep text
 * out of that corner (brandGradient.flareRadius of the box).
 * Never animated. scripts/check-contrast.mjs samples this exact geometry; keep the two in step.
 *
 * Only SVG props go on <Svg>: on the web, react-native-svg forwards every prop to the DOM <svg>.
 * Screen-reader hiding and touch pass-through live on the wrapping View.
 */
export function BrandGradient({
  style,
  children,
  fade,
  fadeTo,
  flare,
  ...rest
}: ViewProps & { fade?: boolean; fadeTo?: string; flare?: boolean }) {
  const { c, scheme } = useTheme();
  // Gradient ids are global in the web DOM; useId keeps two instances apart (minus its colons).
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };
  const band = brandGradient.fade;

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
                <Stop offset={brandGradient.mid[scheme]} stopColor={c.brandMid} />
                <Stop offset="1" stopColor={c.brandEnd} />
              </LinearGradient>
              <RadialGradient id={`${id}glow`} cx="100%" cy="0%" fx="100%" fy="0%" r="65%">
                <Stop offset="0" stopColor={c.brandGlow} stopOpacity={brandGradient.glow[scheme]} />
                <Stop offset="1" stopColor={c.brandGlow} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`${id}sheen`} cx="0%" cy="100%" fx="0%" fy="100%" r="55%">
                <Stop offset="0" stopColor={c.onBrand} stopOpacity={brandGradient.sheen[scheme]} />
                <Stop offset="1" stopColor={c.onBrand} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`${id}flare`} cx="100%" cy="0%" fx="100%" fy="0%" r={`${brandGradient.flareRadius * 100}%`}>
                <Stop offset="0" stopColor={c.onBrand} stopOpacity={brandGradient.flare[scheme]} />
                <Stop offset="1" stopColor={c.onBrand} stopOpacity={0} />
              </RadialGradient>
              <LinearGradient id={`${id}fade`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0" stopColor={fadeTo ?? c.brandFade} stopOpacity={0} />
                <Stop offset="1" stopColor={fadeTo ?? c.brandFade} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={size.w} height={size.h} fill={`url(#${id}base)`} />
            <Rect x={0} y={0} width={size.w} height={size.h} fill={`url(#${id}glow)`} />
            <Rect x={0} y={0} width={size.w} height={size.h} fill={`url(#${id}sheen)`} />
            {flare ? <Rect x={0} y={0} width={size.w} height={size.h} fill={`url(#${id}flare)`} /> : null}
            {fade ? <Rect x={0} y={size.h - band} width={size.w} height={band} fill={`url(#${id}fade)`} /> : null}
          </Svg>
        ) : null}
      </View>
      {children}
      {fade ? <View style={{ height: band }} /> : null}
    </View>
  );
}
