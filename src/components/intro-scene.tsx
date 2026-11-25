import { IconCircleCheck } from '@tabler/icons-react-native';
import { useEffect, useId, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { formatMoney } from '@/domain/money';
import { radius, space } from '@/theme/tokens';
import { AppearanceProvider, hexAlpha, useTheme } from '@/theme/use-theme';

import { Badge } from './badge';
import { BudgetBar } from './budget-bar';
import { GlassCard } from './glass-card';
import { IconDisc } from './icon-disc';
import { STROKE } from './icons';
import { T } from './text';
import { useProgress } from './use-progress';

/*
 * Live illustrations for the three intro slides, built from the app's own components (icon discs,
 * glass cards, budget bars, badges) with fixed sample numbers, never the user's data. Each plays
 * when its slide is showing: calm, eased, once; only the glass cards keep a slow float and the
 * glow behind them drifts. With Reduce Motion on, every scene shows its final state, still.
 * Decorative: hidden from screen readers; the slide's headline and text carry the meaning.
 * The drifting glow stays inside the illustration box, away from the headline and body text,
 * so the text pairs measured by check-contrast.mjs are unchanged.
 */
export function IntroScene({ slide, active, width, height }: { slide: 0 | 1 | 2; active: boolean; width: number; height: number }) {
  return (
    <View
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Drift width={width} height={height} active={active} />
      {slide === 0 ? <LogScene active={active} /> : null}
      {slide === 1 ? <PaceScene active={active} width={Math.min(width, 320)} /> : null}
      {slide === 2 ? <BudgetScene active={active} width={Math.min(width, 330)} /> : null}
    </View>
  );
}

const SINE = Easing.inOut(Easing.sin);

/** A soft icy glow that drifts slowly behind the scene: the gentle movement in the background. */
function Drift({ width, height, active }: { width: number; height: number; active: boolean }) {
  const { c } = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce || !active) return;
    t.set(withRepeat(withTiming(1, { duration: 9000, easing: SINE }), -1, true));
    return () => cancelAnimation(t);
  }, [reduce, active, t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: (t.get() - 0.5) * width * 0.22 }, { translateY: (0.5 - t.get()) * height * 0.14 }, { scale: 1 + t.get() * 0.08 }],
  }));
  const size = Math.min(width, height) * 1.1;
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size, pointerEvents: 'none' }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c.brandGlow} stopOpacity={0.26} />
            <Stop offset="1" stopColor={c.brandGlow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${id}g)`} />
      </Svg>
    </Animated.View>
  );
}

/** Bobs its child up and down by a few points, slowly, forever (still with Reduce Motion). */
function Float({ children, amp = 6, ms = 2800, delay = 0, style }: { children: ReactNode; amp?: number; ms?: number; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    const timer = setTimeout(() => {
      y.set(withRepeat(withSequence(withTiming(-amp, { duration: ms, easing: SINE }), withTiming(0, { duration: ms, easing: SINE })), -1));
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimation(y);
    };
  }, [reduce, amp, ms, delay, y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

/** Whole-naira steps, so the counting figure never shows kobo. */
const counted = (minor: number, p: number) => Math.round((minor / 100) * p) * 100;

/* Slide 1: an expense card slides in, its icon pops and the amount counts up; "Saved" follows. */
function LogScene({ active }: { active: boolean }) {
  const { c } = useTheme();
  const slide = useProgress('log', 650, { run: active, delay: 150 });
  const pop = useProgress('pop', 520, { run: active, delay: 380 });
  const count = useProgress('count', 900, { run: active, delay: 450 });
  const saved = useProgress('saved', 420, { run: active, delay: 1250 });
  // A little overshoot on the icon: up to 112%, settling at 100%.
  const iconScale = pop < 0.7 ? 0.4 + (pop / 0.7) * 0.72 : 1.12 - ((pop - 0.7) / 0.3) * 0.12;
  return (
    <View style={{ width: 300, height: 260 }}>
      <Float amp={5} ms={3200} style={{ position: 'absolute', top: 6, left: 0, right: 26, transform: [{ rotate: '-4deg' }] }}>
        <GlassCard mark={false} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
          {/* On glass, discs use their dark-mode hues, as in the dark panels. */}
          <AppearanceProvider mode="dark">
            <IconDisc icon="transport" size={36} />
          </AppearanceProvider>
          <View style={{ flex: 1 }}>
            <T variant="bodyStrong" tone="onBrand">Transport</T>
            <T variant="caption" tone="onBrandSoft">Yesterday</T>
          </View>
          <T variant="bodyStrong" tone="onBrand" numeric>₦1,200</T>
        </GlassCard>
      </Float>
      <View
        style={{
          position: 'absolute',
          top: 92,
          left: 14,
          right: 0,
          opacity: slide,
          transform: [{ translateX: (1 - slide) * 48 }],
          backgroundColor: c.surface,
          borderRadius: radius.xl,
          padding: space.l,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.m,
          shadowColor: c.fabShadow,
          shadowOpacity: 0.25,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        }}>
        <View style={{ transform: [{ scale: iconScale }] }}>
          <IconDisc icon="food" size={44} />
        </View>
        <View style={{ flex: 1 }}>
          <T variant="bodyStrong" numberOfLines={1}>Groceries</T>
          <T variant="sub" tone="inkMute">Today · Lunch</T>
        </View>
        <T variant="title" numeric>{formatMoney(counted(450000, count), 'NGN')}</T>
      </View>
      <View
        style={{
          position: 'absolute',
          top: 196,
          left: 54,
          opacity: saved,
          transform: [{ translateY: (1 - saved) * 10 }],
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s,
          backgroundColor: c.toast,
          borderRadius: radius.pill,
          paddingHorizontal: space.l,
          paddingVertical: space.s,
        }}>
        <IconCircleCheck size={18} color={c.pop} strokeWidth={STROKE} />
        <T variant="sub" style={{ color: c.onToast }}>Saved ₦4,500 to Food</T>
      </View>
    </View>
  );
}

/* Slide 2: a glass card where this month's pace line draws itself and the total counts up. */
function PaceScene({ active, width }: { active: boolean; width: number }) {
  const { c } = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const draw = useProgress('draw', 1400, { run: active, delay: 200 });
  const count = useProgress('total', 1200, { run: active, delay: 200 });
  const dot = useProgress('dot', 380, { run: active, delay: 1450 });
  const chipIn = useProgress('chip', 450, { run: active, delay: 1600 });
  const w = width - space.l * 2;
  const h = 96;
  // Sample month: this month (icy) up to today, last month (dashed) the whole way.
  const now = [0, 0.05, 0.09, 0.16, 0.2, 0.27, 0.31, 0.38, 0.45, 0.49, 0.55, 0.6];
  const before = [0, 0.07, 0.13, 0.2, 0.27, 0.34, 0.4, 0.47, 0.55, 0.61, 0.68, 0.73, 0.79, 0.86, 0.9, 0.95, 1];
  const n = before.length - 1;
  const pt = (v: number, i: number) => [(i / n) * (w - 8) + 4, h - 6 - v * (h - 16)] as const;
  const line = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${pt(v, i)[0].toFixed(1)},${pt(v, i)[1].toFixed(1)}`).join(' ');
  const LEN = 520; // longer than the drawn line, so the dash reveals it end to end
  const end = pt(now[now.length - 1], now.length - 1);
  const area = `${line(now)} L${end[0].toFixed(1)},${h} L4,${h} Z`;
  return (
    <View style={{ width, height: 250, justifyContent: 'center' }}>
      <Float amp={6} ms={3000}>
        <GlassCard style={{ gap: space.xs }}>
          <T variant="caption" tone="onBrandSoft">Spent so far this month</T>
          <T variant="largeTitle" tone="onBrand" numeric>{formatMoney(counted(18240000, count), 'NGN')}</T>
          <Svg width={w} height={h} style={{ marginTop: space.s }}>
            <Defs>
              <RadialGradient id={`${id}f`} cx="50%" cy="0%" r="100%">
                <Stop offset="0" stopColor={c.chartLine} stopOpacity={0.24} />
                <Stop offset="1" stopColor={c.chartLine} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Path d={line(before)} stroke={c.chartGhost} strokeWidth={1.5} strokeDasharray="4 5" fill="none" />
            <Path d={area} fill={`url(#${id}f)`} opacity={draw} />
            <Path
              d={line(now)}
              stroke={c.chartLine}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={`${LEN} ${LEN}`}
              strokeDashoffset={LEN * (1 - draw)}
            />
            <Circle cx={end[0]} cy={end[1]} r={10 * dot} fill={c.pop} opacity={0.28} />
            <Circle cx={end[0]} cy={end[1]} r={5 * dot} fill={c.pop} />
          </Svg>
        </GlassCard>
      </Float>
      <Float amp={4} ms={2600} delay={500} style={{ position: 'absolute', right: -6, top: -4, opacity: chipIn }}>
        <GlassCard mark={false} style={{ paddingVertical: space.s, paddingHorizontal: space.m }}>
          <T variant="caption" style={{ color: c.pop }} numeric>−8% vs last month</T>
        </GlassCard>
      </Float>
    </View>
  );
}

/* Slide 3: budget bars grow to different levels with % badges; a donut shows where it went. */
function BudgetScene({ active, width }: { active: boolean; width: number }) {
  const { c } = useTheme();
  const donut = useProgress('donut', 1200, { run: active, delay: 500 });
  const rows = [
    { icon: 'food', name: 'Food', spent: 62, left: '₦26k left' },
    { icon: 'transport', name: 'Transport', spent: 38, left: '₦31k left' },
    { icon: 'airtime', name: 'Airtime', spent: 84, left: '₦2k left' },
  ] as const;
  return (
    <View style={{ width }}>
      <View style={{ width: width - 40, backgroundColor: c.surface, borderRadius: radius.xl, padding: space.l, gap: space.m }}>
        {rows.map((r, i) => (
          <BudgetLineRow key={r.name} {...r} active={active} delay={250 + i * 160} />
        ))}
      </View>
      {/* Overlaps the panel's last row only below its % badge. */}
      <Float amp={6} ms={3100} delay={300} style={{ alignSelf: 'flex-end', marginTop: -44 }}>
        <GlassCard mark={false} style={{ padding: space.m, alignItems: 'center' }}>
          <Donut p={donut} />
          <T variant="caption" tone="onBrandSoft" style={{ marginTop: space.xs }}>Where it went</T>
        </GlassCard>
      </Float>
    </View>
  );

}

/** Spending split as a donut whose parts sweep in as `p` goes 0 → 1. */
function Donut({ p }: { p: number }) {
  const { c } = useTheme();
  const size = 92;
  const r = 34;
  const C = 2 * Math.PI * r;
  // Brand colours only (category colour stays in the icon discs): icy, white, mint, soft white.
  const parts = [
    { share: 0.4, color: c.chartLine },
    { share: 0.25, color: c.onBrand },
    { share: 0.2, color: c.pop },
    { share: 0.15, color: hexAlpha(c.onBrand, 0.45) },
  ];
  let start = 0;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={hexAlpha(c.onBrand, 0.14)} strokeWidth={12} fill="none" />
      {parts.map((s, i) => {
        const len = Math.max(0, Math.min(s.share, p - start) * C - 3);
        const offset = -start * C;
        start += s.share;
        return len > 0 ? (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={s.color}
            strokeWidth={12}
            fill="none"
            strokeDasharray={`${len} ${C}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null;
      })}
    </Svg>
  );
}

function BudgetLineRow({ icon, name, spent, left, active, delay }: { icon: 'food' | 'transport' | 'airtime'; name: string; spent: number; left: string; active: boolean; delay: number }) {
  const shown = useProgress(name, 1, { run: active, delay });
  // BudgetBar grows itself from 0 when `spent` changes, so it starts at 0 and jumps to its level.
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
        <IconDisc icon={icon} size={28} />
        <T variant="bodyStrong" style={{ flex: 1 }}>{name}</T>
        <Badge label={`${spent}%`} />
      </View>
      <BudgetBar spent={shown >= 1 ? spent : 0} budget={100} />
      <T variant="caption" tone="inkMute" numeric>{left}</T>
    </View>
  );
}
