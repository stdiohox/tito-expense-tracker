import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'plain';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  accessibilityHint?: string;
}) {
  const { c } = useTheme();
  const look = {
    primary: { bg: c.button, pressed: c.buttonPressed, fg: 'onButton' as const },
    secondary: { bg: c.accentTint, pressed: c.line, fg: 'accent' as const },
    danger: { bg: c.dangerTint, pressed: c.line, fg: 'danger' as const },
    plain: { bg: 'transparent', pressed: c.accentTint, fg: 'accent' as const },
  }[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => ({
        minHeight: Math.max(52, TARGET),
        borderRadius: radius.pill,
        backgroundColor: pressed ? look.pressed : look.bg,
        opacity: disabled ? 0.45 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: space.xl,
      })}>
      {loading ? (
        <ActivityIndicator color={c[look.fg]} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
          {icon}
          <T variant="button" tone={look.fg}>
            {label}
          </T>
        </View>
      )}
    </Pressable>
  );
}
