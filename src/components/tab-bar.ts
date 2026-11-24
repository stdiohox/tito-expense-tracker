import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** The docked tab bar: 64 tall plus the bottom safe area, full width, rounded top corners. */
export const TAB_BAR = { height: 64 } as const;

/**
 * Distance from the bottom of the screen to the top of the docked tab bar. Tab screens pad their
 * lists by this (plus room for the Add button), and the Add button and toast sit above it.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR.height;
}

/** True while the software keyboard is open, so the tab bar can step aside. */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}
