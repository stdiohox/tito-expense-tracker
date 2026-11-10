import type { ReactNode } from 'react';
import { View } from 'react-native';

import { space } from '@/theme/tokens';

import { T } from './text';

/** Large title for top-level tab screens. */
export function TabTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <View style={{ paddingTop: space.s, paddingBottom: space.s, gap: space.xs }}>
      <T variant="largeTitle" accessibilityRole="header">
        {title}
      </T>
      {children}
    </View>
  );
}
