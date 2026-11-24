import { View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

/** A small pill with a short figure ("64%"). `over` switches it to burgundy; words nearby say why. */
export function Badge({ label, over }: { label: string; over?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: over ? c.dangerTint : c.badge, borderRadius: radius.pill, paddingHorizontal: space.s, paddingVertical: 2 }}>
      <T variant="caption" numeric style={{ color: over ? c.danger : c.onBadge }}>
        {label}
      </T>
    </View>
  );
}
