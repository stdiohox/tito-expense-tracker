import { View } from 'react-native';

import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

/** "AO" from Ada Obi; one letter when only one name is set; "?" when neither is. */
export function initials(first: string, last: string): string {
  const letter = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? '';
  return letter(first) + letter(last) || '?';
}

/**
 * A round avatar with the user's initials (no photos): icy disc, navy letters, a soft white ring.
 * It sits on the brand gradient next to text that already says the name, so screen readers skip it.
 */
export function Avatar({ first, last, size = 40 }: { first: string; last: string; size?: number }) {
  const { c } = useTheme();
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.avatar,
        borderWidth: 2,
        borderColor: c.glassEdge,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <T
        allowFontScaling={false}
        style={{ fontFamily: fonts.semibold, fontSize: Math.round(size * 0.38), lineHeight: Math.round(size * 0.46), color: c.onAvatar, letterSpacing: 0.5 }}>
        {initials(first, last)}
      </T>
    </View>
  );
}
