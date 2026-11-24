import { View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

/** Spent vs budget. Past the budget the bar turns burgundy (with words beside it); never alarm red. */
export function BudgetBar({ spent, budget, color }: { spent: number; budget: number; color?: string }) {
  const { c } = useTheme();
  const over = spent > budget;
  const pct = Math.min(1, budget > 0 ? spent / budget : 0);
  return (
    <View
      accessible={false}
      style={{ height: 6, borderRadius: 3, backgroundColor: c.line, overflow: 'hidden', marginTop: 6 }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 3, backgroundColor: over ? c.burgundy : (color ?? c.accent) }} />
    </View>
  );
}
