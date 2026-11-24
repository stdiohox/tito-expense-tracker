import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space } from '@/theme/tokens';
import { AppearanceProvider, useTheme } from '@/theme/use-theme';

import { BrandGradient } from './brand-gradient';
import { FocusStatusBar } from './focus-status-bar';
import { T } from './text';

/**
 * The hero card at the top of every tab: a rounded brand-gradient card (with the top-right flare)
 * set 16px in from the screen edges, so the page's ground shows around it. The page title sits in
 * the same place and style on every tab, then the page's own content (month switcher, headline
 * figure); `bleed` content (the glass currency strip) runs edge to edge inside the card. The card
 * renders with the light palette, so its text pairs are the checked gradient pairs. Its inner
 * padding lines its text up with the text inside the panels below. Keep content out of the card's
 * top-right corner, where the flare is.
 */
export function ScreenHero({ title, children, bleed }: { title: string; children?: ReactNode; bleed?: ReactNode }) {
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + space.s, paddingHorizontal: space.l }}>
      {/* The status bar now sits on the page's ground, not on the gradient. */}
      <FocusStatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AppearanceProvider mode="light">
        <BrandGradient flare style={{ borderRadius: radius.xxl, paddingVertical: space.l }}>
          <View style={{ paddingHorizontal: space.l, gap: space.xs }}>
            <T variant="title" tone="onBrand" accessibilityRole="header">
              {title}
            </T>
            {children}
          </View>
          {bleed}
        </BrandGradient>
      </AppearanceProvider>
    </View>
  );
}
