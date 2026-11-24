import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

/**
 * Fades a section in and lifts it 12px when a screen first appears. `order` staggers sections
 * (70ms apart, capped so long lists don't wait). With Reduce Motion on, it simply appears.
 */
export function Reveal({ order = 0, children, style }: { order?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.delay(Math.min(order, 6) * 70)
        .duration(380)
        .withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] })
        .reduceMotion(ReduceMotion.System)}>
      {children}
    </Animated.View>
  );
}
