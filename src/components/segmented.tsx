import { Pressable, View } from 'react-native';

import { TARGET, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

export type SegmentedOption<K extends string> = { key: K; label: string; a11yLabel?: string };

/**
 * A pill track of mutually exclusive options (DESIGN.md, Chips / segmented control): ground track,
 * the selected option as a surface pill with Ink text. A radiogroup for screen readers.
 */
export function Segmented<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegmentedOption<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  const { c } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', backgroundColor: c.ground, borderRadius: radius.pill, padding: 2 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on, selected: on }}
            accessibilityLabel={o.a11yLabel ?? o.label}
            style={{ flex: 1, minHeight: TARGET, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.surface : 'transparent' }}>
            <T variant="sub" tone={on ? 'ink' : 'inkMute'}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}
