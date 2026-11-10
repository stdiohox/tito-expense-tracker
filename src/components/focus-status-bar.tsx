import { useIsFocused } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';

/**
 * Tab screens stay mounted, so a plain <StatusBar> would leave whichever tab mounted last in
 * charge. Only the focused screen renders one.
 */
export function FocusStatusBar({ style }: { style: StatusBarStyle }) {
  return useIsFocused() ? <StatusBar style={style} /> : null;
}
