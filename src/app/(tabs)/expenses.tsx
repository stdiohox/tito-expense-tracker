import { IconSearch, IconX } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, SectionList, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddButton } from '@/components/add-button';
import { FocusStatusBar } from '@/components/focus-status-bar';
import { IconDisc } from '@/components/icon-disc';
import { STROKE } from '@/components/icons';
import { MonthSwitcher } from '@/components/month-switcher';
import { Row } from '@/components/row';
import { TabTitle } from '@/components/tab-title';
import { T } from '@/components/text';
import { useFabScroll } from '@/components/use-fab-scroll';
import { useMonth } from '@/data/month';
import { useStore } from '@/data/store';
import { dayLabel, monthName } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import type { CurrencyCode, DayKey, Expense } from '@/domain/types';
import { TARGET, fonts, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Expenses() {
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { month } = useMonth();
  const { expenses, categories, settings } = useStore();
  const [query, setQuery] = useState('');
  const fab = useFabScroll();
  const q = useDeferredValue(query.trim().toLowerCase());
  const catById = useMemo(() => new Map(categories.map((k) => [k.id, k])), [categories]);

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
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        stickySectionHeadersEnabled={false}
        contentInsetAdjustmentBehavior="never"
        onScroll={fab.onScroll}
        scrollEventThrottle={64}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: insets.top, paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <TabTitle title="Expenses">
              <MonthSwitcher />
            </TabTitle>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.s,
                backgroundColor: c.surface,
                borderRadius: radius.m,
                borderWidth: 1,
                borderColor: c.line,
                paddingLeft: space.m,
                marginTop: space.s,
                marginBottom: space.s,
              }}>
              <IconSearch size={20} color={c.inkMute} strokeWidth={STROKE} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={`Search ${monthName(month)}`}
                placeholderTextColor={c.inkMute}
                accessibilityLabel={`Search ${monthName(month)} by note or category`}
                returnKeyType="search"
                maxFontSizeMultiplier={2}
                style={{ flex: 1, minWidth: 0, minHeight: 48, fontFamily: fonts.medium, fontSize: 16, color: c.ink }}
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
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View
            accessibilityRole="header"
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: space.xl, paddingBottom: space.xs, gap: space.m }}>
            <T variant="headline">{dayLabel(section.day)}</T>
            <T variant="sub" tone="inkSoft" numeric>
              {section.total}
            </T>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const cat = catById.get(item.categoryId);
          return (
            <Row
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
        }}
        ListEmptyComponent={
          <View style={{ paddingVertical: space.huge, gap: space.s }} accessibilityLiveRegion="polite">
            <T variant="title">{query ? 'No matches' : `No expenses in ${monthName(month)}`}</T>
            <T variant="body" tone="inkSoft">
              {query
                ? `Nothing in ${monthName(month)} matches “${query}”. Try a category name or a word from the note.`
                : 'Expenses you add show up here, grouped by day.'}
            </T>
          </View>
        }
      />
      <AddButton compact={fab.compact} hidden={fab.hidden} />
    </View>
  );
}
