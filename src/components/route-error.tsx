import { IconMoodConfuzed } from '@tabler/icons-react-native';
import { router, type ErrorBoundaryProps } from 'expo-router';
import { Component, useContext, useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { reportError } from '@/lib/report';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Button } from './button';
import { STROKE } from './icons';
import { T } from './text';

/**
 * Shown instead of a screen that crashed, so the app never shows a white screen. Every route
 * exports it as `ErrorBoundary` (Expo Router). Try again re-renders the screen; Go home leaves it.
 * Works even outside the app's providers (the root layout's boundary): no store, no safe-area
 * provider needed.
 */
export function RouteErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { c } = useTheme();
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };

  useEffect(() => {
    reportError(error, { where: 'screen' });
  }, [error]);

  const goHome = () => {
    try {
      router.replace('/');
    } catch {
      void retry();
    }
  };

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
          <IconMoodConfuzed size={32} color={c.accent} strokeWidth={STROKE} />
        </View>
        <T variant="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
          Something went wrong
        </T>
        <T variant="body" tone="inkSoft" style={{ textAlign: 'center', maxWidth: 320 }}>
          This screen hit a problem. Your expenses are still here. Try again, or go back to Home.
        </T>
      </View>
      <View style={{ gap: space.s, marginTop: space.xxl }}>
        <Button label="Try again" onPress={() => void retry()} />
        <Button label="Go home" variant="secondary" onPress={goHome} />
      </View>
    </View>
  );
}

/**
 * Keeps one risky part (a chart, an onboarding animation, a strip of currency totals) from taking
 * down the whole screen: if it throws while rendering, `fallback` (nothing by default) shows in its
 * place and the error is reported. The rest of the screen keeps working.
 */
export class SafePart extends Component<{ name: string; fallback?: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    reportError(error, { where: `part: ${this.props.name}` });
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}

/** A quiet one-line fallback for a part that couldn't be drawn. */
export function PartUnavailable({ label, onBrand }: { label: string; onBrand?: boolean }) {
  return (
    <T variant="sub" tone={onBrand ? 'onBrandSoft' : 'inkMute'} style={{ paddingVertical: space.m }}>
      {label} couldn’t be shown right now.
    </T>
  );
}
