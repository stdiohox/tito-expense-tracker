import { IconSearch, IconX } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddButton } from '@/components/add-button';
import { FocusStatusBar } from '@/components/focus-status-bar';
import { IconDisc } from '@/components/icon-disc';
import { STROKE } from '@/components/icons';
import { MonthSwitcher } from '@/components/month-switcher';
import { Panel } from '@/components/panel';
import { Row } from '@/components/row';
import { StatCard, StatRow } from '@/components/stat-card';
import { useTabBarClearance } from '@/components/tab-bar';
import { TabTitle } from '@/components/tab-title';
import { T } from '@/components/text';
import { useFabScroll } from '@/components/use-fab-scroll';
import { useFocusBorder } from '@/components/use-focus-border';
import { useMonth } from '@/data/month';
import { useStore } from '@/data/store';
import { useSummary } from '@/data/use-summary';
import { dayLabel, dayOfMonth, monthName } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import type { CurrencyCode, DayKey, Expense } from '@/domain/types';
import { TARGET, fonts, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Expenses() {
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const clearance = useTabBarClearance();
  const { month, isCurrent, today } = useMonth();
  const { expenses, categories, settings } = useStore();
  const { now } = useSummary(month);
  const [query, setQuery] = useState('');
  const fab = useFabScroll();
  const searchFocus = useFocusBorder();
  const q = useDeferredValue(query.trim().toLowerCase());
  const catById = useMemo(() => new Map(categories.map((k) => [k.id, k])), [categories]);
  // Days so far: a month in progress is averaged over the days it has had, not its full length.
  const days = isCurrent ? dayOfMonth(today) : now.cumulative.length;
  const foreign = now.otherCurrencies.reduce((s, o) => s + o.count, 0);

  const { sections, matches } = useMemo(() => {
    const byDay = new Map<DayKey, Expense[]>();
    let matches = 0;
    for (const e of expenses) {
      if (!e.day.startsWith(month)) continue;
      if (q) {
        const cat = catById.get(e.categoryId)?.name ?? '';
        if (!e.note.toLowerCase().includes(q) && !cat.toLowerCase().includes(q)) continue;
      }
      matches += 1;
      const list = byDay.get(e.day);
      if (list) list.push(e);
      else byDay.set(e.day, [e]);
    }
    const sections = [...byDay]
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([day, data]) => {
        const totals = new Map<CurrencyCode, number>();
        for (const e of data) totals.set(e.currency, (totals.get(e.currency) ?? 0) + e.amount);
        const main = totals.get(settings.currency) ?? 0;
        const extra = [...totals].filter(([k]) => k !== settings.currency).map(([k, v]) => formatMoney(v, k));
        return {
          day,
          total: [main > 0 || extra.length === 0 ? formatMoney(main, settings.currency) : null, ...extra].filter(Boolean).join(' + '),
          data: [...data].sort((a, b) => b.createdAt - a.createdAt),
        };
      });
    return { sections, matches };
  }, [expenses, catById, month, q, settings.currency]);

  // Tell screen-reader users how many results a search returned (debounced by the deferred value).
  useEffect(() => {
    if (!q || Platform.OS === 'web') return;
    const t = setTimeout(() => AccessibilityInfo.announceForAccessibility(`${matches} ${matches === 1 ? 'result' : 'results'}`), 600);
    return () => clearTimeout(t);
  }, [q, matches]);

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <FocusStatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        onScroll={fab.onScroll}
        scrollEventThrottle={64}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: space.l, paddingTop: insets.top, paddingBottom: clearance + 88, gap: space.m }}>
        <View style={{ paddingHorizontal: space.xs }}>
          <TabTitle title="Expenses">
            <MonthSwitcher />
          </TabTitle>
        </View>

        <StatRow>
          <StatCard label={`Spent in ${monthName(month)}`} value={formatMoney(now.total, settings.currency)} note={foreign ? `Plus ${foreign} in other currencies` : undefined} />
          <StatCard label="Payments" value={String(now.count + foreign)} note={`About ${formatMoney(Math.round(now.total / days), settings.currency, { compact: true })} a day`} />
        </StatRow>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.s,
            backgroundColor: c.surface,
            borderRadius: radius.xl,
            ...searchFocus.border,
            paddingLeft: space.l - searchFocus.inset,
          }}>
          <IconSearch size={20} color={c.inkMute} strokeWidth={STROKE} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${monthName(month)}`}
            placeholderTextColor={c.inkMute}
            accessibilityLabel={`Search ${monthName(month)} by note or category`}
            returnKeyType="search"
            {...searchFocus.focusProps}
            maxFontSizeMultiplier={2}
            style={{ flex: 1, minWidth: 0, minHeight: 48, fontFamily: fonts.regular, fontSize: 16, color: c.ink }}
          />
          {query ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={{ width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center' }}>
              <IconX size={18} color={c.inkMute} strokeWidth={STROKE} />
            </Pressable>
          ) : null}
        </View>

        {sections.length === 0 ? (
          <Panel>
            <View style={{ paddingVertical: space.l, gap: space.s }} accessibilityLiveRegion="polite">
              <T variant="title">{query ? 'No matches' : `No expenses in ${monthName(month)}`}</T>
              <T variant="body" tone="inkSoft">
                {query
                  ? `Nothing in ${monthName(month)} matches “${query}”. Try a category name or a word from the note.`
                  : 'Expenses you add show up here, grouped by day.'}
              </T>
            </View>
          </Panel>
        ) : (
          sections.map((section) => (
            <Panel key={section.day}>
              <View
                accessibilityRole="header"
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: space.m, gap: space.m }}>
                <T variant="headline">{dayLabel(section.day)}</T>
                <T variant="sub" tone="inkSoft" numeric>
                  {section.total}
                </T>
              </View>
              {section.data.map((item, index) => {
                const cat = catById.get(item.categoryId);
                return (
                  <Row
                    key={item.id}
                    leading={cat ? <IconDisc icon={cat.icon} size={36} /> : undefined}
                    title={item.note || cat?.name || 'Expense'}
                    subtitle={item.note ? (cat?.name ?? 'Other') : undefined}
                    trailing={formatMoney(item.amount, item.currency)}
                    trailingSub={item.currency !== settings.currency ? item.currency : undefined}
                    onPress={() => router.push({ pathname: '/expense/[id]', params: { id: item.id } })}
                    accessibilityHint="Opens this expense to edit or delete"
                    divider={index < section.data.length - 1}
                  />
                );
              })}
            </Panel>
          ))
        )}
      </ScrollView>
      <AddButton compact={fab.compact} hidden={fab.hidden} />
    </View>
  );
}
