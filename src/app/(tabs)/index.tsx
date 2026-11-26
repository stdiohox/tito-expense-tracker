import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Avatar } from '@/components/avatar';
import { BudgetCard } from '@/components/budget-card';
import { GlassCard } from '@/components/glass-card';
import { IconDisc } from '@/components/icon-disc';
import { LinkButton } from '@/components/link-button';
import { MonthSwitcher } from '@/components/month-switcher';
import { PaceChart } from '@/components/pace-chart';
import { Panel } from '@/components/panel';
import { Row } from '@/components/row';
import { PartUnavailable, SafePart } from '@/components/route-error';
import { ScreenHero } from '@/components/screen-hero';
import { useTabBarClearance } from '@/components/tab-bar';
import { Reveal } from '@/components/reveal';
import { T } from '@/components/text';
import { CountUpMoney } from '@/components/use-count-up';
import { useMonth } from '@/data/month';
import { useCurrencyView } from '@/data/currency-view';
import { chosenCurrencies, useStore } from '@/data/store';
import { useRecentExpenses } from '@/data/expenses';
import { useMonthSummaries, useSummary } from '@/data/use-summary';
import { shortLabel, visibleCategories } from '@/domain/categories';
import { addMonths, daysInMonth, dayOfMonth, monthName, shortDay, shortMonth } from '@/domain/dates';
import { currencyInfo, formatMoney } from '@/domain/money';
import { compareWords, pace } from '@/domain/summary';
import type { CurrencyCode } from '@/domain/types';
import { light, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const CARD_WIDTH = 230;

/**
 * Home: the shared screen hero (bright gradient, the same in both modes), then a body that follows
 * the Appearance setting: light panels on the icy-white ground in light mode, dark panels on navy
 * in dark mode. Quick add stays a dark panel in both, as the screen's one dark accent.
 */
export default function Home() {
  const { c } = useTheme();
  const clearance = useTabBarClearance();
  const { month, isCurrent, today } = useMonth();
  const { categories, settings } = useStore();
  const { now, before } = useSummary(month);
  const { setView } = useCurrencyView();
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

  // Each currency gets its own month summary; nothing is ever converted.
  const codes = useMemo(() => {
    const set = new Set<CurrencyCode>([...chosenCurrencies(settings), ...now.otherCurrencies.map((o) => o.currency)]);
    for (const k of categories) if (k.budget !== null && k.budgetCurrency) set.add(k.budgetCurrency);
    set.delete(cur); // the main currency's summary is `now`
    return [...set];
  }, [settings, now, categories, cur]);
  const others = useMonthSummaries(month, codes);
  const summaries = useMemo(() => new Map([[cur, now], ...others]), [cur, now, others]);

  // One glass card per chosen currency (even at 0), then any other currency spent in this month.
  const currencyCards = [
    ...chosenCurrencies(settings),
    ...now.otherCurrencies.map((o) => o.currency).filter((code) => !chosenCurrencies(settings).includes(code)),
  ].map((code) => ({ code, total: summaries.get(code)?.total ?? 0, count: summaries.get(code)?.count ?? 0 }));

  // Every budget, in the currency it was set in, from the moment it is set (₦0 spent included).
  const budgets = categories
    .filter((k): k is typeof k & { budget: number; budgetCurrency: CurrencyCode } => !k.hidden && k.budget !== null && !!k.budgetCurrency)
    .map((k) => ({
      category: k,
      budget: k.budget,
      currency: k.budgetCurrency,
      total: summaries.get(k.budgetCurrency)?.byCategory.find((b) => b.category.id === k.id)?.total ?? 0,
    }))
    .sort((a, b) => (a.currency === b.currency ? b.total / b.budget - a.total / a.budget : a.currency === cur ? -1 : b.currency === cur ? 1 : 0));

  const recent = useRecentExpenses(month, 4);

  const chartLabel = `Spending in ${thisName}: ${formatMoney(p?.spentByNow ?? now.total, cur)} so far${
    p ? `, compared with ${formatMoney(p.lastMonthByNow, cur)} by the same day in ${lastName}` : ''
  }.`;

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: clearance + space.l }}>
        <ScreenHero
          title={settings.firstName ? `Hello, ${settings.firstName}` : 'Hello'}
          leading={<Avatar first={settings.firstName} last={settings.lastName} size={32} />}
          bleed={
          <SafePart name="currency cards" fallback={<View style={{ paddingHorizontal: space.l }}><PartUnavailable label="Your currency totals" onBrand /></View>}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + space.m}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: space.l, gap: space.m, paddingTop: space.l }}>
            {currencyCards.map((card, i) => (
              <Pressable
                key={card.code}
                onPress={() => {
                  setView(card.code);
                  router.push('/expenses');
                }}
                accessibilityRole="button"
                accessibilityLabel={`${currencyInfo(card.code).name}: ${formatMoney(card.total, card.code)} in ${thisName}, ${card.count} ${card.count === 1 ? 'payment' : 'payments'}${
                  i === 0 && paceBadge ? `, ${paceBadge.replace('vs', 'compared with')}` : ''
                }`}
                accessibilityHint={`Shows your ${card.code} expenses`}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                <GlassCard style={{ width: CARD_WIDTH, gap: space.xs }}>
                  <T variant="caption" tone="onBrandSoft" numberOfLines={1}>
                    {currencyInfo(card.code).flag} {card.code} · {currencyInfo(card.code).name}
                  </T>
                  <T variant="title" tone="onBrand" numeric numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{ marginTop: space.l }}>
                    {formatMoney(card.total, card.code)}
                  </T>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.s }}>
                    <T variant="sub" tone="onBrandSoft" style={{ flexShrink: 1 }}>
                      {card.count} {card.count === 1 ? 'payment' : 'payments'}
                    </T>
                    {i === 0 && paceBadge ? (
                      <T variant="caption" numeric style={{ color: light.pop }}>
                        {paceBadge}
                      </T>
                    ) : null}
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </ScrollView>
          </SafePart>
          }>
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
                <CountUpMoney value={now.total} currency={cur} />
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
                <SafePart name="pace chart" fallback={<PartUnavailable label="The chart" onBrand />}>
                <PaceChart
                  current={now.cumulative}
                  previous={before.cumulative}
                  todayIndex={todayIndex}
                  height={112}
                  labels={[`1 ${shortMonth(month)}`, isCurrent ? 'Today' : '', `${daysInMonth(month)} ${shortMonth(month)}`]}
                  accessibilityLabel={chartLabel}
                />
                </SafePart>
                <View
                  style={{ flexDirection: 'row', gap: space.l, marginTop: space.s }}
                  importantForAccessibility="no-hide-descendants"
                  accessibilityElementsHidden>
                  <Legend color={light.chartLine} label={thisName} />
                  <Legend color={light.chartGhost} label={lastName} dashed />
                </View>
              </View>
            ) : null}
        </ScreenHero>

        <View style={{ paddingHorizontal: space.l, gap: space.l, marginTop: space.l }}>
          <Reveal order={1}>
          <Panel dark title="Quick add">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space.xs, marginTop: space.s, marginBottom: space.s }}>
              {quick.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => router.push({ pathname: '/expense/new', params: { category: cat.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Add to ${cat.name}`}
                  style={({ pressed }) => ({ width: '25%', alignItems: 'center', gap: 6, paddingVertical: space.s, paddingHorizontal: 2, minHeight: 84, opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] })}>
                  <QuickFace icon={cat.icon} name={shortLabel(cat)} />
                </Pressable>
              ))}
            </View>
          </Panel>
          </Reveal>

          {/* Budgets show as soon as they are set, before anything is spent. */}
          {budgets.length > 0 ? (
            <Reveal order={2} style={{ gap: space.s }}>
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
                      currency={b.currency}
                      onPress={() => router.push({ pathname: '/category/[id]', params: { id: b.category.id } })}
                    />
                  ))}
                  {/* Same padding as a card, so a lone card stays exactly half width. */}
                  {row.length === 1 ? <View style={{ flex: 1, flexBasis: 0, padding: space.l }} /> : null}
                </View>
              ))}
            </Reveal>
          ) : null}

          {allCount === 0 ? (
            <Reveal order={3}>
            <Panel>
              <View style={{ paddingVertical: space.l, gap: space.s }}>
                <T variant="title">Nothing logged in {thisName} yet</T>
                <T variant="body" tone="inkSoft">
                  Tap a category above, or Add expense, after you pay for something. Your month builds up here.
                </T>
              </View>
            </Panel>
            </Reveal>
          ) : (
            <>
              {now.byCategory.length > 0 ? (
                <Reveal order={3}>
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
                </Reveal>
              ) : null}

              <Reveal order={4}>
              <Panel
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
              </Reveal>
            </>
          )}
        </View>
      </ScrollView>
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

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
