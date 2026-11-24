import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from '@/components/brand-gradient';
import { IntroHero } from '@/components/intro-hero';
import { T } from '@/components/text';
import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const SLIDES = [
  { title: 'Log what you spend in seconds', text: 'Pick a category, type the amount, done. It takes about as long as paying.' },
  { title: 'See your month at a glance', text: 'Your total, where it went and how it compares with last month, on one screen.' },
  { title: 'Budgets that help, not nag', text: 'Set a monthly amount where it matters. Going over is shown calmly, in words.' },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Three intro slides on the brand gradient. Swipe between them, or use Next, Skip and the
 * indicator (each segment is a button, so keyboard, VoiceOver, TalkBack and web all work).
 * With Reduce Motion on, Next, Skip and the indicator jump instead of scrolling.
 * "I already have an account" stays on every slide so returning users never have to swipe.
 */
export default function Welcome() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const pager = useRef<ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(0);
  const [heroHeight, setHeroHeight] = useState(0);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const first = useRef(true);
  const last = index === SLIDES.length - 1;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  // iOS has no live regions: say which slide is showing after each change.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(`Slide ${index + 1} of ${SLIDES.length}: ${SLIDES[index].title}`);
  }, [index]);

  const goTo = (i: number) => {
    setIndex(i);
    pager.current?.scrollTo({ x: i * width, animated: !reduceMotion });
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index && i >= 0 && i < SLIDES.length) setIndex(i);
  };

  return (
    <BrandGradient style={{ flex: 1, paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.l }}>
      <StatusBar style="light" />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl, minHeight: TARGET }}>
        <T
          variant="headline"
          tone="onBrand"
          numeric
          accessibilityLabel={`Slide ${index + 1} of ${SLIDES.length}`}
          accessibilityLiveRegion="polite"
          aria-live="polite">
          {pad(index + 1)} / {pad(SLIDES.length)}
        </T>
        {last ? null : (
          <Pressable
            onPress={() => goTo(SLIDES.length - 1)}
            accessibilityRole="button"
            accessibilityLabel="Skip to the last slide"
            hitSlop={8}
            style={({ pressed }) => ({ minHeight: TARGET, minWidth: TARGET, alignItems: 'flex-end', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <T variant="bodyStrong" tone="onBrand">
              Skip
            </T>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1 }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={32}
            accessibilityLabel="Introduction"
            style={{ flex: 1 }}>
            {SLIDES.map((s, i) => (
              <View
                key={s.title}
                style={{ width, flex: 1, paddingHorizontal: space.xl, justifyContent: 'flex-end', paddingBottom: space.l }}
                importantForAccessibility={i === index ? 'auto' : 'no-hide-descendants'}
                accessibilityElementsHidden={i !== index}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onLayout={(e) => i === 0 && setHeroHeight(e.nativeEvent.layout.height)}>
                  {heroHeight > 0 ? <IntroHero slide={i as 0 | 1 | 2} width={width - space.xl * 2} height={Math.min(heroHeight, 320)} /> : null}
                </View>
                <T variant="hero" tone="onBrand" accessibilityRole="header">
                  {s.title}
                </T>
                <T variant="body" tone="onBrandSoft" style={{ marginTop: space.m, maxWidth: 340 }}>
                  {s.text}
                </T>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: space.xl, gap: space.s }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          {SLIDES.map((s, i) => (
            <Pressable
              key={s.title}
              onPress={() => goTo(i)}
              accessibilityRole="button"
              accessibilityLabel={`Slide ${i + 1} of ${SLIDES.length}`}
              accessibilityState={{ selected: i === index }}
              style={{ minHeight: TARGET, justifyContent: 'center', paddingHorizontal: 2 }}>
              <View
                style={{
                  width: i === index ? 28 : 10,
                  height: 6,
                  borderRadius: radius.pill,
                  backgroundColor: i === index ? c.pop : c.onBrandSoft,
                }}
              />
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => (last ? router.push('/sign-up') : goTo(index + 1))}
          accessibilityRole="button"
          accessibilityLabel={last ? 'Create an account' : 'Next slide'}
          style={({ pressed }) => ({
            minHeight: 56,
            borderRadius: radius.pill,
            backgroundColor: pressed ? c.onBrandSoft : c.onBrand,
            alignItems: 'center',
            justifyContent: 'center',
          })}>
          <T variant="button" style={{ color: c.onWelcomeButton }}>
            {last ? 'Create an account' : 'Next'}
          </T>
        </Pressable>
        <Pressable
          onPress={() => router.push('/sign-in')}
          accessibilityRole="button"
          style={{ minHeight: TARGET, alignItems: 'center', justifyContent: 'center' }}>
          <T variant="button" tone="onBrand">
            I already have an account
          </T>
        </Pressable>
      </View>
    </BrandGradient>
  );
}
