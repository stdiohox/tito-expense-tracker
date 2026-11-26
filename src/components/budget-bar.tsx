import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/use-theme';

/**
 * Spent vs budget. Past the budget the bar turns burgundy (with words beside it); never alarm red.
 * The fill grows to its level when it appears or changes; with Reduce Motion on, it is set at once.
 */
export function BudgetBar({ spent, budget }: { spent: number; budget: number }) {
  const { c } = useTheme();
  const over = spent > budget;
  const pct = Math.min(1, budget > 0 ? spent / budget : 0);
  const level = useSharedValue(0);

  useEffect(() => {
    level.value = withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
  }, [pct, level]);

  const fill = useAnimatedStyle(() => ({ width: `${level.value * 100}%` }));

  return (
    <View accessible={false} style={{ height: 6, borderRadius: 3, backgroundColor: c.line, overflow: 'hidden', marginTop: 6 }}>
      <Animated.View style={[{ height: '100%', borderRadius: 3, backgroundColor: over ? c.burgundy : c.accent }, fill]} />
    </View>
  );
}
