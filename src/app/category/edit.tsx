import { IconX } from '@tabler/icons-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { announceError } from '@/components/announce';
import { Button } from '@/components/button';
import { IconDisc } from '@/components/icon-disc';
import { PICKABLE_ICONS, STROKE } from '@/components/icons';
import { safeBack } from '@/components/nav';
import { switchColors } from '@/components/switch-colors';
import { T } from '@/components/text';
import { useToast } from '@/components/toast';
import { useFocusBorder } from '@/components/use-focus-border';
import { useActions, useCategory, useStore } from '@/data/store';
import { CURRENCIES, amountToInput, formatMoney, parseAmount } from '@/domain/money';
import { budgetFor } from '@/domain/summary';
import type { CategoryIcon } from '@/domain/types';
import { TARGET, fonts, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const ICON_NAMES: Record<CategoryIcon, string> = {
  rent: 'House', food: 'Cutlery', transport: 'Bus', bills: 'Light bulb', airtime: 'Phone', family: 'People',
  faith: 'Prayer', personal: 'Scissors', health: 'Heartbeat', entertainment: 'Film', shopping: 'Shopping bag',
  other: 'Dots', savings: 'Piggy bank', education: 'Graduation cap', gift: 'Gift', business: 'Briefcase',
};

/** Create a category, or edit one's name, icon and budget. */
export default function EditCategory() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useCategory(id);
  const { settings } = useStore();
  const { saveCategory } = useActions();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const cur = settings.currency;

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState<CategoryIcon>(existing?.icon ?? 'savings');
  const current = existing ? budgetFor(existing, cur) : null;
  // A budget set in another currency is shown, never silently re-labelled as this one.
  const foreignBudget = existing?.budget != null && existing.budgetCurrency && existing.budgetCurrency !== cur ? existing : null;
  const [hasBudget, setHasBudget] = useState(current !== null);
  const [budgetText, setBudgetText] = useState(current !== null ? amountToInput(current, cur) : '');
  const [tried, setTried] = useState(false);
  const busy = useRef(false);
  const nameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const budgetRef = useRef<ComponentRef<typeof TextInput>>(null);

  const budget = hasBudget ? parseAmount(budgetText, cur) : null;
  const nameError = tried && !name.trim() ? 'Give the category a name' : null;
  const budgetError = tried && hasBudget && budget === null ? 'Enter a monthly amount' : null;
  const nameFocus = useFocusBorder(!!nameError);
  const budgetFocus = useFocusBorder(!!budgetError);

  const save = () => {
    if (busy.current) return;
    setTried(true);
    if (!name.trim()) return announceError('Give the category a name', nameRef);
    if (hasBudget && budget === null) return announceError('Enter a monthly amount', budgetRef);
    busy.current = true;
    const keepForeign = !hasBudget && foreignBudget;
    saveCategory({
      id: existing?.id,
      name: name.trim(),
      icon,
      budget: keepForeign ? foreignBudget.budget : budget,
      budgetCurrency: keepForeign ? foreignBudget.budgetCurrency : budget !== null ? cur : undefined,
      builtIn: existing?.builtIn ?? false,
    });
    toast({ message: existing ? 'Category saved' : `${name.trim()} added` });
    safeBack();
  };

  const field = {
    minHeight: 52,
    borderRadius: radius.m,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: c.ink,
  } as const;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable
        onPress={safeBack}
        accessibilityRole="button"
        accessibilityLabel="Close without saving"
        style={{ width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center', marginLeft: space.s, marginTop: space.m }}>
        <IconX size={22} color={c.ink} strokeWidth={STROKE} />
      </Pressable>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xxl }}>
        <T variant="largeTitle" accessibilityRole="header">
          {existing ? 'Edit category' : 'New category'}
        </T>

        <T variant="headline" style={{ marginTop: space.xxl }} nativeID="nameLabel">
          Name
        </T>
        <TextInput
          ref={nameRef}
          value={name}
          onChangeText={setName}
          editable={!existing?.builtIn}
          placeholder="For example, Savings"
          placeholderTextColor={c.inkMute}
          accessibilityLabelledBy="nameLabel"
          accessibilityLabel="Category name"
          maxLength={40}
          maxFontSizeMultiplier={2}
          {...nameFocus.focusProps}
          style={[field, nameFocus.border, { paddingHorizontal: space.l - nameFocus.inset, marginTop: space.s, opacity: existing?.builtIn ? 0.6 : 1 }]}
        />
        {existing?.builtIn ? (
          <T variant="sub" tone="inkMute" style={{ marginTop: space.xs }}>
            Starter categories keep their name.
          </T>
        ) : null}
        {nameError ? (
          <T variant="sub" tone="danger">
            {nameError}
          </T>
        ) : null}

        {!existing?.builtIn ? (
          <>
            <T variant="headline" style={{ marginTop: space.xxl }} nativeID="iconLabel">
              Icon
            </T>
            <View accessibilityRole="radiogroup" accessibilityLabelledBy="iconLabel" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s, marginTop: space.s }}>
              {PICKABLE_ICONS.map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setIcon(k)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: icon === k }}
                  accessibilityLabel={ICON_NAMES[k]}
                  style={{ padding: 3, borderRadius: 30, borderWidth: 2, borderColor: icon === k ? c.accent : 'transparent' }}>
                  <IconDisc icon={k} size={44} />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xxl, minHeight: 48 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="headline" nativeID="budgetLabel">
              Monthly budget
            </T>
            <T variant="sub" tone="inkMute">
              {foreignBudget && foreignBudget.budget !== null && foreignBudget.budgetCurrency
                ? `Currently ${formatMoney(foreignBudget.budget, foreignBudget.budgetCurrency)}, set in ${foreignBudget.budgetCurrency}. Turn on to set one in ${cur}.`
                : 'See how much is left as you spend.'}
            </T>
          </View>
          <Switch
            value={hasBudget}
            onValueChange={setHasBudget}
            accessibilityLabelledBy="budgetLabel"
            accessibilityLabel="Monthly budget"
            {...switchColors(c)}
          />
        </View>
        {hasBudget ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.s, ...field, ...budgetFocus.border, paddingHorizontal: space.l - budgetFocus.inset }}>
            <T variant="bodyStrong" tone="inkSoft">
              {CURRENCIES[cur].symbol}
            </T>
            <TextInput
              ref={budgetRef}
              value={budgetText}
              onChangeText={(t) => setBudgetText(t.replace(/[^\d.,]/g, ''))}
              keyboardType="decimal-pad"
              inputMode="decimal"
              placeholder="50,000"
              placeholderTextColor={c.inkMute}
              accessibilityLabel={`Monthly budget in ${CURRENCIES[cur].name}`}
              maxFontSizeMultiplier={2}
              {...budgetFocus.focusProps}
              style={{ flex: 1, minHeight: 50, marginLeft: 4, fontFamily: fonts.semibold, fontSize: 16, color: c.ink }}
            />
          </View>
        ) : null}
        {budgetError ? (
          <T variant="sub" tone="danger">
            {budgetError}
          </T>
        ) : null}
      </ScrollView>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.m, paddingBottom: insets.bottom + space.m, borderTopWidth: 1, borderTopColor: c.line }}>
        <Button label={existing ? 'Save' : 'Create category'} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}
