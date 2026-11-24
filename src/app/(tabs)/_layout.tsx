import { IconChartPie, IconHome, IconPlus, IconReceipt, IconSettings } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ComponentRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STROKE } from '@/components/icons';
import { TAB_BAR, useKeyboardOpen } from '@/components/tab-bar';
import { T } from '@/components/text';
import { dark, radius } from '@/theme/tokens';
import { AppearanceProvider, useTheme } from '@/theme/use-theme';

const ADD_SIZE = 56;

/**
 * The floating finance dock on every platform: a rounded dark bar floating above the bottom edge
 * with Home, Expenses, Reports and Settings, and a raised round Add expense button in the middle,
 * the app's one primary action, one tap away from any tab. Always dark (light mode too), so its
 * contents use the dark palette. It steps aside while the keyboard is open. Screens pad their
 * content by useTabBarClearance().
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const keyboardOpen = useKeyboardOpen();
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        accessibilityRole="tablist"
        style={{
          display: keyboardOpen ? 'none' : 'flex',
          position: 'absolute',
          left: TAB_BAR.inset,
          right: TAB_BAR.inset,
          bottom: insets.bottom + TAB_BAR.gap,
          height: TAB_BAR.height,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 6,
          borderRadius: radius.xxl,
          backgroundColor: dark.surface,
          shadowColor: dark.fabShadow,
          shadowOpacity: 0.3,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon={IconHome} label="Home" />
        </TabTrigger>
        <TabTrigger name="expenses" href="/expenses" asChild>
          <TabButton icon={IconReceipt} label="Expenses" />
        </TabTrigger>
        <AddDockButton />
        <TabTrigger name="reports" href="/reports" asChild>
          <TabButton icon={IconChartPie} label="Reports" />
        </TabTrigger>
        <TabTrigger name="settings" href="/settings" asChild>
          <TabButton icon={IconSettings} label="Settings" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

/** The raised + in the middle of the dock: opens Add expense. A ring in the bar's colour sets it off. */
function AddDockButton() {
  return (
    <View style={{ flex: 1, alignItems: 'center', height: TAB_BAR.height }}>
      <Pressable
        onPress={() => router.push('/expense/new')}
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        style={({ pressed }) => ({
          marginTop: -TAB_BAR.raise,
          width: ADD_SIZE + 8,
          height: ADD_SIZE + 8,
          borderRadius: radius.pill,
          backgroundColor: dark.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        })}>
        {({ pressed }) => (
          <View
            style={{
              width: ADD_SIZE,
              height: ADD_SIZE,
              borderRadius: radius.pill,
              backgroundColor: pressed ? dark.buttonPressed : dark.button,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconPlus size={26} color={dark.onButton} strokeWidth={2.25} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const TabButton = forwardRef<ComponentRef<typeof View>, TabTriggerSlotProps & { icon: typeof IconHome; label: string }>(
  function TabButton({ icon, label, isFocused, ...props }, ref) {
    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: !!isFocused }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: TAB_BAR.height, gap: 2 }}>
        <AppearanceProvider mode="dark">
          <TabFace icon={icon} label={label} active={!!isFocused} />
        </AppearanceProvider>
      </Pressable>
    );
  },
);

function TabFace({ icon: Icon, label, active }: { icon: typeof IconHome; label: string; active: boolean }) {
  const { c } = useTheme();
  return (
    <>
      <Icon size={24} color={active ? c.accent : c.inkMute} strokeWidth={STROKE} />
      <T variant="caption" tone={active ? 'accent' : 'inkMute'}>
        {label}
      </T>
    </>
  );
}
