import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { CurrencyPicker } from '@/components/currency-picker';
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
import type { AppearanceMode } from '@/domain/types';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Settings() {
  const { c } = useTheme();
  const clearance = useTabBarClearance();
  const { settings } = useStore();
  const { updateSettings, signOut, loadStressData } = useActions();
  const toast = useToast();
  const set = (patch: Parameters<typeof updateSettings>[0]) =>
    updateSettings(patch).catch(() => toast({ message: 'That setting couldn’t be saved. Try again.' }));

  return (
    <ScrollView
      style={{ backgroundColor: c.ground }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: clearance + space.xxl }}>
      <ScreenHero title="Settings">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, marginTop: space.s }}>
          <Avatar first={settings.firstName} last={settings.lastName} size={56} />
          <View style={{ flex: 1 }}>
            <T variant="title" tone="onBrand" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {fullName(settings) || 'Your account'}
            </T>
            <T variant="sub" tone="onBrandSoft" numberOfLines={1}>
              {settings.email || 'No email yet'}
            </T>
          </View>
        </View>
      </ScreenHero>
      <Reveal order={1} style={{ paddingHorizontal: space.l }}>

      <Group title="Account">
        <Item label="Name" value={fullName(settings)} />
        <Item label="Email" value={settings.email} />
        <Item label="Redo setup" onPress={() => router.push('/setup')} last />
      </Group>

      <Group title="Money">
        <View style={{ paddingVertical: space.m, gap: space.s, borderBottomWidth: 1, borderBottomColor: c.line }}>
          <CurrencyPicker
            label="Main currency"
            value={settings.currency}
            onChange={(currency) => currency && set({ currency })}
          />
          <CurrencyPicker
            label="Second currency (optional)"
            value={settings.secondCurrency}
            onChange={(secondCurrency) => set({ secondCurrency })}
            exclude={settings.currency}
            allowNone
          />
          <T variant="sub" tone="inkMute">
            Each currency is tracked on its own and never converted. Saved expenses keep the currency you entered them in, and budgets keep the currency you set them in.
          </T>
        </View>
        <Item label="Categories and budgets" onPress={() => router.push('/categories')} last />
      </Group>

      <Group title="Appearance">
        <View style={{ paddingVertical: space.m, gap: space.s }}>
          <Segmented<AppearanceMode>
            label="Appearance"
            value={settings.appearance}
            onChange={(appearance) => set({ appearance })}
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
            onValueChange={(v) => set({ reminderOn: v })}
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

      {/* Development builds only: production builds remove this block (__DEV__ is false there). */}
      {__DEV__ ? (
        <Group title="Developer">
          <Item
            label="Load stress data (10,000 expenses)"
            onPress={() => {
              loadStressData()
                .then(() => toast({ message: 'Loaded 10,000 expenses over 24 months in 20 currencies' }))
                .catch(() => toast({ message: 'The stress data couldn’t be loaded' }));
            }}
            last
          />
        </Group>
      ) : null}

      <Group>
        <Item
          label="Sign out"
          tone="accent"
          onPress={() => {
            // Your expenses stay on this phone; signing back in shows them again.
            signOut()
              .then(() => router.replace('/welcome'))
              .catch(() => toast({ message: 'You couldn’t be signed out. Try again.' }));
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

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
