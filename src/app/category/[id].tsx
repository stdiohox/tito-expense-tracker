import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { BudgetBar } from '@/components/budget-bar';
import { IconDisc } from '@/components/icon-disc';
import { LinkButton } from '@/components/link-button';
import { Row, SectionHeader } from '@/components/row';
import { T } from '@/components/text';
import { useMonth } from '@/data/month';
import { useCategory, useStore } from '@/data/store';
import { addMonths, dayLabel, monthName } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { budgetFor } from '@/domain/summary';
import { TARGET, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = useCategory(id);
  const { expenses, settings } = useStore();
  const { month } = useMonth();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const cur = settings.currency;

  const { items, total, lastTotal } = useMemo(() => {
    const prev = addMonths(month, -1);
    const mine = expenses.filter((e) => e.categoryId === id && e.currency === cur);
    const items = mine.filter((e) => e.day.startsWith(month)).sort((a, b) => (a.day === b.day ? b.createdAt - a.createdAt : a.day < b.day ? 1 : -1));
    return {
      items,
      total: items.reduce((s, e) => s + e.amount, 0),
      lastTotal: mine.filter((e) => e.day.startsWith(prev)).reduce((s, e) => s + e.amount, 0),
    };
  }, [expenses, id, month, cur]);

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
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + 110 }}>
        <View style={{ paddingTop: space.l, gap: space.s }}>
          <IconDisc icon={category.icon} size={56} />
          <T variant="total" numeric adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.6} style={{ marginTop: space.s }}>
            {formatMoney(total, cur)}
          </T>
          <T variant="body" tone="inkSoft">
            Spent on {category.name.toLowerCase()} in {monthName(month)}
            {lastTotal > 0 ? ` · ${formatMoney(lastTotal, cur)} in ${lastName}` : ''}
          </T>
        </View>

        <View style={{ marginTop: space.xxl, paddingVertical: space.l, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.line }}>
          {budget !== null ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T variant="headline">Monthly budget</T>
                <T variant="headline" numeric>
                  {formatMoney(budget, cur)}
                </T>
              </View>
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

        <SectionHeader title="Activity" />
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
      </ScrollView>
      <View style={{ position: 'absolute', left: space.xl, right: space.xl, bottom: insets.bottom + space.l }}>
        <Button
          label={`Add to ${category.name}`}
          onPress={() => router.push({ pathname: '/expense/new', params: { category: category.id } })}
        />
      </View>
    </View>
  );
}
