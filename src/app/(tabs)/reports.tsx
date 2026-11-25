import { IconShare } from '@tabler/icons-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { BudgetChart, type BudgetLine } from '@/components/budget-chart';
import { Button } from '@/components/button';
import { DailyChart } from '@/components/daily-chart';
import { IconDisc } from '@/components/icon-disc';
import { MonthSwitcher } from '@/components/month-switcher';
import { Panel } from '@/components/panel';
import { Row } from '@/components/row';
import { Reveal } from '@/components/reveal';
import { ScreenHero } from '@/components/screen-hero';
import { StatCard, StatRow } from '@/components/stat-card';
import { useTabBarClearance } from '@/components/tab-bar';
import { T } from '@/components/text';
import { useCountUp } from '@/components/use-count-up';
import { useToast } from '@/components/toast';
import { useMonth } from '@/data/month';
import { useStore } from '@/data/store';
import { useSummary } from '@/data/use-summary';
import { addMonths, dayOfMonth, daysInMonth, monthName, monthOfDay, shortMonth } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { budgetFor, compareWords, pace, summarise } from '@/domain/summary';
import type { MonthKey } from '@/domain/types';
import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Reports() {
  const { c } = useTheme();
  const clearance = useTabBarClearance();
  const { month, current, set, isCurrent, today } = useMonth();
  const { expenses, categories, settings } = useStore();
  const { now, before } = useSummary(month);
  const toast = useToast();
  const shownTotal = useCountUp(now.total);
  const cur = settings.currency;
  const lastName = monthName(addMonths(month, -1));
  const lastShort = shortMonth(addMonths(month, -1));

  // Months before the first expense are "no data", not zero spending, so they are left out.
  const history = useMemo(() => {
    const first = expenses.reduce<MonthKey | null>((m, e) => {
      const k = monthOfDay(e.day);
      return m === null || k < m ? k : m;
    }, null);
    const months: MonthKey[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = addMonths(month, -i);
      if (first !== null && m >= first) months.push(m);
    }
    return months.map((m) => ({ month: m, total: summarise(expenses, categories, m, cur).total }));
  }, [expenses, categories, month, cur]);
  const maxHist = Math.max(1, ...history.map((h) => h.total));
  const past = history.filter((h) => h.month < month);
  const avg = past.length ? Math.round(past.reduce((s, h) => s + h.total, 0) / past.length) : 0;

  const p = pace(now, before, today);
  const vsLast = isCurrent ? (p ? { d: p.delta, base: p.lastMonthByNow } : null) : before.total > 0 ? { d: now.total - before.total, base: before.total } : null;
  let headline = `Spent in ${monthName(month)}`;
  if (vsLast) {
    const word = compareWords(vsLast.d, vsLast.base, cur);
    const when = isCurrent ? `by this day in ${lastName}` : lastName;
    headline = word === 'same' ? `About the same as ${when}` : `${formatMoney(Math.abs(vsLast.d), cur)} ${word} than ${when}`;
  }

  // Every budget in the main currency, from the moment it is set (₦0 spent is still a line).
  const budgetLines: BudgetLine[] = categories
    .map((k) => ({ k, budget: budgetFor(k, cur) }))
    .filter((x): x is { k: typeof x.k; budget: number } => x.budget !== null && x.budget > 0 && !x.k.hidden)
    .map(({ k, budget }) => ({ category: k, budget, spent: now.byCategory.find((b) => b.category.id === k.id)?.total ?? 0 }))
    .sort((a, b) => b.spent / b.budget - a.spent / a.budget);
  const overCount = budgetLines.filter((b) => b.spent > b.budget).length;

  const deltaPct = vsLast && vsLast.base > 0 ? Math.round((vsLast.d / vsLast.base) * 100) : null;

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: clearance + space.xxl }}>
        <ScreenHero title="Reports">
          <MonthSwitcher onBrand />
          <T
            variant="total"
            tone="onBrand"
            numeric
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}
            accessibilityLabel={`${formatMoney(now.total, cur)} spent in ${monthName(month)}`}>
            {formatMoney(shownTotal, cur)}
          </T>
          <T variant="body" tone="onBrandSoft">
            {headline}
          </T>
        </ScreenHero>

        <View style={{ paddingHorizontal: space.l, gap: space.m, marginTop: space.m }}>

        <Reveal order={1}>
        <StatRow>
          <StatCard
            label={`Compared with ${lastShort}`}
            value={deltaPct === null ? '—' : `${deltaPct > 0 ? '+' : deltaPct < 0 ? '−' : ''}${Math.abs(deltaPct)}%`}
            note={deltaPct === null ? `No spending in ${lastName}` : isCurrent ? 'By this day of the month' : 'Whole month'}
          />
          <StatCard
            label="Monthly average"
            value={past.length ? formatMoney(avg, cur, { compact: true }) : '—'}
            note={past.length ? `Over ${past.length} ${past.length === 1 ? 'month' : 'months'} before ${monthName(month)}` : 'Builds up month by month'}
          />
        </StatRow>
        </Reveal>

        <Reveal order={2}>
        <Panel title="Day by day">
          <DailyChart
            perDay={now.perDay}
            lastMonth={before.perDay}
            monthKey={month}
            monthShort={shortMonth(month)}
            lastShort={lastShort}
            lastDay={isCurrent ? dayOfMonth(today) - 1 : daysInMonth(month) - 1}
            currency={cur}
          />
          <View style={{ height: space.m }} />
        </Panel>
        </Reveal>

        {budgetLines.length > 0 ? (
          <Reveal order={3}>
          <Panel
            title="Budgets"
            action={
              <T variant="sub" tone={overCount ? 'burgundy' : 'inkSoft'}>
                {overCount ? `${overCount} over` : 'All on track'}
              </T>
            }>
            <BudgetChart lines={budgetLines} currency={cur} monthKey={month} />
          </Panel>
          </Reveal>
        ) : null}

        <Reveal order={4}>
        <Panel title="By category">
          {now.byCategory.length === 0 ? (
            <T variant="sub" tone="inkMute" style={{ paddingVertical: space.m }}>
              Nothing logged in {monthName(month)}.
            </T>
          ) : (
            now.byCategory.map((b, i) => {
              const prev = before.byCategory.find((x) => x.category.id === b.category.id)?.total ?? 0;
              const diff = b.total - prev;
              const pct = Math.round((b.total / now.total) * 100);
              const word = compareWords(diff, prev, cur);
              const sub =
                prev === 0
                  ? `${pct}% · none in ${lastName}`
                  : word === 'same'
                    ? `${pct}% · same as ${lastShort}`
                    : `${pct}% · ${formatMoney(Math.abs(diff), cur, { compact: true })} ${word} than ${lastShort}`;
              return (
                <Row
                  key={b.category.id}
                  leading={<IconDisc icon={b.category.icon} size={36} />}
                  title={b.category.name}
                  subtitle={sub}
                  trailing={formatMoney(b.total, cur)}
                  accessibilityLabel={`${b.category.name}, ${formatMoney(b.total, cur)}, ${sub.replace(' · ', ' of the month, ')}`}
                  divider={i < now.byCategory.length - 1}
                />
              );
            })
          )}
        </Panel>
        </Reveal>

        {history.length > 1 ? (
          <Reveal order={5}>
          <Panel title="Month by month">
            <T variant="sub" tone="inkSoft" style={{ marginTop: space.xs }}>
              {past.length
                ? `Average ${formatMoney(avg, cur)} a month before ${monthName(month)}${isCurrent ? `. ${monthName(month)} isn’t over yet.` : '.'}`
                : 'Your monthly totals build up here.'}
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly', gap: space.m, height: 160, marginTop: space.l, marginBottom: space.m }}>
              {history.map((h) => {
                const isSel = h.month === month;
                return (
                  <Pressable
                    key={h.month}
                    onPress={() => set(h.month)}
                    accessibilityRole="button"
                    accessibilityLabel={`${monthName(h.month)}, ${formatMoney(h.total, cur)}${h.month === current ? ' so far' : ''}`}
                    accessibilityState={{ selected: isSel }}
                    style={{ flex: 1, maxWidth: 72, minHeight: TARGET, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 6 }}>
                    <T variant="caption" tone={isSel ? 'ink' : 'inkMute'} numeric>
                      {formatMoney(h.total, cur, { compact: true })}
                    </T>
                    <View
                      style={{
                        width: '100%',
                        height: `${Math.max(3, (h.total / maxHist) * 70)}%`,
                        backgroundColor: isSel ? c.accent : c.barMuted,
                        borderRadius: radius.s,
                      }}>
                      {/* The mint "crown" on the selected month: decorative; the fill and the
                          selected state already say which month it is. */}
                      {isSel ? (
                        <View
                          accessible={false}
                          style={{ position: 'absolute', top: -5, left: '30%', width: '40%', height: 3, borderRadius: 2, backgroundColor: c.popOnGround }}
                        />
                      ) : null}
                    </View>
                    <T variant="caption" tone={isSel ? 'ink' : 'inkMute'}>
                      {shortMonth(h.month)}
                    </T>
                  </Pressable>
                );
              })}
            </View>
          </Panel>
          </Reveal>
        ) : null}

        <Reveal order={6} style={{ marginTop: space.s }}>
          <Button
            label={`Share ${monthName(month)} as PDF`}
            variant="secondary"
            icon={<IconShare size={20} color={c.accent} strokeWidth={1.75} />}
            onPress={() => toast({ message: 'PDF sharing arrives in the next build' })}
          />
        </Reveal>
        </View>
      </ScrollView>
    </View>
  );
}
