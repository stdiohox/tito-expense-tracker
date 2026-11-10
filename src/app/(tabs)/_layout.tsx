import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/theme/use-theme';

/**
 * System tab bar on iOS and Android (sections only; adding an expense is a button, not a tab).
 * Automatic content insets are off: screens place their own safe-area padding, and Home's
 * indigo header must run under the status bar.
 */
export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <NativeTabs tintColor={c.accent} iconColor={{ default: c.inkMute, selected: c.accent }}>
      <NativeTabs.Trigger disableAutomaticContentInsets name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableAutomaticContentInsets name="expenses">
        <NativeTabs.Trigger.Label>Expenses</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet.rectangle" md="receipt_long" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableAutomaticContentInsets name="reports">
        <NativeTabs.Trigger.Label>Reports</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.pie" md="pie_chart" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableAutomaticContentInsets name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
