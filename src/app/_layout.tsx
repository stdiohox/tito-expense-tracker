import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/toast';
import { MonthProvider } from '@/data/month';
import { StoreProvider, useStore } from '@/data/store';
import { fonts } from '@/theme/tokens';
import '@/theme/web-focus';
import { useTheme } from '@/theme/use-theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// A cold deep link to a sheet (titoexpenses://expense/new) still gets the tabs underneath.
export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Fraunces_600SemiBold,
  });
  const { c, scheme } = useTheme();

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: c.accent, background: c.ground, card: c.surface, text: c.ink, border: c.line },
  };

  const sheet = {
    // The web stack has no form sheet; a full-screen card renders correctly there.
    presentation: Platform.OS === 'web' ? ('card' as const) : ('formSheet' as const),
    sheetGrabberVisible: true,
    sheetAllowedDetents: [1] as number[],
    headerShown: false,
    contentStyle: { backgroundColor: c.surface },
  };

  const screenOptions = {
    headerTintColor: c.accent,
    headerTitleStyle: { fontFamily: fonts.bold, color: c.ink },
    headerShadowVisible: false,
    headerStyle: { backgroundColor: c.ground },
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: c.ground },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
          <StoreProvider>
            <MonthProvider>
              <ToastProvider>
                <Routes screenOptions={screenOptions} sheet={sheet} />
              </ToastProvider>
            </MonthProvider>
          </StoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Signed-in screens and the welcome/auth screens are mutually exclusive, so after sign-out or
 * account deletion no back gesture can return to the old data.
 * `title` names each screen for screen readers and the web tab; visible headers stay minimal.
 */
function Routes({ screenOptions, sheet }: { screenOptions: object; sheet: object }) {
  const { signedIn } = useStore();
  const quiet = { headerTitle: '' };
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Tito Expenses' }} />
        <Stack.Screen name="expense/new" options={{ ...sheet, title: 'Add expense' }} />
        <Stack.Screen name="expense/[id]" options={{ ...sheet, title: 'Edit expense' }} />
        <Stack.Screen name="category/[id]" options={{ title: 'Category' }} />
        <Stack.Screen name="category/edit" options={{ ...sheet, title: 'Category' }} />
        <Stack.Screen name="categories" options={{ title: 'Categories and budgets' }} />
        <Stack.Screen name="account/delete" options={{ title: 'Delete account', ...quiet }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="welcome" options={{ headerShown: false, title: 'Welcome', animation: 'fade' }} />
        <Stack.Screen name="sign-in" options={{ title: 'Sign in', ...quiet }} />
        <Stack.Screen name="sign-up" options={{ title: 'Create account', ...quiet }} />
        <Stack.Screen name="reset" options={{ title: 'Reset password', ...quiet }} />
      </Stack.Protected>
    </Stack>
  );
}
