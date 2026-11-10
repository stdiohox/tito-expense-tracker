import { forwardRef, useId, useState, type ComponentRef } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { TARGET, fonts, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { T } from './text';

type Props = TextInputProps & { label: string; error?: string | null; hint?: string; secure?: boolean };

export const Field = forwardRef<ComponentRef<typeof TextInput>, Props>(function Field(
  { label, error, hint, secure, ...input },
  ref,
) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const [shown, setShown] = useState(false);
  const id = useId();
  const errId = `${id}-err`;
  return (
    <View style={{ gap: space.xs }}>
      {/* The input carries the label itself; hide this copy so it is not read twice. */}
      <T variant="sub" tone="inkSoft" nativeID={id} importantForAccessibility="no" accessibilityElementsHidden>
        {label}
      </T>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: radius.m,
          borderWidth: focused ? 2 : 1,
          borderColor: error ? c.danger : focused ? c.accent : c.line,
          backgroundColor: c.surface,
          paddingLeft: focused ? space.l - 1 : space.l,
        }}>
        <TextInput
          ref={ref}
          {...input}
          secureTextEntry={secure && !shown}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          maxFontSizeMultiplier={2}
          placeholderTextColor={c.inkMute}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={{ flex: 1, minWidth: 0, minHeight: 50, fontFamily: fonts.medium, fontSize: 16, color: c.ink }}
        />
        {secure ? (
          <Pressable
            onPress={() => setShown((s) => !s)}
            accessibilityRole="button"
            accessibilityLabel={shown ? 'Hide password' : 'Show password'}
            style={{ minWidth: 64, minHeight: TARGET, alignItems: 'center', justifyContent: 'center' }}>
            <T variant="caption" tone="accent">
              {shown ? 'Hide' : 'Show'}
            </T>
          </Pressable>
        ) : null}
      </View>
      <View accessibilityLiveRegion="polite" aria-live="polite">
        {error ? (
          <T variant="sub" tone="danger" nativeID={errId}>
            {error}
          </T>
        ) : hint ? (
          <T variant="sub" tone="inkMute">
            {hint}
          </T>
        ) : null}
      </View>
    </View>
  );
});
