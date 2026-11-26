import { IconCheck, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { REGIONS, currencyInfo, searchCurrencies } from '@/domain/money';
import type { CurrencyCode } from '@/domain/types';
import { TARGET, fonts, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { STROKE } from './icons';
import { T } from './text';
import { useFocusBorder } from './use-focus-border';

/** "Nigerian naira (NGN)", for screen readers. */
const spoken = (code: CurrencyCode) => `${currencyInfo(code).name} (${code})`;

/**
 * Pick one currency from the sixteen: a row showing the choice (flag, code, name) that opens a
 * search field and the list below it, grouped by region. Search matches the code, name, symbol and
 * every country that uses it ("Germany" finds the euro, "Senegal" the West African CFA franc),
 * ignoring accents and punctuation.
 * `exclude` greys out a currency already used elsewhere (the main one, when picking the second);
 * `allowNone` adds a "None" option and lets the value be null.
 */
export function CurrencyPicker({
  label,
  value,
  onChange,
  exclude,
  allowNone,
  hint,
}: {
  label: string;
  value: CurrencyCode | null;
  onChange: (code: CurrencyCode | null) => void;
  exclude?: CurrencyCode | null;
  allowNone?: boolean;
  hint?: string;
}) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const focus = useFocusBorder();

  const q = query.trim();
  const matches = searchCurrencies(q);
  // The list in its regions (Africa, Europe, ...), empty regions left out.
  const groups = REGIONS.map((region) => ({ region, codes: matches.filter((code) => currencyInfo(code).region === region) })).filter((g) => g.codes.length);

  const choose = (code: CurrencyCode | null) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  const current = value ? currencyInfo(value) : null;

  return (
    <View style={{ gap: space.xs }}>
      <T variant="bodyStrong" importantForAccessibility="no">
        {label}
      </T>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? spoken(value) : 'none'}`}
        accessibilityHint={open ? 'Closes the list' : 'Opens the list of currencies'}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.m,
          minHeight: 52,
          paddingHorizontal: space.m,
          borderRadius: radius.m,
          borderWidth: 1,
          borderColor: open ? c.accent : c.fieldBorder,
          backgroundColor: pressed ? c.accentTint : c.surface,
        })}>
        <T style={{ fontSize: 22, lineHeight: 28 }} importantForAccessibility="no">
          {current ? current.flag : '—'}
        </T>
        <View style={{ flex: 1 }}>
          <T variant="bodyStrong" numberOfLines={1}>
            {value ? `${value} · ${current?.symbol}` : 'None'}
          </T>
          <T variant="sub" tone="inkMute" numberOfLines={1}>
            {current ? current.name : 'Only one currency'}
          </T>
        </View>
        {open ? <IconChevronUp size={20} color={c.inkMute} strokeWidth={STROKE} /> : <IconChevronDown size={20} color={c.inkMute} strokeWidth={STROKE} />}
      </Pressable>
      {hint ? (
        <T variant="sub" tone="inkMute">
          {hint}
        </T>
      ) : null}

      {open ? (
        <View style={{ gap: space.s, marginTop: space.xs }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.s,
              borderRadius: radius.m,
              ...focus.border,
              paddingLeft: space.m - focus.inset,
              backgroundColor: c.surface,
            }}>
            <View style={{ transform: [{ translateY: 2 }] }}>
              <IconSearch size={18} color={c.inkMute} strokeWidth={STROKE} />
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search: naira, GBP, Senegal…"
              placeholderTextColor={c.inkMute}
              accessibilityLabel={`Search currencies for ${label.toLowerCase()}`}
              autoCorrect={false}
              autoCapitalize="none"
              {...focus.focusProps}
              maxFontSizeMultiplier={2}
              style={{ flex: 1, minWidth: 0, height: 46, paddingVertical: 0, includeFontPadding: false, fontFamily: fonts.regular, fontSize: 16, color: c.ink }}
            />
          </View>
          <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ borderRadius: radius.m, backgroundColor: c.surface, overflow: 'hidden' }}>
            {allowNone && !q ? <Option code={null} on={value === null} onPress={() => choose(null)} /> : null}
            {groups.map((g) => (
              <View key={g.region}>
                <View accessibilityRole="header" style={{ paddingHorizontal: space.m, paddingTop: space.m, paddingBottom: space.xs, backgroundColor: c.ground }}>
                  <T variant="caption" tone="inkSoft">
                    {g.region}
                  </T>
                </View>
                {g.codes.map((code) => (
                  <Option key={code} code={code} on={code === value} disabled={code === exclude} onPress={() => choose(code)} />
                ))}
              </View>
            ))}
            {matches.length === 0 ? (
              <T variant="sub" tone="inkMute" style={{ padding: space.m }} accessibilityLiveRegion="polite">
                No currency matches “{query.trim()}”.
              </T>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Option({ code, on, disabled, onPress }: { code: CurrencyCode | null; on: boolean; disabled?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const k = code ? currencyInfo(code) : null;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: on, disabled }}
      accessibilityLabel={code ? `${spoken(code)}, ${k?.country}${disabled ? ', already your main currency' : ''}` : 'None, only one currency'}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.m,
        minHeight: TARGET + 4,
        paddingHorizontal: space.m,
        borderBottomWidth: 1,
        borderBottomColor: c.line,
        backgroundColor: on ? c.accentTint : pressed ? c.ground : 'transparent',
        opacity: disabled ? 0.4 : 1,
      })}>
      <T style={{ fontSize: 20, lineHeight: 26, width: 28 }} importantForAccessibility="no">
        {k ? k.flag : '—'}
      </T>
      <T variant="bodyStrong" numeric style={{ width: 44 }}>
        {code ?? 'None'}
      </T>
      <View style={{ flex: 1 }}>
        <T variant="sub" numberOfLines={1}>
          {k ? k.name : 'Only one currency'}
        </T>
        {k ? (
          <T variant="caption" tone="inkMute" numberOfLines={1}>
            {k.country} · {k.symbol}
          </T>
        ) : null}
      </View>
      {on ? <IconCheck size={18} color={c.accent} strokeWidth={2.25} /> : null}
    </Pressable>
  );
}
