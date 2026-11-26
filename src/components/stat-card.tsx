import type { ReactNode } from 'react';
import { View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

/** A small figure in a rounded card, for 2-column grids: a label, the figure, an optional note. */
export function StatCard({ label, value, note }: { label: string; value: string; note?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${typeof note === 'string' ? `, ${note}` : ''}`}
      style={{ flex: 1, flexBasis: 0, minWidth: 0, backgroundColor: c.surface, borderRadius: radius.xl, padding: space.l, gap: space.xs }}>
      <T variant="caption" tone="inkMute" numberOfLines={1}>
        {label}
      </T>
      <T variant="title" numeric numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </T>
      {typeof note === 'string' ? (
        <T variant="sub" tone="inkSoft" numberOfLines={2}>
          {note}
        </T>
      ) : (
        note
      )}
    </View>
  );
}

/** Two cards side by side. */
export function StatRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: space.m }}>{children}</View>;
}
