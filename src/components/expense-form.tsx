import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToday } from '@/data/month';
import { useActions, useStore } from '@/data/store';
import { addDays, dayLabel } from '@/domain/dates';
import { CURRENCIES, amountToInput, formatMoney, parseAmount } from '@/domain/money';
import type { CurrencyCode, DayKey, Expense } from '@/domain/types';
import { TARGET, fonts, radius, space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { announceError } from './announce';
import { Button } from './button';
import { IconDisc } from './icon-disc';
import { STROKE } from './icons';
import { safeBack } from './nav';
import { T } from './text';
import { useToast } from './toast';
import { useFocusBorder } from './use-focus-border';

type InputRef = ComponentRef<typeof TextInput>;

export function ExpenseForm({ existing, presetCategory }: { existing?: Expense; presetCategory?: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { categories, settings } = useStore();
  const { addExpense, updateExpense, deleteExpense, restoreExpense } = useActions();
  const toast = useToast();
  const today = useToday();

  const validPreset = categories.some((k) => k.id === presetCategory) ? presetCategory : undefined;
  const [currency, setCurrency] = useState<CurrencyCode>(existing?.currency ?? settings.currency);
  const [amountText, setAmountText] = useState(existing ? amountToInput(existing.amount, existing.currency) : '');
  const [categoryId, setCategoryId] = useState<string | undefined>(existing?.categoryId ?? validPreset);
  const [day, setDay] = useState<DayKey>(existing?.day ?? today);
  const [note, setNote] = useState(existing?.note ?? '');
  const [tried, setTried] = useState(false);
  const busy = useRef(false);
  const amountRef = useRef<InputRef>(null);
  const noteRef = useRef<InputRef>(null);
  const firstCatRef = useRef<ComponentRef<typeof View>>(null);
  const noteFocus = useFocusBorder();

  // Open the keyboard on the amount for a new expense, unless a screen reader is on:
  // then the user should land on the heading and hear where they are first.
  useEffect(() => {
    if (existing) return;
    let cancelled = false;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((on) => !on && !cancelled && setTimeout(() => amountRef.current?.focus(), 350))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [existing]);

  const amount = parseAmount(amountText, currency);
  const categoryOk = categories.some((k) => k.id === categoryId);
  const amountError = tried && amount === null ? 'Enter an amount, for example 2,500' : null;
  const categoryError = tried && !categoryOk ? 'Choose a category' : null;

  const save = () => {
    if (busy.current) return;
    setTried(true);
    if (amount === null || !categoryOk || !categoryId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      if (amount === null) announceError('Enter an amount', amountRef);
      else announceError('Choose a category', firstCatRef);
      return;
    }
    busy.current = true;
    const cat = categories.find((k) => k.id === categoryId);
    if (existing) {
      const ok = updateExpense({ ...existing, amount, currency, categoryId, day, note: note.trim() });
      toast({ message: ok ? 'Expense updated' : 'This expense was deleted, so it could not be updated' });
      // A failed update is not a success: warn instead.
      const feedback = ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning;
      Haptics.notificationAsync(feedback).catch(() => {});
    } else {
      addExpense({ amount, currency, categoryId, day, note: note.trim() });
      toast({ message: `Saved ${formatMoney(amount, currency)} to ${cat?.name ?? 'your expenses'}` });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    safeBack();
  };

  const remove = () => {
    if (!existing || busy.current) return;
    busy.current = true;
    const removed = deleteExpense(existing.id);
    safeBack();
    if (removed) {
      toast({
        message: `Deleted ${formatMoney(removed.amount, removed.currency)}`,
        actionLabel: 'Undo',
        actionA11yLabel: 'Undo delete',
        onAction: () => restoreExpense(removed),
      });
    }
  };

  const changeDay = (d: DayKey) => {
    setDay(d);
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(dayLabel(d));
  };
  const canGoForward = day < today;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior="padding">
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.s, paddingTop: space.m }}>
        <Pressable
          onPress={safeBack}
          accessibilityRole="button"
          accessibilityLabel="Close without saving"
          style={{ width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center' }}>
          <IconX size={22} color={c.ink} strokeWidth={STROKE} />
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xxl }}>
        <T variant="largeTitle" accessibilityRole="header">
          {existing ? 'Edit expense' : 'Add expense'}
        </T>

        <View style={{ marginTop: space.xxl, gap: space.s }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s, justifyContent: 'space-between', alignItems: 'center' }}>
            <T variant="sub" tone="inkSoft" nativeID="amountLabel" importantForAccessibility="no">
              Amount
            </T>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Currency"
              style={{ flexDirection: 'row', backgroundColor: c.ground, borderRadius: radius.pill, padding: 2 }}>
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                const on = code === currency;
                return (
                  <Pressable
                    key={code}
                    onPress={() => setCurrency(code)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on, selected: on }}
                    accessibilityLabel={`${code}, ${CURRENCIES[code].name}`}
                    style={{ minHeight: TARGET, minWidth: 64, paddingHorizontal: space.m, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.surface : 'transparent' }}>
                    <T variant="caption" tone={on ? 'ink' : 'inkMute'}>
                      {CURRENCIES[code].symbol} {code}
                    </T>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: amountError ? c.danger : c.accent,
              paddingBottom: space.xs,
            }}>
            <T variant="total" tone="inkSoft" maxFontSizeMultiplier={1.5} style={{ marginRight: 4 }} importantForAccessibility="no">
              {CURRENCIES[currency].symbol}
            </T>
            <TextInput
              ref={amountRef}
              value={amountText}
              onChangeText={(t) => setAmountText(t.replace(/[^\d.,]/g, ''))}
              keyboardType="decimal-pad"
              inputMode="decimal"
              placeholder="0"
              placeholderTextColor={c.inkMute}
              accessibilityLabel={`Amount in ${CURRENCIES[currency].name}`}
              accessibilityHint={amountError ?? undefined}
              aria-invalid={!!amountError}
              maxFontSizeMultiplier={1.5}
              returnKeyType="next"
              onSubmitEditing={() => noteRef.current?.focus()}
              style={{ flex: 1, minWidth: 0, width: '100%', ...type.total, color: c.ink, paddingVertical: 0, fontVariant: ['tabular-nums'] }}
            />
          </View>
          <View accessibilityLiveRegion="polite" aria-live="polite">
            {amountError ? <T variant="sub" tone="danger">{amountError}</T> : null}
          </View>
        </View>

        <T variant="headline" style={{ marginTop: space.xxl }} importantForAccessibility="no">
          Category
        </T>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Category"
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: space.s, marginHorizontal: -4 }}>
          {categories.map((cat, i) => {
            const on = cat.id === categoryId;
            return (
              <Pressable
                key={cat.id}
                ref={i === 0 ? firstCatRef : undefined}
                onPress={() => {
                  setCategoryId(cat.id);
                  Haptics.selectionAsync().catch(() => {});
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: on, selected: on }}
                accessibilityLabel={cat.name}
                style={{ width: '33.333%', padding: 4 }}>
                <View
                  style={{
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: space.s,
                    borderRadius: radius.m,
                    borderWidth: 1.5,
                    borderColor: on ? c.accent : 'transparent',
                    backgroundColor: on ? c.accentTint : 'transparent',
                    minHeight: 84,
                  }}>
                  <IconDisc icon={cat.icon} size={40} />
                  <T variant="caption" tone={on ? 'ink' : 'inkSoft'} maxFontSizeMultiplier={1.6} style={{ textAlign: 'center', paddingHorizontal: 2 }}>
                    {cat.name}
                  </T>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View accessibilityLiveRegion="polite" aria-live="polite">
          {categoryError ? <T variant="sub" tone="danger">{categoryError}</T> : null}
        </View>

        <T variant="headline" style={{ marginTop: space.xxl }} importantForAccessibility="no">
          Date
        </T>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Date"
          accessibilityValue={{ text: dayLabel(day) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'decrement') changeDay(addDays(day, -1));
            if (e.nativeEvent.actionName === 'increment' && canGoForward) changeDay(addDays(day, 1));
          }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.s, backgroundColor: c.ground, borderRadius: radius.m, paddingHorizontal: space.xs }}>
          <Pressable
            onPress={() => changeDay(addDays(day, -1))}
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <IconChevronLeft size={22} color={c.ink} strokeWidth={STROKE} />
          </Pressable>
          <T variant="bodyStrong">{dayLabel(day)}</T>
          <Pressable
            onPress={() => canGoForward && changeDay(addDays(day, 1))}
            disabled={!canGoForward}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canGoForward }}
            accessibilityLabel="Next day"
            style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: canGoForward ? 1 : 0.3 }}>
            <IconChevronRight size={22} color={c.ink} strokeWidth={STROKE} />
          </Pressable>
        </View>

        <T variant="headline" style={{ marginTop: space.xxl }} importantForAccessibility="no">
          Note <T variant="sub" tone="inkMute">(optional)</T>
        </T>
        <TextInput
          ref={noteRef}
          value={note}
          onChangeText={setNote}
          placeholder="What was it for?"
          placeholderTextColor={c.inkMute}
          maxLength={120}
          maxFontSizeMultiplier={2}
          accessibilityLabel="Note, optional"
          returnKeyType="done"
          {...noteFocus.focusProps}
          style={{
            marginTop: space.s,
            minHeight: 52,
            borderRadius: radius.m,
            ...noteFocus.border,
            paddingHorizontal: space.l - noteFocus.inset,
            fontFamily: fonts.medium,
            fontSize: 16,
            color: c.ink,
          }}
        />

        {existing ? (
          <View style={{ marginTop: space.xxxl }}>
            <Button label="Delete expense" variant="danger" onPress={remove} accessibilityHint="You can undo this for a few seconds" />
          </View>
        ) : null}
      </ScrollView>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.m, paddingBottom: insets.bottom + space.m, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface }}>
        <Button label={existing ? 'Save changes' : 'Save expense'} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}
