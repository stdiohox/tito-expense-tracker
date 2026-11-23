import { IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

/**
 * The one primary action on tab screens: log a payment. Collapses to a round "+" once the
 * list scrolls, so it never sits on top of an amount.
 */
export function AddButton({ compact, hidden }: { compact?: boolean; hidden?: boolean }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  // Android native tabs already lay content out above the system bars; iOS tab screens report
  // the tab bar in their own safe-area inset.
  const bottom = Platform.OS === 'android' ? space.l : insets.bottom + space.l;
  if (hidden) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(160).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(120).reduceMotion(ReduceMotion.System)}
      pointerEvents="box-none"
      style={{ position: 'absolute', right: space.l, bottom }}>
      <Pressable
        onPress={() => router.push('/expense/new')}
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.s,
          minHeight: 56,
          minWidth: 56,
          paddingLeft: compact ? 0 : space.l,
          paddingRight: compact ? 0 : space.xl,
          borderRadius: radius.pill,
          backgroundColor: pressed ? c.buttonPressed : c.button,
          shadowColor: c.fabShadow,
          shadowOpacity: 0.22,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        })}>
        <IconPlus size={compact ? 26 : 22} color={c.onButton} strokeWidth={2.25} />
        {compact ? null : (
          <T variant="button" tone="onButton">
            Add expense
          </T>
        )}
      </Pressable>
    </Animated.View>
  );
}
