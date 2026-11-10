import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { announceError } from '@/components/announce';
import { Field } from '@/components/field';
import { T } from '@/components/text';
import { useActions } from '@/data/store';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, updateSettings } = useActions();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  const errors = {
    name: tried && !name.trim() ? 'Tell us what to call you' : null,
    email: tried && !EMAIL.test(email.trim()) ? 'Enter a valid email, like ada@gmail.com' : null,
    password: tried && password.length < 8 ? 'Use at least 8 characters' : null,
  };

  const submit = () => {
    if (busy) return;
    setTried(true);
    if (!name.trim()) return announceError('Tell us what to call you');
    if (!EMAIL.test(email.trim())) return announceError('Enter a valid email');
    if (password.length < 8) return announceError('Use at least 8 characters for the password');
    setBusy(true);
    // Phase 2: Supabase Auth sign-up + email confirmation.
    timer.current = setTimeout(() => {
      updateSettings({ firstName: name.trim(), email: email.trim() });
      signIn();
      router.replace('/');
    }, 500);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.ground }} behavior="padding">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.l, paddingBottom: space.xxl }}>
        <T variant="largeTitle" accessibilityRole="header">
          Create your account
        </T>
        <T variant="body" tone="inkSoft" style={{ marginTop: -space.s }}>
          Your expenses are saved to your account, so they’re safe if you change phones.
        </T>
        <Field label="First name" value={name} onChangeText={setName} autoComplete="given-name" textContentType="givenName" error={errors.name} />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={errors.email} />
        <Field label="Password" value={password} onChangeText={setPassword} secure autoComplete="new-password" textContentType="newPassword" error={errors.password} hint="At least 8 characters" />
        <T variant="sub" tone="inkMute">
          By creating an account you agree to the Terms and Privacy Policy.
        </T>
      </ScrollView>
      <View style={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.l }}>
        <Button label="Create account" onPress={submit} loading={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}
