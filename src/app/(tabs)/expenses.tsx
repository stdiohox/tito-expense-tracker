import { IconSearch, IconX } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { CurrencyToggle } from '@/components/currency-toggle';
import { IconDisc } from '@/components/icon-disc';
import { STROKE } from '@/components/icons';
import { MonthSwitcher } from '@/components/month-switcher';
import { Panel } from '@/components/panel';
import { Row } from '@/components/row';
import { Reveal } from '@/components/reveal';
import { ScreenHero } from '@/components/screen-hero';
import { useTabBarClearance } from '@/components/tab-bar';
import { T } from '@/components/text';
import { useCountUp } from '@/components/use-count-up';
import { useFocusBorder } from '@/components/use-focus-border';
import { useCurrencyView } from '@/data/currency-view';
import { useMonth } from '@/data/month';
import { useStore } from '@/data/store';
import { useSummary } from '@/data/use-summary';
import { dayLabel, dayOfMonth, monthName } from '@/domain/dates';
import { formatMoney } from '@/domain/money';
import type { DayKey, Expense } from '@/domain/types';
import { TARGET, fonts, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Expenses() {
  const { c } = useTheme();
  const clearance = useTabBarClearance();
  const { month, isCurrent, today } = useMonth();
  const { expenses, categories } = useStore();
  const { view } = useCurrencyView();
  const { now } = useSummary(month, view);
  const [query, setQuery] = useState('');
  const searchFocus = useFocusBorder();
  const q = useDeferredValue(query.trim().toLowerCase());
  const catById = useMemo(() => new Map(categories.map((k) => [k.id, k])), [categories]);
  // Days so far: a month in progress is averaged over the days it has had, not its full length.
  const days = isCurrent ? dayOfMonth(today) : now.cumulative.length;
  const shownTotal = useCountUp(now.total);

  const { sections, matches } = useMemo(() => {
    const byDay = new Map<DayKey, Expense[]>();
    let matches = 0;
    for (const e of expenses) {
      // One currency at a time: the toggle switches between them; nothing is converted.
      if (!e.day.startsWith(month) || e.currency !== view) continue;
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
        return {
          day,
          total: formatMoney(data.reduce((s, e) => s + e.amount, 0), view),
          data: [...data].sort((a, b) => b.createdAt - a.createdAt),
        };
      });
    return { sections, matches };
  }, [expenses, catById, month, q, view]);

  // Tell screen-reader users how many results a search returned (debounced by the deferred value).
  useEffect(() => {
    if (!q || Platform.OS === 'web') return;
    const t = setTimeout(() => AccessibilityInfo.announceForAccessibility(`${matches} ${matches === 1 ? 'result' : 'results'}`), 600);
    return () => clearTimeout(t);
  }, [q, matches]);

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: clearance + space.l }}>
        <ScreenHero title="Expenses">
          <MonthSwitcher onBrand />
          <T
            variant="total"
            tone="onBrand"
            numeric
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}
            accessibilityLabel={`${formatMoney(now.total, view)} spent in ${monthName(month)}`}>
            {formatMoney(shownTotal, view)}
          </T>
          <T variant="sub" tone="onBrandSoft" numeric>
            {now.count} {now.count === 1 ? 'payment' : 'payments'} · about {formatMoney(Math.round(now.total / days), view, { compact: true })} a day
          </T>
        </ScreenHero>

        <View style={{ paddingHorizontal: space.l, gap: space.m, marginTop: space.m }}>

        <Reveal order={1} style={{ gap: space.m }}>
        <CurrencyToggle />
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
          {/* The input has a fixed height, no padding and (Android) no extra font padding, so its
              text is centred. The magnifier's lens sits above the middle of its own box (the handle
              hangs below), and Outfit's lowercase sits a little low, so the icon drops 2px to put
              the lens on the same line as the placeholder. */}
          <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: 2 }] }}>
            <IconSearch size={20} color={c.inkMute} strokeWidth={STROKE} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${monthName(month)}`}
            placeholderTextColor={c.inkMute}
            accessibilityLabel={`Search ${monthName(month)} by note or category`}
            returnKeyType="search"
            {...searchFocus.focusProps}
            maxFontSizeMultiplier={2}
            style={{ flex: 1, minWidth: 0, height: 48, paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false, fontFamily: fonts.regular, fontSize: 16, color: c.ink }}
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
        </Reveal>

        {sections.length === 0 ? (
          <Reveal order={2}>
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
          </Reveal>
        ) : (
          sections.map((section, si) => (
            <Reveal key={section.day} order={si + 2}>
            <Panel>
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
                    onPress={() => router.push({ pathname: '/expense/[id]', params: { id: item.id } })}
                    accessibilityHint="Opens this expense to edit or delete"
                    divider={index < section.data.length - 1}
                  />
                );
              })}
            </Panel>
            </Reveal>
          ))
        )}
        </View>
      </ScrollView>
    </View>
  );
}

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
