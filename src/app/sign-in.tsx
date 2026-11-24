import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { announceError } from '@/components/announce';
import { Field } from '@/components/field';
import { LinkButton } from '@/components/link-button';
import { T } from '@/components/text';
import { useActions } from '@/data/store';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, updateSettings } = useActions();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const emailErr = tried && !EMAIL.test(email.trim()) ? 'Enter the email you signed up with' : null;
  const pwErr = tried && password.length === 0 ? 'Enter your password' : null;

  const submit = () => {
    if (busy) return;
    setTried(true);
    if (!EMAIL.test(email.trim())) return announceError('Enter the email you signed up with', emailRef);
    if (!password) return announceError('Enter your password', passwordRef);
    setBusy(true);
    // Phase 2: Supabase Auth sign-in, with an error path that resets busy.
    timer.current = setTimeout(() => {
      // Settings shows the account that signed in, not whoever was stored before.
      updateSettings({ email: email.trim() });
      signIn();
      router.replace('/');
    }, 500);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.ground }} behavior="padding">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.l, paddingBottom: space.xxl }}>
        <T variant="largeTitle" accessibilityRole="header">
          Welcome back
        </T>
        <Field ref={emailRef} label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={emailErr} />
        <Field ref={passwordRef} label="Password" value={password} onChangeText={setPassword} secure autoComplete="current-password" textContentType="password" error={pwErr} onSubmitEditing={submit} />
        <LinkButton label="Forgot your password?" onPress={() => router.push('/reset')} />
      </ScrollView>
      <View style={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.l }}>
        <Button label="Sign in" onPress={submit} loading={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}
