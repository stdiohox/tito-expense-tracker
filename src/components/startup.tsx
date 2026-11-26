import { IconDatabaseOff } from '@tabler/icons-react-native';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Button } from './button';
import { STROKE } from './icons';
import { T } from './text';

/**
 * While the saved data opens at launch (usually a few milliseconds). The spinner only appears if
 * it takes longer than a moment, so a normal launch shows a plain background, not a flash.
 */
export function StartupLoading() {
  const { c } = useTheme();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <View
      style={{ flex: 1, backgroundColor: c.ground, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel="Opening your expenses"
      accessible={slow}>
      {slow ? <ActivityIndicator color={c.accent} size="large" /> : null}
    </View>
  );
}

/** The saved data couldn't be opened. Calm, says nothing is lost, and offers Try again. */
export function StartupError({ onRetry }: { onRetry: () => void }) {
  const { c } = useTheme();
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.ground,
        paddingTop: insets.top + space.xxl,
        paddingBottom: insets.bottom + space.l,
        paddingHorizontal: space.xl,
        justifyContent: 'center',
      }}>
      <View style={{ alignItems: 'center', gap: space.m }}>
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={{ width: 64, height: 64, borderRadius: radius.pill, backgroundColor: c.accentTint, alignItems: 'center', justifyContent: 'center' }}>
          <IconDatabaseOff size={32} color={c.accent} strokeWidth={STROKE} />
        </View>
        <T variant="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
          Your expenses didn’t open
        </T>
        <T variant="body" tone="inkSoft" style={{ textAlign: 'center', maxWidth: 320 }}>
          The app couldn’t read the data saved on this phone. Nothing has been deleted. Try again, and if it keeps happening, restart the app.
        </T>
      </View>
      <View style={{ marginTop: space.xxl }}>
        <Button label="Try again" onPress={onRetry} />
      </View>
    </View>
  );
}
