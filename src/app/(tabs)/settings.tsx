import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocusStatusBar } from '@/components/focus-status-bar';
import { STROKE } from '@/components/icons';
import { switchColors } from '@/components/switch-colors';
import { TabTitle } from '@/components/tab-title';
import { T } from '@/components/text';
import { useToast } from '@/components/toast';
import { useActions, useStore } from '@/data/store';
import { CURRENCIES } from '@/domain/money';
import type { CurrencyCode } from '@/domain/types';
import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Settings() {
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useStore();
  const { updateSettings, signOut } = useActions();
  const toast = useToast();

  return (
    <ScrollView
      style={{ backgroundColor: c.ground }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: insets.top, paddingBottom: insets.bottom + space.xxxl }}>
      <FocusStatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <TabTitle title="Settings" />

      <Group title="Account">
        <Item label="Name" value={settings.firstName} />
        <Item label="Email" value={settings.email} last />
      </Group>

      <Group title="Money">
        <View style={{ paddingVertical: space.m, gap: space.s, borderBottomWidth: 1, borderBottomColor: c.line }}>
          <T variant="bodyStrong" importantForAccessibility="no">
            Main currency
          </T>
          <View accessibilityRole="radiogroup" accessibilityLabel="Main currency" style={{ flexDirection: 'row', backgroundColor: c.ground, borderRadius: radius.pill, padding: 2 }}>
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const on = settings.currency === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => updateSettings({ currency: code })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on, selected: on }}
                  accessibilityLabel={`${CURRENCIES[code].symbol} ${CURRENCIES[code].name}`}
                  style={{ flex: 1, minHeight: TARGET, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.surface : 'transparent' }}>
                  <T variant="sub" tone={on ? 'ink' : 'inkMute'}>
                    {CURRENCIES[code].symbol} {CURRENCIES[code].name}
                  </T>
                </Pressable>
              );
            })}
          </View>
          <T variant="sub" tone="inkMute">
            Totals use this currency. Saved expenses keep the currency you entered them in, and budgets keep the currency you set them in.
          </T>
        </View>
        <Item label="Categories and budgets" onPress={() => router.push('/categories')} last />
      </Group>

      <Group title="Reminder">
        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: space.m, paddingVertical: space.m }}>
          <View style={{ flex: 1 }}>
            <T variant="bodyStrong" importantForAccessibility="no">
              Daily reminder
            </T>
            <T variant="sub" tone="inkMute">
              A nudge at {settings.reminderTime} if you haven’t logged anything that day
            </T>
          </View>
          <Switch
            value={settings.reminderOn}
            onValueChange={(v) => updateSettings({ reminderOn: v })}
            accessibilityLabel="Daily reminder"
            accessibilityHint={`A nudge at ${settings.reminderTime} if you haven’t logged anything that day`}
            {...switchColors(c)}
          />
        </View>
      </Group>

      <Group title="Your data">
        <Item label="Export as spreadsheet (CSV)" onPress={() => toast({ message: 'Export arrives in the next build' })} />
        <Item label="Privacy policy" onPress={() => toast({ message: 'Opens the privacy policy once it is published' })} last />
      </Group>

      <Group>
        <Item
          label="Sign out"
          tone="accent"
          onPress={() => {
            signOut();
            router.replace('/welcome');
          }}
        />
        <Item label="Delete account" tone="danger" onPress={() => router.push('/account/delete')} last />
      </Group>

      <T variant="caption" tone="inkMute" style={{ textAlign: 'center', marginTop: space.xxl }}>
        Preview build · showing sample data
      </T>
    </ScrollView>
  );
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: space.xxl }}>
      {title ? (
        <T variant="headline" accessibilityRole="header" style={{ marginBottom: space.s }}>
          {title}
        </T>
      ) : null}
      <View style={{ backgroundColor: c.surface, borderRadius: radius.l, paddingHorizontal: space.l }}>{children}</View>
    </View>
  );
}

function Item({
  label,
  value,
  onPress,
  tone = 'ink',
  last,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  tone?: 'ink' | 'accent' | 'danger';
  last?: boolean;
}) {
  const { c } = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: space.m, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <T variant="bodyStrong" tone={tone} style={{ flex: 1 }}>
        {label}
      </T>
      {value ? (
        <T variant="body" tone="inkSoft" numberOfLines={1} style={{ maxWidth: '60%' }}>
          {value}
        </T>
      ) : null}
      {onPress && tone === 'ink' ? <IconChevronRight size={20} color={c.inkMute} strokeWidth={STROKE} /> : null}
    </View>
  );
  if (!onPress) return <View accessible accessibilityLabel={value ? `${label}, ${value}` : label}>{content}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {content}
    </Pressable>
  );
}
