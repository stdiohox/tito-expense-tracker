import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The floating finance dock: a frosted white bar 64 tall, 88% of the screen width and centred,
 * 16 above the bottom safe area, with the Add expense button raised 14 above its top edge.
 */
export const TAB_BAR = { height: 64, gap: 16, width: '88%', side: '6%', raise: 14 } as const;

/**
 * Distance from the bottom of the screen to the top of the dock (its raised Add button included).
 * Tab screens pad their content by this, and the toast sits above it.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR.gap + TAB_BAR.height + TAB_BAR.raise;
}

/** True while the software keyboard is open, so the dock can step aside. */
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
