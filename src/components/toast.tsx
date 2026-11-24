import { IconCircleCheck } from '@tabler/icons-react-native';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, ReduceMotion } from 'react-native-reanimated';

import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { STROKE } from './icons';
import { useTabBarClearance } from './tab-bar';
import { T } from './text';

/** `success` adds a small mint check (the pop colour, on the dark toast). */
type Toast = { message: string; success?: boolean; actionLabel?: string; actionA11yLabel?: string; onAction?: () => void };

const Ctx = createContext<(t: Toast) => void>(() => {});

/** Room above the floating tab bar for the Add expense button (56 tall, 16 above the bar). */
const ABOVE_ADD_BUTTON = space.l + 56 + space.s;

/**
 * Snackbar with an optional action (used for "Undo" after a delete).
 * 6 s normally; with a screen reader on, a toast with an action stays 20 s so Undo is reachable.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(Toast & { key: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);
  const readerOn = useRef(false);
  const clearance = useTabBarClearance();
  const { c } = useTheme();

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((v) => (readerOn.current = v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (v) => (readerOn.current = v));
    return () => {
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const show = useCallback((t: Toast) => {
    if (timer.current) clearTimeout(timer.current);
    seq.current += 1;
    setToast({ ...t, key: seq.current });
    // iOS has no live regions; Android and web announce through the live region below.
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(t.message);
    const ms = t.actionLabel && readerOn.current ? 20_000 : 6_000;
    timer.current = setTimeout(() => setToast(null), ms);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && (
        <Animated.View
          key={toast.key}
          entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}
          exiting={FadeOutDown.duration(180).reduceMotion(ReduceMotion.System)}
          pointerEvents="box-none"
          style={{ position: 'absolute', left: space.l, right: space.l, bottom: clearance + ABOVE_ADD_BUTTON }}>
          <View
            accessibilityLiveRegion="polite"
            aria-live="polite"
            style={{
              backgroundColor: c.toast,
              borderRadius: radius.m,
              paddingLeft: space.l,
              paddingRight: space.s,
              minHeight: 52,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.s,
              shadowColor: c.toastShadow,
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}>
            {toast.success ? <IconCircleCheck size={20} color={c.pop} strokeWidth={STROKE} /> : null}
            <T variant="sub" style={{ flex: 1, color: c.onToast }}>
              {toast.message}
            </T>
            {toast.actionLabel && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={toast.actionA11yLabel ?? toast.actionLabel}
                onPress={() => {
                  toast.onAction?.();
                  setToast(null);
                }}
                hitSlop={8}
                style={{ minHeight: TARGET, minWidth: 64, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.m }}>
                <T variant="headline" style={{ color: c.toastAction }}>
                  {toast.actionLabel}
                </T>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
