import { Pressable, View } from 'react-native';

import { formatMoney } from '@/domain/money';
import type { Category, CurrencyCode } from '@/domain/types';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Badge } from './badge';
import { BudgetBar } from './budget-bar';
import { IconDisc } from './icon-disc';
import { T } from './text';

/** One budget in the 2-column grid: "spent / budget", a slim bar and a % badge. Over budget says so in words. */
export function BudgetCard({
  category,
  spent,
  budget,
  currency,
  onPress,
}: {
  category: Category;
  spent: number;
  budget: number;
  currency: CurrencyCode;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const pct = Math.round((spent / budget) * 100);
  const over = spent > budget;
  const status = over ? `${formatMoney(spent - budget, currency)} over` : `${formatMoney(budget - spent, currency, { compact: true })} left`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.name} budget: ${formatMoney(spent, currency)} of ${formatMoney(budget, currency)} spent, ${pct}%, ${
        over ? `${formatMoney(spent - budget, currency)} over budget` : `${formatMoney(budget - spent, currency)} left`
      }`}
      accessibilityHint="Opens this category"
      style={({ pressed }) => ({ flex: 1, flexBasis: 0, minWidth: 0, backgroundColor: c.surface, borderRadius: radius.xl, padding: space.l, gap: space.s, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconDisc icon={category.icon} size={36} />
        <Badge label={`${pct}%`} over={over} />
      </View>
      <T variant="bodyStrong" numberOfLines={1}>
        {category.name}
      </T>
      <T variant="sub" tone="inkSoft" numeric numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {formatMoney(spent, currency, { compact: true })} / {formatMoney(budget, currency, { compact: true })}
      </T>
      <View style={{ marginTop: -4 }}>
        <BudgetBar spent={spent} budget={budget} />
      </View>
      <T variant="caption" tone={over ? 'burgundy' : 'inkMute'} numeric numberOfLines={1}>
        {status}
      </T>
    </Pressable>
  );
}
