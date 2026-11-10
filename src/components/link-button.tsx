import { Pressable } from 'react-native';

import { TARGET, space } from '@/theme/tokens';

import { T } from './text';

/** A text action ("Forgot your password?", "Set a budget") with a full-size touch target. */
export function LinkButton({
  label,
  onPress,
  role = 'button',
  align = 'flex-start',
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  role?: 'button' | 'link';
  align?: 'flex-start' | 'center' | 'flex-end';
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      hitSlop={4}
      style={({ pressed }) => ({ minHeight: TARGET, justifyContent: 'center', alignSelf: align, paddingHorizontal: space.xs, marginHorizontal: -space.xs, opacity: pressed ? 0.6 : 1 })}>
      <T variant="bodyStrong" tone="accent">
        {label}
      </T>
    </Pressable>
  );
}
