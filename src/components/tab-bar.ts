import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** The floating tab bar: 64 tall, 12 above the bottom safe area, 16 in from each side. */
export const TAB_BAR = { height: 64, gap: 12, inset: 16 } as const;

/**
 * Distance from the bottom of the screen to the top of the floating tab bar. Tab screens pad their
 * lists by this (plus room for the Add button), and the Add button and toast sit above it.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR.gap + TAB_BAR.height;
}

/** True while the software keyboard is open, so the floating bar can step aside. */
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
