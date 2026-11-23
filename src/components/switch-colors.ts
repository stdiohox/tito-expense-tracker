import { Platform } from 'react-native';

import type { Palette } from '@/theme/tokens';

/**
 * Brand colours for a <Switch>. react-native-web's Switch ignores trackColor.true and paints a
 * teal thumb unless activeTrackColor / activeThumbColor are set as well.
 */
export function switchColors(c: Palette) {
  return {
    trackColor: { true: c.button, false: c.switchOff },
    thumbColor: c.thumb,
    ...(Platform.OS === 'web' ? ({ activeTrackColor: c.button, activeThumbColor: c.thumb } as object) : {}),
  };
}
