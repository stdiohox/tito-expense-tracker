import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

/** Wealthfront-style list row: leading disc, title + subtitle, trailing amount + caption. */
export function Row({
  leading,
  title,
  subtitle,
  trailing,
  trailingSub,
  trailingTone = 'ink',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  divider = true,
}: {
  leading?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  trailingSub?: ReactNode;
  trailingTone?: 'ink' | 'clay' | 'inkMute';
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  divider?: boolean;
}) {
  const { c } = useTheme();
  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.m,
        paddingVertical: space.m,
        minHeight: 64,
      }}>
      {leading}
      <View style={{ flex: 1, gap: 2, borderBottomWidth: 0 }}>
        <T variant="bodyStrong" numberOfLines={1}>
          {title}
        </T>
        {typeof subtitle === 'string' ? (
          <T variant="sub" tone="inkMute" numberOfLines={1}>
            {subtitle}
          </T>
        ) : (
          subtitle
        )}
      </View>
      {(trailing !== undefined || trailingSub !== undefined) && (
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          {typeof trailing === 'string' ? (
            <T variant="bodyStrong" tone={trailingTone} numeric>
              {trailing}
            </T>
          ) : (
            trailing
          )}
          {typeof trailingSub === 'string' ? (
            <T variant="sub" tone="inkMute" numeric>
              {trailingSub}
            </T>
          ) : (
            trailingSub
          )}
        </View>
      )}
    </View>
  );
  const line = divider ? { borderBottomWidth: 1, borderBottomColor: c.line } : null;
  if (!onPress) {
    return (
      <View accessible accessibilityLabel={accessibilityLabel} style={line}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [line, { opacity: pressed ? 0.6 : 1 }]}>
      {body}
    </Pressable>
  );
}

export function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <View
      accessibilityRole="header"
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: space.xxl, paddingBottom: space.xs }}>
      <T variant="title">{title}</T>
      {right ? (
        <T variant="headline" numeric>
          {right}
        </T>
      ) : null}
    </View>
  );
}
