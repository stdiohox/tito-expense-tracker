import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react-native';
import { useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { formatMoney } from '@/domain/money';
import type { CurrencyCode } from '@/domain/types';
import { TARGET, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { STROKE } from './icons';
import { T } from './text';
import { useProgress } from './use-progress';

const HEIGHT = 140;
const PAD_TOP = 14;

/**
 * Spending per day across a month: one bar per day (this month), last month as a dashed line, on a
 * light panel. Tap anywhere on the chart to pick the nearest day, or use the arrows (44pt targets);
 * the line under the chart says that day's total and last month's on the same day. Screen readers
 * get a summary and can step through days (adjustable). Bars grow in; Reduce Motion skips that.
 */
export function DailyChart({
  perDay,
  lastMonth,
  monthKey,
  monthShort,
  lastShort,
  lastDay,
  currency,
}: {
  /** This month's spend per day (full month length). */
  perDay: number[];
  /** Last month's spend per day. */
  lastMonth: number[];
  /** Restarts the grow-in animation when it changes. */
  monthKey: string;
  monthShort: string;
  lastShort: string;
  /** 0-based index of the last day that has happened (today, or the month's last day). */
  lastDay: number;
  currency: CurrencyCode;
}) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const days = perDay.length;
  const busiest = perDay.reduce((best, v, i) => (v > perDay[best] ? i : best), 0);
  const [picked, setPicked] = useState<{ key: string; day: number } | null>(null);
  const sel = picked && picked.key === monthKey ? picked.day : perDay[busiest] > 0 ? busiest : lastDay;
  const grow = useProgress(monthKey);

  const max = Math.max(1, ...perDay, ...lastMonth.slice(0, days)) * 1.1;
  const slot = w / days;
  const barW = Math.max(2, Math.min(10, slot * 0.62));
  const plotH = HEIGHT - PAD_TOP;
  const xMid = (i: number) => slot * i + slot / 2;
  const y = (v: number) => PAD_TOP + plotH - (v / max) * plotH;

  const ghost = lastMonth
    .slice(0, days)
    .map((v, i) => `${i ? 'L' : 'M'}${xMid(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');

  const dayText = (d: number) =>
    `${d + 1} ${monthShort}: ${formatMoney(perDay[d] ?? 0, currency)}${
      lastMonth.length > d ? `, ${formatMoney(lastMonth[d], currency)} on ${d + 1} ${lastShort}` : ''
    }`;

  const choose = (d: number) => {
    const day = Math.max(0, Math.min(days - 1, d));
    setPicked({ key: monthKey, day });
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(dayText(day));
  };
  const onTap = (e: GestureResponderEvent) => {
    if (w > 0) choose(Math.floor(e.nativeEvent.locationX / slot));
  };

  const spendDays = perDay.filter((v) => v > 0).length;
  const summary =
    spendDays === 0
      ? `Daily spending in ${monthShort}: nothing logged yet.`
      : `Daily spending in ${monthShort}: ${spendDays} ${spendDays === 1 ? 'day' : 'days'} with spending. Highest ${formatMoney(perDay[busiest], currency)} on ${busiest + 1} ${monthShort}.`;

  return (
    <View style={{ marginTop: space.s }}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={summary}
        accessibilityValue={{ text: dayText(sel) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => choose(sel + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}>
        <Pressable onPress={onTap} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ height: HEIGHT }} accessible={false}>
          {w > 0 && (
            <Svg width={w} height={HEIGHT} pointerEvents="none">
              <Path d={`M0,${HEIGHT - 0.5} H${w}`} stroke={c.line} strokeWidth={1} />
              {perDay.map((v, i) => {
                const h = v > 0 ? Math.max(3, (v / max) * plotH * grow) : 0;
                const on = i === sel;
                return h > 0 ? (
                  <Rect key={i} x={xMid(i) - barW / 2} y={HEIGHT - h} width={barW} height={h} rx={Math.min(3, barW / 2)} fill={on ? c.accent : c.barMuted} />
                ) : null;
              })}
              {lastMonth.some((v) => v > 0) ? (
                <Path d={ghost} stroke={c.inkMute} strokeWidth={1.5} strokeDasharray="3 4" fill="none" opacity={grow} />
              ) : null}
              {/* The picked day: a thin marker above its bar (decorative; the line below says it). */}
              <Rect x={xMid(sel) - 6} y={Math.max(0, y((perDay[sel] ?? 0) * grow) - 8)} width={12} height={3} rx={1.5} fill={c.popOnGround} />
            </Svg>
          )}
        </Pressable>
      </View>

      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xs }}>
        <T variant="caption" tone="inkMute">1 {monthShort}</T>
        <T variant="caption" tone="inkMute">{days} {monthShort}</T>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.s, backgroundColor: c.ground, borderRadius: radius.m }}>
        <Pressable
          onPress={() => choose(sel - 1)}
          disabled={sel === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          accessibilityState={{ disabled: sel === 0 }}
          style={{ width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center', opacity: sel === 0 ? 0.3 : 1 }}>
          <IconChevronLeft size={20} color={c.ink} strokeWidth={STROKE} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }} accessibilityLiveRegion="polite" aria-live="polite">
          <T variant="bodyStrong" numeric>
            {sel + 1} {monthShort} · {formatMoney(perDay[sel] ?? 0, currency)}
          </T>
          {lastMonth.length > sel ? (
            <T variant="caption" tone="inkMute" numeric>
              {sel + 1} {lastShort}: {formatMoney(lastMonth[sel], currency)}
            </T>
          ) : null}
        </View>
        <Pressable
          onPress={() => choose(sel + 1)}
          disabled={sel === days - 1}
          accessibilityRole="button"
          accessibilityLabel="Next day"
          accessibilityState={{ disabled: sel === days - 1 }}
          style={{ width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center', opacity: sel === days - 1 ? 0.3 : 1 }}>
          <IconChevronRight size={20} color={c.ink} strokeWidth={STROKE} />
        </Pressable>
      </View>

      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ flexDirection: 'row', gap: space.l, marginTop: space.s }}>
        <Key swatch={<View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c.barMuted }} />} label={monthShort} />
        <Key swatch={<View style={{ width: 14, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: c.inkMute }} />} label={lastShort} />
      </View>
    </View>
  );
}

function Key({ swatch, label }: { swatch: ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {swatch}
      <T variant="caption" tone="inkSoft">
        {label}
      </T>
    </View>
  );
}
