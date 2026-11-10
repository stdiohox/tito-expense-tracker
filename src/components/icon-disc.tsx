import { View } from 'react-native';

import type { CategoryIcon } from '@/domain/types';
import { useCategoryColor } from '@/theme/use-theme';

import { CATEGORY_ICONS, STROKE } from './icons';

export function IconDisc({ icon, size = 40 }: { icon: CategoryIcon; size?: number }) {
  const { fg, bg } = useCategoryColor(icon);
  const Glyph = CATEGORY_ICONS[icon];
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Glyph size={size * 0.5} color={fg} strokeWidth={STROKE} />
    </View>
  );
}
