import { IconCheck, IconChevronLeft } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { announceError } from '@/components/announce';
import { Button } from '@/components/button';
import { Field } from '@/components/field';
import { IconDisc } from '@/components/icon-disc';
import { STROKE } from '@/components/icons';
import { Panel } from '@/components/panel';
import { CurrencyPicker } from '@/components/currency-picker';
import { Segmented } from '@/components/segmented';
import { T } from '@/components/text';
import { chosenCurrencies, useActions, useStore } from '@/data/store';
import { currencyInfo, parseAmount } from '@/domain/money';
import type { CurrencyCode, SetupMode } from '@/domain/types';
import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const MODES: { key: SetupMode; title: string; text: string }[] = [
  { key: 'track', title: 'Just track', text: 'Log what you spend and see your month.' },
  { key: 'budgets', title: 'Track and budgets', text: 'Add monthly budgets to the categories you choose.' },
  { key: 'full', title: 'Full picture', text: 'Budgets, plus a daily reminder if you haven’t logged anything.' },
];
const STEPS = ['Your currencies', 'How hands-on', 'Your categories'] as const;
const MAX_BUDGETS = 4;

/**
 * Three-step setup after sign-up (and from Settings → Redo setup). Each step has Skip, which leaves
 * that step's setting as it is; Continue applies it. Finish (or Skip on the last step) lands on Home.
 */
export default function Setup() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, categories } = useStore();
  const { updateSettings, saveCategory } = useActions();
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [second, setSecond] = useState<CurrencyCode | null>(settings.secondCurrency);
  const [mode, setMode] = useState<SetupMode>(settings.mode);
  const [shown, setShown] = useState<Record<string, boolean>>(() => Object.fromEntries(categories.map((k) => [k.id, !k.hidden])));
  const [budgetIds, setBudgetIds] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  // Each budget is in one currency, chosen here (the main one unless changed); never converted.
  const [budgetCur, setBudgetCur] = useState<Record<string, CurrencyCode>>({});
  const [tried, setTried] = useState(false);
  const fieldRefs = useRef<Record<string, ComponentRef<typeof TextInput> | null>>({});

  const visibleCount = Object.values(shown).filter(Boolean).length;
  const wantsBudgets = mode !== 'track';
  const mine = chosenCurrencies(settings);
  const curOf = (id: string): CurrencyCode => (budgetCur[id] && mine.includes(budgetCur[id]) ? budgetCur[id] : settings.currency);

  const finish = () => router.dismissTo('/');
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish());

  const proceed = () => {
    if (step === 0) {
      updateSettings({ currency, secondCurrency: second === currency ? null : second });
      return next();
    }
    if (step === 1) {
      // For now, "Full picture" turns the daily reminder on; other choices leave it as it is.
      updateSettings(mode === 'full' ? { mode, reminderOn: true } : { mode });
      return next();
    }
    setTried(true);
    const chosen = wantsBudgets ? budgetIds.filter((id) => shown[id]) : [];
    const missing = chosen.find((id) => parseAmount(amounts[id] ?? '', curOf(id)) === null);
    if (missing) {
      const name = categories.find((k) => k.id === missing)?.name ?? 'this category';
      return announceError(`Enter a monthly budget for ${name}`, { current: fieldRefs.current[missing] });
    }
    for (const cat of categories) {
      const hidden = !shown[cat.id];
      const budget = chosen.includes(cat.id) ? parseAmount(amounts[cat.id] ?? '', curOf(cat.id)) : null;
      if (hidden !== !!cat.hidden || budget !== null) {
        saveCategory({ ...cat, hidden, ...(budget !== null ? { budget, budgetCurrency: curOf(cat.id) } : null) });
      }
    }
    finish();
  };

  const toggleShown = (id: string) => {
    const on = shown[id];
    if (on && visibleCount <= 1) return; // keep at least one category to log against
    setShown({ ...shown, [id]: !on });
    if (on) setBudgetIds(budgetIds.filter((b) => b !== id));
  };
  const toggleBudget = (id: string) => {
    if (budgetIds.includes(id)) setBudgetIds(budgetIds.filter((b) => b !== id));
    else if (budgetIds.length < MAX_BUDGETS) setBudgetIds([...budgetIds, id]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.ground }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + space.s, paddingHorizontal: space.l, gap: space.s }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: TARGET }}>
          {step > 0 ? (
            <Pressable
              onPress={() => setStep(step - 1)}
              accessibilityRole="button"
              accessibilityLabel="Back to the previous step"
              style={{ width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center', marginLeft: -space.s }}>
              <IconChevronLeft size={24} color={c.ink} strokeWidth={STROKE} />
            </Pressable>
          ) : (
            <View style={{ width: TARGET }} />
          )}
          <Pressable
            onPress={next}
            accessibilityRole="button"
            accessibilityLabel={step < STEPS.length - 1 ? `Skip ${STEPS[step].toLowerCase()}` : 'Skip and finish'}
            hitSlop={8}
            style={({ pressed }) => ({ minHeight: TARGET, minWidth: TARGET, alignItems: 'flex-end', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <T variant="bodyStrong" tone="accent">
              Skip
            </T>
          </Pressable>
        </View>
        <View accessible accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`} accessibilityValue={{ min: 1, max: STEPS.length, now: step + 1 }}>
          <T variant="caption" tone="inkMute">
            Step {step + 1} of {STEPS.length}
          </T>
          <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.s }}>
            {STEPS.map((s, i) => (
              <View key={s} style={{ flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: i <= step ? c.accent : c.line }} />
            ))}
          </View>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.l, paddingTop: space.xl, paddingBottom: space.xxl, gap: space.m }}>
        <View style={{ paddingHorizontal: space.xs, gap: space.s }}>
          <T variant="largeTitle" accessibilityRole="header">
            {step === 0 ? 'Your currencies' : step === 1 ? 'How hands-on do you want to be?' : 'Your categories'}
          </T>
          <T variant="body" tone="inkSoft">
            {step === 0
              ? 'Pick the currency you spend in most. Add a second if you also spend in another one: each is tracked on its own and never converted.'
              : step === 1
                ? 'You can change this any time in Settings → Redo setup.'
                : 'Untick the ones you don’t need. Expenses already in them still count.'}
          </T>
        </View>

        {step === 0 ? (
          <Panel>
            <View style={{ paddingVertical: space.m, gap: space.xl }}>
              <CurrencyPicker
                label="Main currency"
                value={currency}
                onChange={(code) => {
                  if (!code) return;
                  setCurrency(code);
                  if (code === second) setSecond(null);
                }}
              />
              <CurrencyPicker
                label="Second currency (optional)"
                value={second}
                onChange={setSecond}
                exclude={currency}
                allowNone
                hint="For example, US dollars if you are paid or spend in both."
              />
            </View>
          </Panel>
        ) : null}

        {step === 1 ? (
          <View accessibilityRole="radiogroup" accessibilityLabel="How hands-on" style={{ gap: space.s }}>
            {MODES.map((m) => {
              const on = m.key === mode;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => setMode(m.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on, selected: on }}
                  accessibilityLabel={`${m.title}. ${m.text}`}
                  style={{
                    backgroundColor: on ? c.accentTint : c.surface,
                    borderColor: on ? c.accent : 'transparent',
                    borderWidth: 2,
                    borderRadius: radius.xl,
                    padding: space.l,
                    gap: space.xs,
                  }}>
                  <T variant="headline">{m.title}</T>
                  <T variant="sub" tone={on ? 'ink' : 'inkSoft'}>
                    {m.text}
                  </T>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 2 ? (
          <>
            <Panel>
              {categories.map((cat, i) => {
                const on = !!shown[cat.id];
                const locked = on && visibleCount <= 1;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggleShown(cat.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on, disabled: locked }}
                    accessibilityLabel={cat.name}
                    accessibilityHint={locked ? 'Keep at least one category' : undefined}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, borderBottomWidth: i < categories.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                    <IconDisc icon={cat.icon} size={36} />
                    <T variant="bodyStrong" style={{ flex: 1 }}>
                      {cat.name}
                    </T>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        borderWidth: on ? 0 : 1.5,
                        borderColor: c.fieldBorder,
                        backgroundColor: on ? c.button : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {on ? <IconCheck size={16} color={c.onButton} strokeWidth={2.5} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </Panel>

            {wantsBudgets ? (
              <Panel title="Monthly budgets (optional)">
                <T variant="sub" tone="inkSoft" style={{ marginTop: space.xs }}>
                  Pick up to {MAX_BUDGETS} categories to keep an eye on. You can add more later.
                </T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s, marginTop: space.m }}>
                  {categories
                    .filter((k) => shown[k.id])
                    .map((cat) => {
                      const on = budgetIds.includes(cat.id);
                      const full = !on && budgetIds.length >= MAX_BUDGETS;
                      return (
                        <Pressable
                          key={cat.id}
                          onPress={() => toggleBudget(cat.id)}
                          disabled={full}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: on, disabled: full }}
                          accessibilityLabel={`Budget for ${cat.name}`}
                          style={{
                            minHeight: TARGET,
                            justifyContent: 'center',
                            paddingHorizontal: space.m,
                            borderRadius: radius.pill,
                            borderWidth: 1.5,
                            borderColor: on ? c.accent : c.fieldBorder,
                            backgroundColor: on ? c.accentTint : 'transparent',
                            opacity: full ? 0.45 : 1,
                          }}>
                          <T variant="sub" tone="ink">
                            {cat.name}
                          </T>
                        </Pressable>
                      );
                    })}
                </View>
                <View style={{ gap: space.m, marginTop: space.m, marginBottom: space.m }}>
                  {budgetIds
                    .filter((id) => shown[id])
                    .map((id) => {
                      const cat = categories.find((k) => k.id === id);
                      const cur = curOf(id);
                      const bad = tried && parseAmount(amounts[id] ?? '', cur) === null;
                      return (
                        <View key={id} style={{ gap: space.s }}>
                          {mine.length > 1 ? (
                            <Segmented
                              label={`Currency for the ${cat?.name ?? 'category'} budget`}
                              value={cur}
                              onChange={(code) => setBudgetCur({ ...budgetCur, [id]: code })}
                              options={mine.map((code) => ({ key: code, label: `${currencyInfo(code).symbol} ${code}`, a11yLabel: currencyInfo(code).name }))}
                            />
                          ) : null}
                          <Field
                            ref={(el) => {
                              fieldRefs.current[id] = el;
                            }}
                            label={`${cat?.name ?? 'Category'}: a month, in ${currencyInfo(cur).name}`}
                            value={amounts[id] ?? ''}
                            onChangeText={(t) => setAmounts({ ...amounts, [id]: t.replace(/[^\d.,]/g, '') })}
                            keyboardType="decimal-pad"
                            inputMode="decimal"
                            placeholder={`${currencyInfo(cur).symbol}${currencyInfo(cur).spaced ? ' ' : ''}50,000`}
                            error={bad ? 'Enter a monthly amount' : null}
                          />
                        </View>
                      );
                    })}
                </View>
              </Panel>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <View style={{ paddingHorizontal: space.l, paddingTop: space.m, paddingBottom: insets.bottom + space.m, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.ground }}>
        <Button label={step < STEPS.length - 1 ? 'Continue' : 'Finish'} onPress={proceed} />
      </View>
    </KeyboardAvoidingView>
  );
}
