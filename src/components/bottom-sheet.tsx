import { IconX } from '@tabler/icons-react-native';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { STROKE } from './icons';
import { safeBack } from './nav';
import { T } from './text';

type SheetApi = { close: () => void; setFold: (y: number) => void };
const SheetCtx = createContext<SheetApi>({ close: safeBack, setFold: () => {} });

/** Closes the sheet with its slide-down, then leaves the screen. Use it for ✕, Save and Delete. */
export const useSheetClose = () => useContext(SheetCtx).close;

/**
 * Marks where the sheet's half-height view ends: put it right after the essentials (for Add
 * expense: amount, currency and category), as a direct child of the sheet's content. The sheet
 * opens just tall enough to show everything above it plus the footer, and never under 45% of the
 * screen. Without a fold the sheet opens at full height.
 */
export function SheetFold() {
  const { setFold } = useContext(SheetCtx);
  return <View onLayout={(e) => setFold(e.nativeEvent.layout.y)} />;
}

const OPEN = { duration: 300, easing: Easing.out(Easing.cubic) };
const SHUT = { duration: 200, easing: Easing.in(Easing.cubic) };
const MIN_HALF = 0.45;

/**
 * A bottom sheet drawn by the app (not the native form sheet), so it looks and behaves the same
 * in Expo Go on iOS and Android and on the web. The screen behind stays visible above it.
 * - Opens at the fold (see SheetFold); drag the handle or header up for full height.
 * - Drag down, or ✕, closes it. Content scrolls inside; the footer (the Save button) stays
 *   pinned; when the keyboard opens the sheet goes full height so the keyboard never covers Save.
 * - With Reduce Motion on it appears and leaves without sliding.
 * The route shows it with presentation "transparentModal" and no animation of its own.
 */
export function BottomSheet({
  title,
  footer,
  children,
  closeRef,
}: {
  title: string;
  footer: ReactNode;
  children: ReactNode;
  /** Filled with the sheet's close(), for screens that hold the form state above the sheet. */
  closeRef?: RefObject<() => void>;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const reduce = useReducedMotion();
  const fullH = Math.round(winH - insets.top - space.s);

  const [fold, setFoldState] = useState<number | null>(null);
  const [chrome, setChrome] = useState({ head: 0, foot: 0 });
  const halfH = fold === null ? fullH : Math.min(fullH, Math.max(Math.round(winH * MIN_HALF), Math.round(chrome.head + fold + space.l + chrome.foot)));
  const measured = chrome.head > 0 && chrome.foot > 0;

  const height = useSharedValue(halfH);
  const drop = useSharedValue(winH); // slid out of view until measured
  const startH = useSharedValue(0);
  const shown = useSharedValue(0);
  const closing = useRef(false);
  const opened = useRef(false);
  const [expanded, setExpanded] = useState(false);

  const leave = useCallback(() => safeBack(), []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Keyboard.dismiss();
    if (reduce) return leave();
    shown.set(withTiming(0, SHUT));
    drop.set(withTiming(winH, SHUT, (done) => {
      if (done) scheduleOnRN(leave);
    }));
  }, [reduce, leave, drop, shown, winH]);

  useEffect(() => {
    if (closeRef) closeRef.current = close;
  }, [close, closeRef]);

  const snap = useCallback(
    (full: boolean) => {
      setExpanded(full);
      height.set(reduce ? (full ? fullH : halfH) : withTiming(full ? fullH : halfH, OPEN));
    },
    [fullH, halfH, height, reduce],
  );

  // Open once the header, footer and fold are measured (or straight away when there is no fold).
  useEffect(() => {
    if (opened.current || !measured) return;
    const wait = setTimeout(() => {
      opened.current = true;
      height.set(halfH);
      setExpanded(halfH >= fullH);
      drop.set(reduce ? 0 : withTiming(0, OPEN));
      shown.set(reduce ? 1 : withTiming(1, OPEN));
    }, fold === null ? 60 : 0);
    return () => clearTimeout(wait);
  }, [measured, fold, halfH, fullH, height, drop, shown, reduce]);

  // The keyboard never covers Save: go full height while it is open.
  useEffect(() => {
    const sub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => snap(true));
    return () => sub.remove();
  }, [snap]);

  const pan = usePanGesture({
    activeOffsetY: [-8, 8],
    onActivate: () => {
      'worklet';
      startH.set(height.get());
    },
    onUpdate: (e) => {
      'worklet';
      const want = startH.get() - e.translationY;
      if (want >= halfH) {
        height.set(Math.min(fullH + 24, want));
        drop.set(0);
      } else {
        height.set(halfH);
        drop.set(halfH - want); // below half: the whole sheet follows the finger down
      }
    },
    onDeactivate: (e) => {
      'worklet';
      if (drop.get() > 90 || (drop.get() > 0 && e.velocityY > 900)) {
        scheduleOnRN(close);
        return;
      }
      drop.set(withTiming(0, OPEN));
      const full = e.velocityY < -600 || (e.velocityY < 600 && height.get() > (halfH + fullH) / 2);
      scheduleOnRN(snap, full);
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({ height: height.get(), transform: [{ translateY: drop.get() }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: shown.get() * 0.4 }));

  const setFold = useCallback((y: number) => setFoldState((f) => (f === y ? f : y)), []);
  const onHead = (e: LayoutChangeEvent) => {
    const head = Math.round(e.nativeEvent.layout.height);
    setChrome((s) => (s.head === head ? s : { ...s, head }));
  };
  const onFoot = (e: LayoutChangeEvent) => {
    const foot = Math.round(e.nativeEvent.layout.height);
    setChrome((s) => (s.foot === foot ? s : { ...s, foot }));
  };

  return (
    <SheetCtx.Provider value={{ close, setFold }}>
      <View style={{ flex: 1 }}>
        <Animated.View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim }, scrimStyle]}
        />
        <Animated.View
          accessibilityViewIsModal
          aria-modal
          role="dialog"
          aria-label={title}
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: c.surface,
              borderTopLeftRadius: radius.xxl,
              borderTopRightRadius: radius.xxl,
              overflow: 'hidden',
              // Web: keep the panel a phone-width column on wide screens.
              ...(Platform.OS === 'web' ? { maxWidth: 560, width: '100%', marginHorizontal: 'auto' } : null),
            },
            sheetStyle,
          ]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <GestureDetector gesture={pan}>
              <View onLayout={onHead} style={{ paddingTop: space.xs }}>
                <Pressable
                  onPress={() => snap(!expanded)}
                  accessibilityRole="button"
                  accessibilityLabel={expanded ? 'Make the sheet smaller' : 'Make the sheet full height'}
                  style={{ alignSelf: 'center', height: 24, width: 88, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.fieldBorder }} />
                </Pressable>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: space.xl, paddingRight: space.s, minHeight: TARGET }}>
                  <T variant="title" accessibilityRole="header" style={{ flex: 1 }} numberOfLines={1}>
                    {title}
                  </T>
                  <Pressable
                    onPress={close}
                    accessibilityRole="button"
                    accessibilityLabel="Close without saving"
                    hitSlop={4}
                    style={({ pressed }) => ({
                      width: TARGET,
                      height: TARGET,
                      borderRadius: radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: pressed ? c.line : 'transparent',
                    })}>
                    <IconX size={22} color={c.ink} strokeWidth={STROKE} />
                  </Pressable>
                </View>
              </View>
            </GestureDetector>
            <ScrollView
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: space.s, paddingBottom: space.xxl }}>
              {children}
            </ScrollView>
            <View
              onLayout={onFoot}
              style={{ paddingHorizontal: space.xl, paddingTop: space.m, paddingBottom: Math.max(insets.bottom, space.s) + space.m, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface }}>
              {footer}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </SheetCtx.Provider>
  );
}
