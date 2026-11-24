import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

import { AddButton } from '@/components/add-button';
import { BrandGradient } from '@/components/brand-gradient';
import { BudgetBar } from '@/components/budget-bar';
import { FocusStatusBar } from '@/components/focus-status-bar';
import { IconDisc } from '@/components/icon-disc';
import { LinkButton } from '@/components/link-button';
import { MonthSwitcher } from '@/components/month-switcher';
import { PaceChart } from '@/components/pace-chart';
import { Row, SectionHeader } from '@/components/row';
import { T } from '@/components/text';
import { useFabScroll } from '@/components/use-fab-scroll';
import { useMonth } from '@/data/month';
import { useStore } from '@/data/store';
import { useSummary } from '@/data/use-summary';
import { addMonths, dayOfMonth, daysInMonth, monthName, shortDay, shortMonth } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { budgetFor, compareWords, pace } from '@/domain/summary';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Home() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { month, isCurrent, today } = useMonth();
  const { expenses, categories, settings } = useStore();
  const { now, before } = useSummary(month);
  const fab = useFabScroll();
  const cur = settings.currency;
  const p = pace(now, before, today);
  const lastName = monthName(addMonths(month, -1));
  const thisName = monthName(month);
  const todayIndex = isCurrent ? dayOfMonth(today) - 1 : daysInMonth(month) - 1;
  const foreignCount = now.otherCurrencies.reduce((s, o) => s + o.count, 0);
  const allCount = now.count + foreignCount;
  const catById = useMemo(() => new Map(categories.map((k) => [k.id, k])), [categories]);

  let paceLine = '';
  if (p) {
    const diff = formatMoney(Math.abs(p.delta), cur);
    const word = compareWords(p.delta, p.lastMonthByNow, cur);
    const when = isCurrent ? `by this day in ${lastName}` : lastName;
    paceLine = word === 'same' ? `About the same as ${when}` : `${diff} ${word} than ${when}`;
  }

  const recent = useMemo(
    () =>
      expenses
        .filter((e) => e.day.startsWith(month))
        .sort((a, b) => (a.day === b.day ? b.createdAt - a.createdAt : a.day < b.day ? 1 : -1))
        .slice(0, 4),
    [expenses, month],
  );

  const chartLabel = `Spending in ${thisName}: ${formatMoney(p?.spentByNow ?? now.total, cur)} so far${
    p ? `, compared with ${formatMoney(p.lastMonthByNow, cur)} by the same day in ${lastName}` : ''
  }.`;

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <FocusStatusBar style="light" />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        onScroll={fab.onScroll}
        scrollEventThrottle={64}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <BrandGradient style={{ paddingTop: insets.top + space.s, paddingHorizontal: space.xl, paddingBottom: space.xxl }}>
          <MonthSwitcher onBrand />
          <View style={{ marginTop: space.l, gap: space.xs }}>
            <T
              variant="total"
              tone="onBrand"
              numeric
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.6}
              accessibilityLabel={`${formatMoney(now.total, cur)} spent in ${thisName}`}>
              {formatMoney(now.total, cur)}
            </T>
            <T variant="body" tone="onBrandSoft">
              {isCurrent ? `Spent so far in ${thisName}` : `Spent in ${thisName}`}
            </T>
            {paceLine ? (
              <T variant="bodyStrong" tone="onBrand" style={{ marginTop: space.xs }}>
                {paceLine}
              </T>
            ) : null}
            {now.otherCurrencies.map((o) => (
              <T key={o.currency} variant="sub" tone="onBrandSoft">
                Plus {formatMoney(o.total, o.currency)} in {o.currency}, counted separately
              </T>
            ))}
          </View>
          {now.total > 0 || before.total > 0 ? (
            <View style={{ marginTop: space.xl }}>
              <PaceChart
                current={now.cumulative}
                previous={before.cumulative}
                todayIndex={todayIndex}
                labels={[`1 ${shortMonth(month)}`, isCurrent ? 'Today' : '', `${daysInMonth(month)} ${shortMonth(month)}`]}
                accessibilityLabel={chartLabel}
              />
              <View
                style={{ flexDirection: 'row', gap: space.l, marginTop: space.s }}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden>
                <Legend color={c.chartLine} label={thisName} />
                <Legend color={c.chartGhost} label={lastName} dashed />
              </View>
            </View>
          ) : null}
        </BrandGradient>

        <View style={{ paddingHorizontal: space.xl }}>
          {allCount === 0 ? (
            <View style={{ paddingVertical: space.huge, gap: space.s }}>
              <T variant="title">Nothing logged in {thisName} yet</T>
              <T variant="body" tone="inkSoft">
                Tap Add expense after you pay for something. It takes a few seconds, and your month builds up here.
              </T>
            </View>
          ) : (
            <>
              {now.byCategory.length > 0 ? (
                <SectionHeader title="Where it went" right={formatMoney(now.total, cur)} />
              ) : null}
              {now.byCategory.map(({ category, total, count }) => {
                const budget = budgetFor(category, cur);
                const over = budget !== null && total > budget;
                const share = Math.round((total / now.total) * 100);
                return (
                  <Row
                    key={category.id}
                    leading={<IconDisc icon={category.icon} />}
                    title={category.name}
                    subtitle={
                      budget !== null ? (
                        <View>
                          <T variant="sub" tone={over ? 'burgundy' : 'inkMute'} numeric>
                            {over
                              ? `${formatMoney(total - budget, cur)} over the ${formatMoney(budget, cur, { compact: true })} budget`
                              : `${formatMoney(budget - total, cur)} left of ${formatMoney(budget, cur, { compact: true })}`}
                          </T>
                          <BudgetBar spent={total} budget={budget} />
                        </View>
                      ) : (
                        `${count} ${count === 1 ? 'payment' : 'payments'} · ${share}%`
                      )
                    }
                    trailing={formatMoney(total, cur)}
                    onPress={() => router.push({ pathname: '/category/[id]', params: { id: category.id } })}
                    accessibilityLabel={`${category.name}, ${formatMoney(total, cur)}${
                      budget !== null ? (over ? `, over budget by ${formatMoney(total - budget, cur)}` : `, ${formatMoney(budget - total, cur)} left in budget`) : `, ${share}% of the month`
                    }`}
                    accessibilityHint="Opens this category"
                  />
                );
              })}

              <SectionHeader title="Latest" />
              {recent.map((e, i) => {
                const cat = catById.get(e.categoryId);
                return (
                  <Row
                    key={e.id}
                    leading={cat ? <IconDisc icon={cat.icon} size={36} /> : undefined}
                    title={e.note || cat?.name || 'Expense'}
                    subtitle={`${cat?.name ?? 'Other'} · ${shortDay(e.day)}`}
                    trailing={formatMoney(e.amount, e.currency)}
                    onPress={() => router.push({ pathname: '/expense/[id]', params: { id: e.id } })}
                    accessibilityHint="Opens this expense to edit"
                    divider={i < recent.length - 1}
                  />
                );
              })}
              <View style={{ paddingTop: space.s }}>
                <LinkButton
                  role="link"
                  label={`See all ${allCount} ${allCount === 1 ? 'expense' : 'expenses'}`}
                  onPress={() => router.navigate('/expenses')}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <AddButton compact={fab.compact} hidden={fab.hidden} />
    </View>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Svg width={18} height={4}>
        <Line x1={0} y1={2} x2={18} y2={2} stroke={color} strokeWidth={2} strokeDasharray={dashed ? '3 3' : undefined} />
      </Svg>
      <T variant="caption" tone="onBrandSoft">
        {label}
      </T>
    </View>
  );
}
