import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { safeBack } from '@/components/nav';
import { useFocusBorder } from '@/components/use-focus-border';
import { T } from '@/components/text';
import { useActions, useStore } from '@/data/store';
import { fonts, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** In-app account deletion (required by Apple 5.1.1(v) and Google Play). */
export default function DeleteAccount() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { expenses } = useStore();
  const { deleteAccount } = useActions();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = typed.trim().toUpperCase() === 'DELETE';
  const confirmFocus = useFocusBorder();

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xxl }}>
        <T variant="largeTitle" accessibilityRole="header">
          Delete your account
        </T>
        <T variant="body" tone="inkSoft" style={{ marginTop: space.l }}>
          This permanently removes your account and all {expenses.length} expenses from this phone and from our
          servers. It can’t be undone.
        </T>
        <T variant="body" tone="inkSoft" style={{ marginTop: space.m }}>
          Want a copy first? Export your expenses from Settings before you continue.
        </T>
        <T variant="headline" style={{ marginTop: space.xxl }} nativeID="confirmLabel">
          Type DELETE to confirm
        </T>
        <TextInput
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabelledBy="confirmLabel"
          accessibilityLabel="Type DELETE to confirm"
          {...confirmFocus.focusProps}
          style={{
            marginTop: space.s,
            minHeight: 52,
            borderRadius: radius.m,
            ...confirmFocus.border,
            backgroundColor: c.surface,
            paddingHorizontal: space.l - confirmFocus.inset,
            fontFamily: fonts.semibold,
            fontSize: 16,
            color: c.ink,
          }}
        />
      </ScrollView>
      <View style={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.l, gap: space.s }}>
        <Button
          label="Delete account"
          variant="danger"
          disabled={!ok}
          loading={busy}
          accessibilityHint={ok ? undefined : 'Type DELETE above to enable'}
          onPress={() => {
            if (busy) return;
            setBusy(true);
            // Phase 2: call the delete-account Edge Function; on failure reset busy and say why.
            timer.current = setTimeout(() => {
              deleteAccount(); // clears local expenses and categories, then signs out
              router.replace('/welcome');
            }, 600);
          }}
        />
        <Button label="Keep my account" variant="plain" disabled={busy} onPress={safeBack} />
      </View>
    </View>
  );
}
