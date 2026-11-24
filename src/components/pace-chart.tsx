import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/use-theme';

import { T } from './text';

type Pt = [number, number];

/** Monotone cubic path (no overshoot below zero or past the real values). */
function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
  const n = pts.length;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  t[n - 1] = m[n - 2];
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const s = 3 / Math.sqrt(h);
      t[i] = s * a * m[i];
      t[i + 1] = s * b * m[i];
    }
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${(pts[i][0] + h).toFixed(1)},${(pts[i][1] + t[i] * h).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)},${(pts[i + 1][1] - t[i + 1] * h).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}

export function PaceChart({
  current,
  previous,
  todayIndex,
  labels,
  accessibilityLabel,
  height = 132,
}: {
  /** Cumulative per day for this month (full month length). */
  current: number[];
  /** Cumulative per day for last month. */
  previous: number[];
  /** 0-based day index of today; the line stops here. */
  todayIndex: number;
  labels: [string, string, string];
  accessibilityLabel: string;
  height?: number;
}) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  // The x axis is this month's days; last month is drawn up to the same day count.
  const days = current.length;
  const max = Math.max(1, ...current.slice(0, todayIndex + 1), ...previous.slice(0, days)) * 1.08;
  const padTop = 10;
  const padBottom = 6;
  const plotH = height - padTop - padBottom;
  const x = (i: number) => (days <= 1 ? 0 : (i / (days - 1)) * (w - 12) + 6);
  const y = (v: number) => padTop + plotH - (v / max) * plotH;

  const curPts: Pt[] = current.slice(0, todayIndex + 1).map((v, i) => [x(i), y(v)]);
  const prevPts: Pt[] = previous.slice(0, days).map((v, i) => [x(i), y(v)]);
  const curPath = smoothPath(curPts);
  const last = curPts[curPts.length - 1];
  const fillPath = last ? `${curPath} L${last[0].toFixed(1)},${height} L${curPts[0][0].toFixed(1)},${height} Z` : '';

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View onLayout={onLayout} style={{ height }}>
        {w > 0 && (
          <Svg width={w} height={height}>
            <Defs>
              <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={c.chartLine} stopOpacity={0.22} />
                <Stop offset="1" stopColor={c.chartLine} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={smoothPath(prevPts)} stroke={c.chartGhost} strokeWidth={1.5} strokeDasharray="4 5" fill="none" />
            {fillPath ? <Path d={fillPath} fill="url(#fill)" /> : null}
            <Path d={curPath} stroke={c.chartLine} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {last ? (
              <>
                <Circle cx={last[0]} cy={last[1]} r={9} fill={c.pop} opacity={0.28} />
                <Circle cx={last[0]} cy={last[1]} r={4.5} fill={c.pop} />
              </>
            ) : null}
          </Svg>
        )}
      </View>
      <View style={{ height: 18, marginTop: 6 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <T variant="caption" tone="onBrandSoft" style={{ position: 'absolute', left: 0 }}>
          {labels[0]}
        </T>
        {/* The middle label sits under the today dot; hidden when it would collide with an end label. */}
        {labels[1] && w > 0 && x(todayIndex) > 56 && x(todayIndex) < w - 56 ? (
          <T variant="caption" tone="onBrandSoft" style={{ position: 'absolute', left: x(todayIndex) - 30, width: 60, textAlign: 'center' }}>
            {labels[1]}
          </T>
        ) : null}
        <T variant="caption" tone="onBrandSoft" style={{ position: 'absolute', right: 0 }}>
          {labels[2]}
        </T>
      </View>
    </View>
  );
}
