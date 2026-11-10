import { IconChartPie, IconHome, IconReceipt, IconSettings } from '@tabler/icons-react-native';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ComponentRef } from 'react';
import { Pressable, View } from 'react-native';

import { STROKE } from '@/components/icons';
import { T } from '@/components/text';
import { useTheme } from '@/theme/use-theme';

/** Web build: a bottom tab bar matching the native one (the native tab view has no web form). */
export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        style={{
          flexDirection: 'row',
          backgroundColor: c.surface,
          borderTopWidth: 1,
          borderTopColor: c.line,
          paddingBottom: 6,
        }}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon={IconHome} label="Home" />
        </TabTrigger>
        <TabTrigger name="expenses" href="/expenses" asChild>
          <TabButton icon={IconReceipt} label="Expenses" />
        </TabTrigger>
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

const TabButton = forwardRef<ComponentRef<typeof View>, TabTriggerSlotProps & { icon: typeof IconHome; label: string }>(
  function TabButton({ icon: Icon, label, isFocused, ...props }, ref) {
    const { c } = useTheme();
    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole="tab"
        accessibilityState={{ selected: !!isFocused }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 56, gap: 2 }}>
        <Icon size={24} color={isFocused ? c.accent : c.inkMute} strokeWidth={STROKE} />
        <T variant="caption" tone={isFocused ? 'accent' : 'inkMute'}>
          {label}
        </T>
      </Pressable>
    );
  },
);
