import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { BudgetBar } from '@/components/budget-bar';
import { IconDisc } from '@/components/icon-disc';
import { LinkButton } from '@/components/link-button';
import { Panel } from '@/components/panel';
import { Row } from '@/components/row';
import { StatCard, StatRow } from '@/components/stat-card';
import { T } from '@/components/text';
import { useCurrencyView } from '@/data/currency-view';
import { useMonth } from '@/data/month';
import { useCategoryMonth } from '@/data/expenses';
import { useCategory } from '@/data/store';
import { addMonths, dayLabel, monthName } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { budgetFor } from '@/domain/summary';
import { TARGET, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = useCategory(id);
  const { month } = useMonth();
  const { view } = useCurrencyView();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  // A budgeted category shows the currency its budget is in; otherwise the currency being viewed.
  const cur = category?.budget != null && category.budgetCurrency ? category.budgetCurrency : view;

  const { items, total, lastTotal } = useCategoryMonth(id, cur, month);

  const editId = category?.id;
  const headerRight = useCallback(
    () => (
      <Pressable
        onPress={() => editId && router.push({ pathname: '/category/edit', params: { id: editId } })}
        accessibilityRole="button"
        accessibilityLabel="Edit category"
        hitSlop={8}
        style={({ pressed }) => ({ minHeight: TARGET, minWidth: TARGET, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
        <T variant="bodyStrong" tone="accent">
          Edit
        </T>
      </Pressable>
    ),
    [editId],
  );

  if (!category) {
    return (
      <View style={{ flex: 1, padding: space.xl }}>
        <T variant="title">Category not found</T>
      </View>
    );
  }

  const budget = budgetFor(category, cur);
  const over = budget !== null && total > budget;
  const lastName = monthName(addMonths(month, -1));

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <Stack.Screen
        options={{
          title: category.name,
          headerRight,
        }}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.l, paddingTop: space.s, paddingBottom: insets.bottom + 110, gap: space.m }}>
        <Panel>
          <View style={{ paddingVertical: space.m, gap: space.s }}>
            <IconDisc icon={category.icon} size={56} />
            <T variant="total" numeric adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.6} style={{ marginTop: space.xs }}>
              {formatMoney(total, cur)}
            </T>
            <T variant="body" tone="inkSoft">
              Spent on {category.name.toLowerCase()} in {monthName(month)}
            </T>
          </View>
        </Panel>

        <StatRow>
          <StatCard label="Payments" value={String(items.length)} note={`In ${monthName(month)}`} />
          <StatCard label={`In ${lastName}`} value={formatMoney(lastTotal, cur, { compact: true })} note={lastTotal > 0 ? 'The month before' : 'Nothing logged'} />
        </StatRow>

        <Panel>
          <View style={{ paddingVertical: space.l }}>
            {budget !== null ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.m }}>
                  <T variant="headline">Monthly budget</T>
                  <Badge label={`${Math.round((total / budget) * 100)}%`} over={over} />
                </View>
                <T variant="title" numeric style={{ marginTop: space.xs }}>
                  {formatMoney(total, cur)} / {formatMoney(budget, cur)}
                </T>
                <BudgetBar spent={total} budget={budget} />
                <T variant="sub" tone={over ? 'burgundy' : 'inkSoft'} style={{ marginTop: space.s }}>
                  {over
                    ? `${formatMoney(total - budget, cur)} over budget. That's fine; it helps to know.`
                    : `${formatMoney(budget - total, cur)} left this month`}
                </T>
              </>
            ) : (
              <View style={{ gap: space.s }}>
                <T variant="headline">No budget yet</T>
                <T variant="sub" tone="inkSoft">
                  Set a monthly amount for {category.name.toLowerCase()} and see how much is left as you go.
                </T>
                <LinkButton label="Set a budget" onPress={() => router.push({ pathname: '/category/edit', params: { id: category.id } })} />
              </View>
            )}
          </View>
        </Panel>

        <Panel title="Activity">
          {items.length === 0 ? (
            <T variant="sub" tone="inkMute" style={{ paddingVertical: space.m }}>
              Nothing here in {monthName(month)}.
            </T>
          ) : (
            items.map((e, i) => (
              <Row
                key={e.id}
                title={e.note || category.name}
                subtitle={dayLabel(e.day)}
                trailing={formatMoney(e.amount, e.currency)}
                onPress={() => router.push({ pathname: '/expense/[id]', params: { id: e.id } })}
                divider={i < items.length - 1}
              />
            ))
          )}
        </Panel>
      </ScrollView>
      <View style={{ position: 'absolute', left: space.l, right: space.l, bottom: insets.bottom + space.l }}>
        <Button
          label={`Add to ${category.name}`}
          onPress={() => router.push({ pathname: '/expense/new', params: { category: category.id } })}
        />
      </View>
    </View>
  );
}

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
