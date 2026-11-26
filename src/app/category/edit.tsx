import { useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, Switch, TextInput, View } from 'react-native';

import { announceError } from '@/components/announce';
import { BottomSheet } from '@/components/bottom-sheet';
import { Button } from '@/components/button';
import { IconDisc } from '@/components/icon-disc';
import { Segmented } from '@/components/segmented';
import { PICKABLE_ICONS } from '@/components/icons';
import { safeBack } from '@/components/nav';
import { switchColors } from '@/components/switch-colors';
import { T } from '@/components/text';
import { useToast } from '@/components/toast';
import { useFocusBorder } from '@/components/use-focus-border';
import { chosenCurrencies, useActions, useCategory, useStore } from '@/data/store';
import { currencyInfo, amountToInput, parseAmount } from '@/domain/money';
import type { CategoryIcon, CurrencyCode } from '@/domain/types';
import { fonts, radius, space } from '@/theme/tokens';
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
  // The sheet fills this with its animated close; until then, plain back.
  const close = useRef<() => void>(safeBack);
  const toast = useToast();
  // A budget is in one currency, never converted: the user's currencies, plus the one an existing
  // budget was set in if the user has since removed it.
  const mine = chosenCurrencies(settings);
  const setIn = existing?.budget != null ? (existing.budgetCurrency ?? settings.currency) : null;
  const budgetOptions = setIn && !mine.includes(setIn) ? [...mine, setIn] : mine;

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState<CategoryIcon>(existing?.icon ?? 'savings');
  const [hasBudget, setHasBudget] = useState(setIn !== null);
  const [cur, setCur] = useState<CurrencyCode>(setIn ?? settings.currency);
  const [budgetText, setBudgetText] = useState(setIn !== null && existing?.budget != null ? amountToInput(existing.budget, setIn) : '');
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
    saveCategory({
      id: existing?.id,
      name: name.trim(),
      icon,
      budget,
      budgetCurrency: budget !== null ? cur : undefined,
      builtIn: existing?.builtIn ?? false,
    });
    toast({ message: existing ? 'Category saved' : `${name.trim()} added`, success: true });
    close.current();
  };

  const field = {
    minHeight: 52,
    borderRadius: radius.m,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: c.ink,
  } as const;

  return (
    <BottomSheet
      title={existing ? 'Edit category' : 'New category'}
      closeRef={close}
      footer={<Button label={existing ? 'Save' : 'Create category'} onPress={save} />}>
        <T variant="headline" nativeID="nameLabel">
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
        <View accessibilityLiveRegion="polite" aria-live="polite">
          {nameError ? (
            <T variant="sub" tone="danger">
              {nameError}
            </T>
          ) : null}
        </View>

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
              See how much is left as you spend.
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
        {hasBudget && budgetOptions.length > 1 ? (
          <View style={{ marginTop: space.s }}>
            <Segmented
              label="Budget currency"
              value={cur}
              onChange={setCur}
              options={budgetOptions.map((code) => ({ key: code, label: `${currencyInfo(code).symbol} ${code}`, a11yLabel: currencyInfo(code).name }))}
            />
          </View>
        ) : null}
        {hasBudget ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.s, ...field, ...budgetFocus.border, paddingHorizontal: space.l - budgetFocus.inset }}>
            <T variant="bodyStrong" tone="inkSoft">
              {currencyInfo(cur).symbol}
            </T>
            <TextInput
              ref={budgetRef}
              value={budgetText}
              onChangeText={(t) => setBudgetText(t.replace(/[^\d.,]/g, ''))}
              keyboardType="decimal-pad"
              inputMode="decimal"
              placeholder="50,000"
              placeholderTextColor={c.inkMute}
              accessibilityLabel={`Monthly budget in ${currencyInfo(cur).name}`}
              maxFontSizeMultiplier={2}
              {...budgetFocus.focusProps}
              style={{ flex: 1, minHeight: 50, marginLeft: 4, fontFamily: fonts.semibold, fontSize: 16, color: c.ink }}
            />
          </View>
        ) : null}
        <View accessibilityLiveRegion="polite" aria-live="polite">
          {budgetError ? (
            <T variant="sub" tone="danger">
              {budgetError}
            </T>
          ) : null}
        </View>
    </BottomSheet>
  );
}
