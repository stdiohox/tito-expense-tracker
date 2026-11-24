import { IconShare } from '@tabler/icons-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FocusStatusBar } from '@/components/focus-status-bar';
import { IconDisc } from '@/components/icon-disc';
import { MonthSwitcher } from '@/components/month-switcher';
import { Row, SectionHeader } from '@/components/row';
import { TabTitle } from '@/components/tab-title';
import { T } from '@/components/text';
import { useToast } from '@/components/toast';
import { useMonth } from '@/data/month';
import { useStore } from '@/data/store';
import { useSummary } from '@/data/use-summary';
import { addMonths, monthName, monthOfDay, shortMonth } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import { compareWords, pace, summarise } from '@/domain/summary';
import type { MonthKey } from '@/domain/types';
import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Reports() {
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { month, current, set, isCurrent, today } = useMonth();
  const { expenses, categories, settings } = useStore();
  const { now, before } = useSummary(month);
  const toast = useToast();
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

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <FocusStatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: insets.top, paddingBottom: insets.bottom + space.xxxl }}>
        <TabTitle title="Reports">
          <MonthSwitcher />
        </TabTitle>

        <View style={{ marginTop: space.m, gap: space.xs }}>
          <T variant="total" numeric adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.6}>
            {formatMoney(now.total, cur)}
          </T>
          <T variant="body" tone="inkSoft">
            {headline}
          </T>
        </View>

        <SectionHeader title="By category" />
        {now.byCategory.length === 0 ? (
          <T variant="sub" tone="inkMute">
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

        {history.length > 1 ? (
          <>
            <SectionHeader title="Month by month" />
            <T variant="sub" tone="inkSoft">
              {past.length
                ? `Average ${formatMoney(avg, cur)} a month before ${monthName(month)}${isCurrent ? `. ${monthName(month)} isn’t over yet.` : '.'}`
                : 'Your monthly totals build up here.'}
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly', gap: space.m, height: 160, marginTop: space.l }}>
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
                        backgroundColor: isSel ? c.button : c.barMuted,
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
          </>
        ) : null}

        <View style={{ marginTop: space.xxxl }}>
          <Button
            label={`Share ${monthName(month)} as PDF`}
            variant="secondary"
            icon={<IconShare size={20} color={c.accent} strokeWidth={1.75} />}
            onPress={() => toast({ message: 'PDF sharing arrives in the next build' })}
          />
        </View>
      </ScrollView>
    </View>
  );
}
