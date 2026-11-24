import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/theme/tokens';
import { AppearanceProvider, useTheme } from '@/theme/use-theme';

import { BrandGradient } from './brand-gradient';
import { FocusStatusBar } from './focus-status-bar';
import { T } from './text';

/**
 * The hero at the top of every tab: the bright brand gradient (with the top-right flare), the
 * page title in the same place and style on every tab, then the page's own content (month
 * switcher, headline figure, glass cards). It always renders with the light palette, so its text
 * pairs are the checked gradient pairs, and fades into the ground of the current mode below.
 * Keep content out of the top-right corner, where the flare is.
 */
export function ScreenHero({ title, children, bleed }: { title: string; children?: ReactNode; bleed?: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <AppearanceProvider mode="light">
      <FocusStatusBar style="light" />
      <BrandGradient fade flare fadeTo={c.ground} style={{ paddingTop: insets.top + space.s }}>
        <View style={{ paddingHorizontal: space.xl, gap: space.xs }}>
          <T variant="title" tone="onBrand" accessibilityRole="header" style={{ marginTop: space.s }}>
            {title}
          </T>
          {children}
        </View>
        {bleed}
      </BrandGradient>
    </AppearanceProvider>
  );
}
