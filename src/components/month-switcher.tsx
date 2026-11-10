import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import { AccessibilityInfo, Platform, Pressable, View } from 'react-native';

import { useMonth } from '@/data/month';
import { addMonths, monthLabel } from '@/domain/dates';
import { TARGET } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { STROKE } from './icons';
import { T } from './text';

export function MonthSwitcher({ onBrand }: { onBrand?: boolean }) {
  const { month, isCurrent, prev, next } = useMonth();
  const { c } = useTheme();
  const fg = onBrand ? c.onBrand : c.ink;
  const dim = onBrand ? c.onBrandSoft : c.inkMute;
  // iOS has no live regions, so say the new month out loud after a change.
  const announce = (m: string) => Platform.OS === 'ios' && AccessibilityInfo.announceForAccessibility(m);
  const box = { width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -12 }}>
      <Pressable
        onPress={() => {
          prev();
          announce(monthLabel(addMonths(month, -1)));
        }}
        accessibilityRole="button"
        accessibilityLabel={`Previous month, ${monthLabel(addMonths(month, -1))}`}
        style={box}>
        <IconChevronLeft size={22} color={fg} strokeWidth={STROKE} />
      </Pressable>
      <T
        variant="headline"
        tone={onBrand ? 'onBrand' : 'ink'}
        accessibilityLabel={`Showing ${monthLabel(month)}`}
        accessibilityLiveRegion="polite"
        style={{ minWidth: 96, textAlign: 'center' }}>
        {monthLabel(month)}
      </T>
      <Pressable
        onPress={() => {
          next();
          announce(monthLabel(addMonths(month, 1)));
        }}
        disabled={isCurrent}
        accessibilityRole="button"
        accessibilityState={{ disabled: isCurrent }}
        accessibilityLabel={isCurrent ? 'Next month, not available yet' : `Next month, ${monthLabel(addMonths(month, 1))}`}
        style={[box, { opacity: isCurrent ? 0.35 : 1 }]}>
        <IconChevronRight size={22} color={isCurrent ? dim : fg} strokeWidth={STROKE} />
      </Pressable>
    </View>
  );
}
