import type { ReactNode } from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

/**
 * Fades a section in and lifts it 12px when a screen first appears. `order` staggers sections
 * (70ms apart, capped so long lists don't wait). With Reduce Motion on, it simply appears.
 *
 * Web uses the stock FadeInDown: custom initial values give the animation a custom name, and
 * Reanimated's web cleanup then pins the section with position: absolute at its first size, so
 * anything that grows later (charts, lists) overlaps the sections below it.
 */
export function Reveal({ order = 0, children, style }: { order?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const base = FadeInDown.delay(Math.min(order, 6) * 70)
    .duration(380)
    .reduceMotion(ReduceMotion.System);
  const entering = Platform.OS === 'web' ? base : base.withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] });
  return (
    <Animated.View style={style} entering={entering}>
      {children}
    </Animated.View>
  );
}
