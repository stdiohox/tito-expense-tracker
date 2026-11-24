import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from '@/components/brand-gradient';
import { T } from '@/components/text';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Welcome() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <BrandGradient style={{ flex: 1, paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl, paddingHorizontal: space.xl }}>
      <StatusBar style="light" />
      <T variant="headline" tone="onBrand">
        Tito Finance
      </T>
      <View style={{ flex: 1, justifyContent: 'center', gap: space.l }}>
        <T variant="largeTitle" tone="onBrand" accessibilityRole="header" style={{ fontSize: 40, lineHeight: 46 }}>
          Know where your money goes.
        </T>
        <T variant="body" tone="onBrandSoft" style={{ maxWidth: 340 }}>
          Log what you spend in seconds, see your month at a glance, and set budgets that help instead of nag.
        </T>
      </View>
      <View style={{ gap: space.s }}>
        <Pressable
          onPress={() => router.push('/sign-up')}
          accessibilityRole="button"
          style={({ pressed }) => ({ minHeight: 52, borderRadius: radius.pill, backgroundColor: pressed ? c.onBrandSoft : c.onBrand, alignItems: 'center', justifyContent: 'center' })}>
          <T variant="button" style={{ color: c.onWelcomeButton }}>
            Create an account
          </T>
        </Pressable>
        <Pressable
          onPress={() => router.push('/sign-in')}
          accessibilityRole="button"
          style={{ minHeight: 52, alignItems: 'center', justifyContent: 'center' }}>
          <T variant="button" tone="onBrand">
            I already have an account
          </T>
        </Pressable>
      </View>
    </BrandGradient>
  );
}
