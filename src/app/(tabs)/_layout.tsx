import { IconChartPie, IconHome, IconPlus, IconReceipt, IconSettings } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ComponentRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STROKE } from '@/components/icons';
import { TAB_BAR, useKeyboardOpen } from '@/components/tab-bar';
import { T } from '@/components/text';
import { dockGlass, light, radius } from '@/theme/tokens';
import { AppearanceProvider, hexAlpha, useTheme } from '@/theme/use-theme';

const ADD_SIZE = 56;

/**
 * The floating finance dock on every platform: a frosted white glass bar, 88% of the screen wide,
 * floating above the page with a soft shadow, holding Home, Expenses, Reports and Settings and a
 * raised round Add expense button in the middle (the app's one primary action, one tap away from
 * any tab). It looks the same in light and dark mode and its contents use the light palette;
 * check-contrast.mjs checks them over anything that can scroll behind the glass. It steps aside
 * while the keyboard is open. Screens pad their content by useTabBarClearance().
 */
const DOCK_FILL = hexAlpha(light.dock, dockGlass.fill.light);
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
          left: TAB_BAR.side,
          right: TAB_BAR.side,
          bottom: insets.bottom + TAB_BAR.gap,
          height: TAB_BAR.height,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 4,
          borderRadius: radius.pill,
          backgroundColor: DOCK_FILL,
          borderWidth: 1,
          borderColor: hexAlpha(light.ink, dockGlass.edge.light),
          shadowColor: light.fabShadow,
          shadowOpacity: 0.22,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        }}>
        {/* A light highlight along the top edge: part of the glass look, decorative. */}
        <View
          accessible={false}
          aria-hidden
          style={{ position: 'absolute', top: 0, left: 28, right: 28, height: 1, backgroundColor: hexAlpha(light.onBrand, 0.9), pointerEvents: 'none' }}
        />
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

/** The raised + in the middle of the dock: opens Add expense. A ring in the dock's glass sets it off. */
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
          backgroundColor: DOCK_FILL,
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
              backgroundColor: pressed ? light.buttonPressed : light.button,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconPlus size={26} color={light.onButton} strokeWidth={2.25} />
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
        <AppearanceProvider mode="light">
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
