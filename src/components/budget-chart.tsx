import { View } from 'react-native';

import { formatMoney } from '@/domain/money';
import type { Category, CurrencyCode } from '@/domain/types';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { IconDisc } from './icon-disc';
import { T } from './text';
import { useProgress } from './use-progress';

export type BudgetLine = { category: Category; spent: number; budget: number };

/**
 * Spent vs budget for each budgeted category, as horizontal bars with the % and the amount left.
 * Over budget the bar fills in burgundy (rose in dark mode) and the words say "₦X over": never
 * colour alone. Bars grow in when the month changes; with Reduce Motion they are set at once.
 * Each row is one screen-reader item that says it all.
 */
export function BudgetChart({ lines, currency, monthKey }: { lines: BudgetLine[]; currency: CurrencyCode; monthKey: string }) {
  const { c } = useTheme();
  const grow = useProgress(monthKey);
  return (
    <View style={{ gap: space.l, marginTop: space.m, marginBottom: space.m }}>
      {lines.map(({ category, spent, budget }) => {
        const pct = Math.round((spent / budget) * 100);
        const over = spent > budget;
        const words = over ? `${formatMoney(spent - budget, currency)} over` : `${formatMoney(budget - spent, currency)} left`;
        const fill = Math.min(1, spent / budget) * grow;
        return (
          <View
            key={category.id}
            accessible
            accessibilityLabel={`${category.name}: ${formatMoney(spent, currency)} of ${formatMoney(budget, currency)}, ${pct}%, ${over ? `${formatMoney(spent - budget, currency)} over budget` : words}`}
            style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
              <IconDisc icon={category.icon} size={28} />
              <T variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                {category.name}
              </T>
              <T variant="bodyStrong" tone={over ? 'burgundy' : 'ink'} numeric>
                {pct}%
              </T>
            </View>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: c.line, overflow: 'hidden' }}>
              <View style={{ width: `${fill * 100}%`, height: '100%', borderRadius: 5, backgroundColor: over ? c.burgundy : c.accent }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.s }}>
              <T variant="sub" tone="inkSoft" numeric>
                {formatMoney(spent, currency, { compact: true })} of {formatMoney(budget, currency, { compact: true })}
              </T>
              <T variant="sub" tone={over ? 'burgundy' : 'inkSoft'} numeric>
                {words}
              </T>
            </View>
          </View>
        );
      })}
    </View>
  );
}
