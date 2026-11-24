import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { AppearanceProvider, useTheme } from '@/theme/use-theme';

import { T } from './text';

/**
 * A rounded panel. `dark` renders its contents in the dark palette in both modes (Quick add, Latest,
 * the tab bar), so text, icons and category discs inside use their checked dark pairs.
 */
export function Panel({
  dark,
  title,
  action,
  children,
  style,
}: {
  dark?: boolean;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const body = (
    <PanelBody title={title} action={action} style={style}>
      {children}
    </PanelBody>
  );
  return dark ? <AppearanceProvider mode="dark">{body}</AppearanceProvider> : body;
}

function PanelBody({ title, action, children, style }: { title?: string; action?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: radius.xxl, paddingHorizontal: space.l, paddingTop: title ? space.l : space.xs, paddingBottom: space.xs }, style]}>
      {title ? (
        <View accessibilityRole="header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.m, minHeight: 28 }}>
          <T variant="title">{title}</T>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}
