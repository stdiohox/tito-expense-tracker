import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/use-theme';

/**
 * Decorative hero shapes for the intro slides, drawn in the palette (white at low opacity, the icy
 * line and one mint accent). Purely decorative: hidden from screen readers; the slide's headline
 * and text carry the meaning. Our own shapes, not product imagery.
 */
export function IntroHero({ slide, width, height }: { slide: 0 | 1 | 2; width: number; height: number }) {
  const { c } = useTheme();
  const w = width;
  const h = height;
  const cx = w / 2;
  const cy = h / 2;
  const white = c.onBrand;
  return (
    <View
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: w, height: h }}>
      <Svg width={w} height={h}>
        {/* A soft halo behind every slide. */}
        <Circle cx={cx} cy={cy} r={Math.min(w, h) * 0.46} fill={white} fillOpacity={0.06} />
        <Circle cx={cx} cy={cy} r={Math.min(w, h) * 0.32} fill="none" stroke={white} strokeOpacity={0.14} strokeWidth={1.5} />
        {slide === 0 ? (
          <>
            {/* A card with two logged rows and the mint add button. */}
            <Rect x={cx - 110} y={cy - 70} width={220} height={140} rx={24} fill={white} fillOpacity={0.12} stroke={white} strokeOpacity={0.28} />
            <Circle cx={cx - 76} cy={cy - 30} r={14} fill={white} fillOpacity={0.22} />
            <Rect x={cx - 52} y={cy - 36} width={90} height={8} rx={4} fill={white} fillOpacity={0.5} />
            <Rect x={cx - 52} y={cy - 22} width={56} height={6} rx={3} fill={white} fillOpacity={0.28} />
            <Circle cx={cx - 76} cy={cy + 14} r={14} fill={white} fillOpacity={0.22} />
            <Rect x={cx - 52} y={cy + 8} width={76} height={8} rx={4} fill={white} fillOpacity={0.5} />
            <Rect x={cx - 52} y={cy + 22} width={44} height={6} rx={3} fill={white} fillOpacity={0.28} />
            <Circle cx={cx + 98} cy={cy + 64} r={26} fill={c.pop} />
            <Line x1={cx + 88} y1={cy + 64} x2={cx + 108} y2={cy + 64} stroke={c.brandStart} strokeWidth={3} strokeLinecap="round" />
            <Line x1={cx + 98} y1={cy + 54} x2={cx + 98} y2={cy + 74} stroke={c.brandStart} strokeWidth={3} strokeLinecap="round" />
          </>
        ) : null}
        {slide === 1 ? (
          <>
            {/* A month's pace: last month dashed, this month in icy blue, today in mint. */}
            <Polyline
              points={`${cx - 120},${cy + 60} ${cx - 60},${cy + 40} ${cx},${cy + 10} ${cx + 60},${cy - 20} ${cx + 120},${cy - 40}`}
              fill="none"
              stroke={white}
              strokeOpacity={0.4}
              strokeWidth={2}
              strokeDasharray="5 6"
            />
            <Path
              d={`M${cx - 120},${cy + 70} C${cx - 70},${cy + 60} ${cx - 50},${cy + 20} ${cx},${cy + 18} S${cx + 50},${cy - 26} ${cx + 70},${cy - 30}`}
              fill="none"
              stroke={c.chartLine}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <Circle cx={cx + 70} cy={cy - 30} r={14} fill={c.pop} fillOpacity={0.3} />
            <Circle cx={cx + 70} cy={cy - 30} r={7} fill={c.pop} />
          </>
        ) : null}
        {slide === 2 ? (
          <>
            {/* Three budget bars: two within, one filling up, with a mint check badge. */}
            {[0, 1, 2].map((i) => (
              <Rect key={`t${i}`} x={cx - 110} y={cy - 56 + i * 44} width={220} height={14} rx={7} fill={white} fillOpacity={0.16} />
            ))}
            {[0, 1, 2].map((i) => {
              const y = cy - 56 + i * 44;
              const fill = [0.62, 0.38, 0.84][i];
              return <Rect key={`f${i}`} x={cx - 110} y={y} width={220 * fill} height={14} rx={7} fill={c.chartLine} fillOpacity={0.9} />;
            })}
            <Circle cx={cx + 96} cy={cy - 84} r={22} fill={c.pop} />
            <Path d={`M${cx + 86},${cy - 84} l7,7 l13,-14`} fill="none" stroke={c.brandStart} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
      </Svg>
    </View>
  );
}
