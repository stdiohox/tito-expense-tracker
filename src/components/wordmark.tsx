import { View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

/** The app's short and full names. TET is what fits under the app icon. */
export const APP_SHORT_NAME = 'TET';
export const APP_FULL_NAME = 'Tito Finance Expense Tracker';

/**
 * The name lockup: "TET" in spaced SemiBold with a small mint dot, the full name beneath it.
 * `onBrand` for the gradient (white and soft text, mint dot); otherwise ink and ink mute, with the
 * teal version of the dot. Read once as "TET, Tito Finance Expense Tracker".
 */
export function Wordmark({ onBrand, align = 'flex-start' }: { onBrand?: boolean; align?: 'flex-start' | 'center' }) {
  const { c } = useTheme();
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={`${APP_SHORT_NAME}, ${APP_FULL_NAME}`} style={{ alignItems: align, gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
        <T variant="title" tone={onBrand ? 'onBrand' : 'ink'} style={{ letterSpacing: 3 }}>
          {APP_SHORT_NAME}
        </T>
        <View style={{ width: 7, height: 7, borderRadius: radius.pill, marginBottom: 6, backgroundColor: onBrand ? c.pop : c.popOnGround }} />
      </View>
      <T variant="caption" tone={onBrand ? 'onBrandSoft' : 'inkMute'} style={{ marginTop: -space.xs / 2 }}>
        {APP_FULL_NAME}
      </T>
    </View>
  );
}
