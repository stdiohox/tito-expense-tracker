import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, useFonts } from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Appearance, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/toast';
import { CurrencyViewProvider } from '@/data/currency-view';
import { MonthProvider } from '@/data/month';
import { StoreProvider, useStore } from '@/data/store';
import { installGlobalErrorHandlers } from '@/lib/report';
import { fonts } from '@/theme/tokens';
import { AppearanceProvider, useTheme } from '@/theme/use-theme';
import { applyWebFocusRing } from '@/theme/web-focus';

installGlobalErrorHandlers();
SplashScreen.preventAutoHideAsync().catch(() => {});

// A cold deep link to a sheet (titoexpenses://expense/new) still gets the tabs underneath.
export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const [loaded, error] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ThemedApp />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Applies the Appearance setting. Our own colours follow it through AppearanceProvider; on iOS and
 * Android, Appearance.setColorScheme also makes native UI follow it (tab bar, switches, sheets,
 * keyboard). "unspecified" hands control back to the phone. react-native-web has no override, and
 * there AppearanceProvider alone covers every colour the app draws.
 */
function ThemedApp() {
  const { appearance } = useStore().settings;
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
  }, [appearance]);
  return (
    <AppearanceProvider mode={appearance}>
      <Navigation />
    </AppearanceProvider>
  );
}

function Navigation() {
  const { c, scheme } = useTheme();

  useEffect(() => applyWebFocusRing(scheme), [scheme]);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: c.accent, background: c.ground, card: c.surface, text: c.ink, border: c.line },
  };

  // Sheets are drawn by BottomSheet over the screen below (same on iOS, Android and web), so the
  // route is a see-through modal with no animation of its own: the sheet slides itself in and out.
  const sheet = {
    presentation: 'transparentModal' as const,
    animation: 'none' as const,
    headerShown: false,
    contentStyle: { backgroundColor: 'transparent' },
  };

  const screenOptions = {
    headerTintColor: c.accent,
    headerTitleStyle: { fontFamily: fonts.semibold, color: c.ink },
    headerShadowVisible: false,
    headerStyle: { backgroundColor: c.ground },
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: c.ground },
  };

  return (
    <ThemeProvider value={navTheme}>
      <MonthProvider>
        <CurrencyViewProvider>
          <ToastProvider>
            <Routes screenOptions={screenOptions} sheet={sheet} />
          </ToastProvider>
        </CurrencyViewProvider>
      </MonthProvider>
    </ThemeProvider>
  );
}

/**
 * Signed-in screens and the welcome/auth screens are mutually exclusive, so after sign-out or
 * account deletion no back gesture can return to the old data.
 * Signed out, any signed-in route (including "/" at launch) redirects to the onboarding slides.
 * Without `redirectTo` the router falls back to the first unguarded screen, which put people on
 * Reset password.
 * `title` names each screen for screen readers and the web tab; visible headers stay minimal.
 */
function Routes({ screenOptions, sheet }: { screenOptions: object; sheet: object }) {
  const { signedIn } = useStore();
  const quiet = { headerTitle: '' };
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Protected guard={signedIn} redirectTo="/welcome">
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'TET · Tito Finance Expense Tracker' }} />
        <Stack.Screen name="expense/new" options={{ ...sheet, title: 'Add expense' }} />
        <Stack.Screen name="expense/[id]" options={{ ...sheet, title: 'Edit expense' }} />
        <Stack.Screen name="category/[id]" options={{ title: 'Category' }} />
        <Stack.Screen name="category/edit" options={{ ...sheet, title: 'Category' }} />
        <Stack.Screen name="categories" options={{ title: 'Categories and budgets' }} />
        <Stack.Screen name="account/delete" options={{ title: 'Delete account', ...quiet }} />
        <Stack.Screen name="setup" options={{ title: 'Set up', headerShown: false }} />
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

// A crash in this screen shows a calm error screen, never a white screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error';
