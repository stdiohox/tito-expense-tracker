import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import { STROKE } from '@/components/icons';
import { Segmented } from '@/components/segmented';
import { ScreenHero } from '@/components/screen-hero';
import { Reveal } from '@/components/reveal';
import { switchColors } from '@/components/switch-colors';
import { useTabBarClearance } from '@/components/tab-bar';
import { T } from '@/components/text';
import { Wordmark } from '@/components/wordmark';
import { useToast } from '@/components/toast';
import { fullName, useActions, useStore } from '@/data/store';
import { CURRENCIES } from '@/domain/money';
import type { AppearanceMode, CurrencyCode } from '@/domain/types';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Settings() {
  const { c } = useTheme();
  const clearance = useTabBarClearance();
  const { settings } = useStore();
  const { updateSettings, signOut } = useActions();
  const toast = useToast();

  return (
    <ScrollView
      style={{ backgroundColor: c.ground }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: clearance + space.xxl }}>
      <ScreenHero title="Settings">
        <T variant="largeTitle" tone="onBrand" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {settings.firstName || 'Your account'}
        </T>
        <T variant="sub" tone="onBrandSoft" numberOfLines={1}>
          {settings.email || 'No email yet'}
        </T>
      </ScreenHero>
      <Reveal order={1} style={{ paddingHorizontal: space.l }}>

      <Group title="Account">
        <Item label="Name" value={fullName(settings)} />
        <Item label="Email" value={settings.email} />
        <Item label="Redo setup" onPress={() => router.push('/setup')} last />
      </Group>

      <Group title="Money">
        <View style={{ paddingVertical: space.m, gap: space.s, borderBottomWidth: 1, borderBottomColor: c.line }}>
          <T variant="bodyStrong" importantForAccessibility="no">
            Main currency
          </T>
          <Segmented
            label="Main currency"
            value={settings.currency}
            onChange={(currency) => updateSettings({ currency })}
            options={(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => ({
              key: code,
              label: `${CURRENCIES[code].symbol} ${CURRENCIES[code].name}`,
            }))}
          />
          <T variant="sub" tone="inkMute">
            Totals use this currency. Saved expenses keep the currency you entered them in, and budgets keep the currency you set them in.
          </T>
        </View>
        <Item label="Categories and budgets" onPress={() => router.push('/categories')} last />
      </Group>

      <Group title="Appearance">
        <View style={{ paddingVertical: space.m, gap: space.s }}>
          <Segmented<AppearanceMode>
            label="Appearance"
            value={settings.appearance}
            onChange={(appearance) => updateSettings({ appearance })}
            options={[
              { key: 'system', label: 'System', a11yLabel: 'System, follows your phone' },
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
            ]}
          />
          <T variant="sub" tone="inkMute">
            System follows your phone’s light or dark setting.
          </T>
        </View>
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

      <View style={{ marginTop: space.xxl, alignItems: 'center', gap: space.s }}>
        <Wordmark align="center" />
        <T variant="caption" tone="inkMute" style={{ textAlign: 'center' }}>
          Preview build · your data stays until the app reloads
        </T>
      </View>
      </Reveal>
    </ScrollView>
  );
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: space.xxl }}>
      {title ? (
        <T variant="headline" accessibilityRole="header" style={{ marginBottom: space.s, paddingHorizontal: space.xs }}>
          {title}
        </T>
      ) : null}
      <View style={{ backgroundColor: c.surface, borderRadius: radius.xxl, paddingHorizontal: space.l }}>{children}</View>
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
