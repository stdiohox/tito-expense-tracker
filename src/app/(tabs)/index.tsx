import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

import { AddButton } from '@/components/add-button';
import { BrandGradient } from '@/components/brand-gradient';
import { BudgetCard } from '@/components/budget-card';
import { FocusStatusBar } from '@/components/focus-status-bar';
import { GlassCard } from '@/components/glass-card';
import { IconDisc } from '@/components/icon-disc';
import { LinkButton } from '@/components/link-button';
import { MonthSwitcher } from '@/components/month-switcher';
import { PaceChart } from '@/components/pace-chart';
import { Panel } from '@/components/panel';
import { Row } from '@/components/row';
import { useTabBarClearance } from '@/components/tab-bar';
import { T } from '@/components/text';
import { useFabScroll } from '@/components/use-fab-scroll';
import { useMonth } from '@/data/month';
import { useStore } from '@/data/store';
import { useSummary } from '@/data/use-summary';
import { shortLabel, visibleCategories } from '@/domain/categories';
import { addMonths, daysInMonth, dayOfMonth, monthName, shortDay, shortMonth } from '@/domain/dates';
import { CURRENCIES, formatMoney } from '@/domain/money';
import { budgetFor, compareWords, pace } from '@/domain/summary';
import type { CurrencyCode } from '@/domain/types';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const CARD_WIDTH = 230;

export default function Home() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const clearance = useTabBarClearance();
  const { month, isCurrent, today } = useMonth();
  const { expenses, categories, settings } = useStore();
  const { now, before } = useSummary(month);
  const fab = useFabScroll();
  const cur = settings.currency;
  const p = pace(now, before, today);
  const lastName = monthName(addMonths(month, -1));
  const lastShort = shortMonth(addMonths(month, -1));
  const thisName = monthName(month);
  const todayIndex = isCurrent ? dayOfMonth(today) - 1 : daysInMonth(month) - 1;
  const foreignCount = now.otherCurrencies.reduce((s, o) => s + o.count, 0);
  const allCount = now.count + foreignCount;
  const catById = useMemo(() => new Map(categories.map((k) => [k.id, k])), [categories]);
  const quick = visibleCategories(categories);

  let paceLine = '';
  let paceBadge = '';
  if (p) {
    const word = compareWords(p.delta, p.lastMonthByNow, cur);
    const when = isCurrent ? `by this day in ${lastName}` : lastName;
    paceLine = word === 'same' ? `About the same as ${when}` : `${formatMoney(Math.abs(p.delta), cur)} ${word} than ${when}`;
    const pct = p.lastMonthByNow > 0 ? Math.round((p.delta / p.lastMonthByNow) * 100) : 0;
    paceBadge = word === 'same' ? `Same as ${lastShort}` : `${pct > 0 ? '+' : '−'}${Math.abs(pct)}% vs ${lastShort}`;
  }

  // One glass card per currency with spending this month; the main currency always comes first.
  const currencyCards: { code: CurrencyCode; total: number; count: number }[] = [
    { code: cur, total: now.total, count: now.count },
    ...now.otherCurrencies.map((o) => ({ code: o.currency, total: o.total, count: o.count })),
  ];

  const budgets = now.byCategory
    .map((b) => ({ ...b, budget: budgetFor(b.category, cur) }))
    .concat(
      // Budgeted categories with nothing spent yet still get a card.
      categories
        .filter((k) => !k.hidden && budgetFor(k, cur) !== null && !now.byCategory.some((b) => b.category.id === k.id))
        .map((k) => ({ category: k, total: 0, count: 0, budget: budgetFor(k, cur) })),
    )
    .filter((b): b is typeof b & { budget: number } => b.budget !== null);

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
        contentContainerStyle={{ paddingBottom: clearance + 88 }}>
        <BrandGradient
          fade
          style={{ paddingTop: insets.top + space.s, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl }}>
          <View style={{ paddingHorizontal: space.xl }}>
            <T variant="title" tone="onBrand" accessibilityRole="header" style={{ marginTop: space.s }}>
              {settings.firstName ? `Hello, ${settings.firstName}` : 'Hello'}
            </T>
            <MonthSwitcher onBrand />
            <View style={{ marginTop: space.s, gap: space.xs }}>
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
            </View>
            {now.total > 0 || before.total > 0 ? (
              <View style={{ marginTop: space.l }}>
                <PaceChart
                  current={now.cumulative}
                  previous={before.cumulative}
                  todayIndex={todayIndex}
                  height={112}
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
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + space.m}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.m, paddingTop: space.l }}>
            {currencyCards.map((card, i) => (
              <GlassCard key={card.code} style={{ width: CARD_WIDTH, gap: space.xs }}>
                <View
                  accessible
                  accessibilityLabel={`${CURRENCIES[card.code].name}: ${formatMoney(card.total, card.code)}, ${card.count} ${card.count === 1 ? 'payment' : 'payments'}${
                    i === 0 ? (paceBadge ? `, ${paceBadge.replace('vs', 'compared with')}` : '') : ', counted separately'
                  }`}
                  style={{ gap: space.xs }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <T variant="caption" tone="onBrandSoft">
                      {CURRENCIES[card.code].symbol} {card.code}
                    </T>
                    {i === 0 && paceBadge ? (
                      <T variant="caption" numeric style={{ color: c.pop }}>
                        {paceBadge}
                      </T>
                    ) : null}
                  </View>
                  <T variant="title" tone="onBrand" numeric numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                    {formatMoney(card.total, card.code)}
                  </T>
                  <T variant="sub" tone="onBrandSoft">
                    {card.count} {card.count === 1 ? 'payment' : 'payments'}
                    {i === 0 ? '' : ' · counted separately'}
                  </T>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        </BrandGradient>

        <View style={{ paddingHorizontal: space.l, gap: space.l, marginTop: space.l }}>
          <Panel dark title="Quick add">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space.xs, marginTop: space.s, marginBottom: space.s }}>
              {quick.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => router.push({ pathname: '/expense/new', params: { category: cat.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Add to ${cat.name}`}
                  style={({ pressed }) => ({ width: '25%', alignItems: 'center', gap: 6, paddingVertical: space.s, paddingHorizontal: 2, minHeight: 84, opacity: pressed ? 0.6 : 1 })}>
                  <QuickFace icon={cat.icon} name={shortLabel(cat)} />
                </Pressable>
              ))}
            </View>
          </Panel>

          {allCount === 0 ? (
            <Panel>
              <View style={{ paddingVertical: space.l, gap: space.s }}>
                <T variant="title">Nothing logged in {thisName} yet</T>
                <T variant="body" tone="inkSoft">
                  Tap a category above, or Add expense, after you pay for something. Your month builds up here.
                </T>
              </View>
            </Panel>
          ) : (
            <>
              {budgets.length > 0 ? (
                <View style={{ gap: space.s }}>
                  <T variant="title" accessibilityRole="header" style={{ paddingHorizontal: space.xs }}>
                    Budgets
                  </T>
                  {pairs(budgets).map((row) => (
                    <View key={row[0].category.id} style={{ flexDirection: 'row', gap: space.m }}>
                      {row.map((b) => (
                        <BudgetCard
                          key={b.category.id}
                          category={b.category}
                          spent={b.total}
                          budget={b.budget}
                          currency={cur}
                          onPress={() => router.push({ pathname: '/category/[id]', params: { id: b.category.id } })}
                        />
                      ))}
                      {/* Same padding as a card, so a lone card stays exactly half width. */}
                      {row.length === 1 ? <View style={{ flex: 1, flexBasis: 0, padding: space.l }} /> : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {now.byCategory.length > 0 ? (
                <Panel title="Where it went" action={<T variant="headline" numeric>{formatMoney(now.total, cur)}</T>}>
                  {now.byCategory.slice(0, 5).map(({ category, total, count }, i, list) => {
                    const share = Math.round((total / now.total) * 100);
                    return (
                      <Row
                        key={category.id}
                        leading={<IconDisc icon={category.icon} size={36} />}
                        title={category.name}
                        subtitle={`${count} ${count === 1 ? 'payment' : 'payments'} · ${share}%`}
                        trailing={formatMoney(total, cur)}
                        onPress={() => router.push({ pathname: '/category/[id]', params: { id: category.id } })}
                        accessibilityLabel={`${category.name}, ${formatMoney(total, cur)}, ${share}% of the month`}
                        accessibilityHint="Opens this category"
                        divider={i < list.length - 1}
                      />
                    );
                  })}
                  {now.byCategory.length > 5 ? (
                    <View style={{ paddingBottom: space.s }}>
                      <LinkButton role="link" label={`See all ${now.byCategory.length} in Reports`} onPress={() => router.navigate('/reports')} />
                    </View>
                  ) : null}
                </Panel>
              ) : null}

              <Panel
                dark
                title="Latest"
                action={<LinkButton role="link" label="View all" accessibilityHint={`Shows all ${allCount} expenses`} onPress={() => router.navigate('/expenses')} />}>
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
              </Panel>
            </>
          )}
        </View>
      </ScrollView>
      <AddButton compact={fab.compact} hidden={fab.hidden} />
    </View>
  );
}

/** Splits a list into rows of two for the budget grid. */
function pairs<X>(list: X[]): X[][] {
  const rows: X[][] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
  return rows;
}

function QuickFace({ icon, name }: { icon: Parameters<typeof IconDisc>[0]['icon']; name: string }) {
  return (
    <>
      <IconDisc icon={icon} size={44} />
      <T
        variant="caption"
        tone="inkSoft"
        numberOfLines={1}
        maxFontSizeMultiplier={1.6}
        style={{ textAlign: 'center', fontSize: name.length > 11 ? 11 : 12 }}>
        {name}
      </T>
    </>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Svg width={18} height={4}>
        <Line x1={0} y1={2} x2={18} y2={2} stroke={color} strokeWidth={2} strokeDasharray={dashed ? '4 5' : undefined} />
      </Svg>
      <T variant="caption" tone="onBrandSoft">
        {label}
      </T>
    </View>
  );
}
