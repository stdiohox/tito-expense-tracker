import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { useToday } from '@/data/month';
import { chosenCurrencies, useActions, useStore } from '@/data/store';
import { shortLabel } from '@/domain/categories';
import { addDays, dayLabel } from '@/domain/dates';
import { currencyInfo, amountToInput, formatMoney, parseAmount } from '@/domain/money';
import type { CurrencyCode, DayKey, Expense } from '@/domain/types';
import { TARGET, fonts, radius, space, type } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { announceError } from './announce';
import { BottomSheet, SheetFold } from './bottom-sheet';
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
  const { categories, settings } = useStore();
  // The sheet fills this with its animated close; until then, plain back.
  const close = useRef<() => void>(safeBack);
  const { addExpense, updateExpense, deleteExpense, restoreExpense } = useActions();
  const toast = useToast();
  const today = useToday();

  const validPreset = categories.some((k) => k.id === presetCategory) ? presetCategory : undefined;
  // Hidden categories are not offered, except the one this expense (or the preset) already uses.
  const offered = categories.filter((k) => !k.hidden || k.id === existing?.categoryId || k.id === validPreset);
  const [currency, setCurrency] = useState<CurrencyCode>(existing?.currency ?? settings.currency);
  // The user's currencies; an expense in a currency they have since removed keeps it as an option.
  const offeredCurrencies = [...chosenCurrencies(settings), ...(existing && !chosenCurrencies(settings).includes(existing.currency) ? [existing.currency] : [])];
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

  // Web: put the cursor in the amount for a new expense, unless a screen reader is on (then the
  // user should land on the heading first). On phones the keyboard would take the sheet to full
  // height straight away, so the sheet opens at half height and a tap on the amount opens it.
  useEffect(() => {
    if (existing || Platform.OS !== 'web') return;
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
      toast({ message: ok ? 'Expense updated' : 'This expense was deleted, so it could not be updated', success: ok });
      // A failed update is not a success: warn instead.
      const feedback = ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning;
      Haptics.notificationAsync(feedback).catch(() => {});
    } else {
      addExpense({ amount, currency, categoryId, day, note: note.trim() });
      toast({ message: `Saved ${formatMoney(amount, currency)} to ${cat?.name ?? 'your expenses'}`, success: true });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    close.current();
  };

  const remove = () => {
    if (!existing || busy.current) return;
    busy.current = true;
    const removed = deleteExpense(existing.id);
    close.current();
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
    <BottomSheet
      title={existing ? 'Edit expense' : 'Add expense'}
      closeRef={close}
      footer={<Button label={existing ? 'Save changes' : 'Save expense'} onPress={save} />}>
        <View style={{ gap: space.s }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s, justifyContent: 'space-between', alignItems: 'center' }}>
            <T variant="sub" tone="inkSoft" nativeID="amountLabel" importantForAccessibility="no">
              Amount
            </T>
            {offeredCurrencies.length < 2 ? (
              <T variant="caption" tone="inkMute" accessibilityLabel={`In ${currencyInfo(currency).name}`}>
                {currencyInfo(currency).symbol} {currency}
              </T>
            ) : (
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Currency"
              style={{ flexDirection: 'row', backgroundColor: c.ground, borderRadius: radius.pill, padding: 2 }}>
              {offeredCurrencies.map((code) => {
                const on = code === currency;
                return (
                  <Pressable
                    key={code}
                    onPress={() => setCurrency(code)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on, selected: on }}
                    accessibilityLabel={`${code}, ${currencyInfo(code).name}`}
                    style={{ minHeight: TARGET, minWidth: 64, paddingHorizontal: space.m, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.surface : 'transparent' }}>
                    <T variant="caption" tone={on ? 'ink' : 'inkMute'}>
                      {currencyInfo(code).symbol} {code}
                    </T>
                  </Pressable>
                );
              })}
            </View>
            )}
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
              {currencyInfo(currency).symbol}
            </T>
            <TextInput
              ref={amountRef}
              value={amountText}
              onChangeText={(t) => setAmountText(t.replace(/[^\d.,]/g, ''))}
              keyboardType="decimal-pad"
              inputMode="decimal"
              placeholder="0"
              placeholderTextColor={c.inkMute}
              accessibilityLabel={`Amount in ${currencyInfo(currency).name}`}
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

        <T variant="headline" style={{ marginTop: space.xl }} importantForAccessibility="no">
          Category
        </T>
        {/* One scrolling row, so amount, category and Save fit in the half-height sheet. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          accessibilityRole="radiogroup"
          accessibilityLabel="Category"
          style={{ marginTop: space.s, marginHorizontal: -space.xl }}
          contentContainerStyle={{ paddingHorizontal: space.xl - 4 }}>
          {offered.map((cat, i) => {
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
                style={{ width: 88, padding: 4 }}>
                <View
                  style={{
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: space.s,
                    borderRadius: radius.m,
                    borderWidth: 1.5,
                    borderColor: on ? c.accent : 'transparent',
                    backgroundColor: on ? c.accentTint : 'transparent',
                    minHeight: 76,
                  }}>
                  <IconDisc icon={cat.icon} size={40} />
                  <T variant="caption" tone={on ? 'ink' : 'inkSoft'} maxFontSizeMultiplier={1.6} numberOfLines={1} style={{ textAlign: 'center', paddingHorizontal: 2 }}>
                    {shortLabel(cat)}
                  </T>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View accessibilityLiveRegion="polite" aria-live="polite">
          {categoryError ? <T variant="sub" tone="danger">{categoryError}</T> : null}
        </View>
        <SheetFold />

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
    </BottomSheet>
  );
}
