import { useRef, useState, type ComponentRef } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { announceError } from '@/components/announce';
import { Button } from '@/components/button';
import { Field } from '@/components/field';
import { backOr } from '@/components/nav';
import { T } from '@/components/text';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Reset() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: c.ground, paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.l }}>
        <View style={{ flex: 1, gap: space.l }}>
          <T variant="largeTitle" accessibilityRole="header">
            Check your email
          </T>
          <T variant="body" tone="inkSoft">
            If {email.trim()} has an account, a link to set a new password is on its way. It can take a few minutes; check
            spam too.
          </T>
        </View>
        <Button label="Back to sign in" onPress={() => backOr('/sign-in')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.l }}>
        <T variant="largeTitle" accessibilityRole="header">
          Reset your password
        </T>
        <T variant="body" tone="inkSoft">
          Enter the email you signed up with and we’ll send you a link.
        </T>
        <Field
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={tried && !EMAIL.test(email.trim()) ? 'Enter a valid email' : null}
        />
      </ScrollView>
      <View style={{ paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.l }}>
        <Button
          label="Send reset link"
          onPress={() => {
            setTried(true);
            if (!EMAIL.test(email.trim())) return announceError('Enter a valid email', emailRef);
            setSent(true); // Phase 2: Supabase resetPasswordForEmail.
          }}
        />
      </View>
    </View>
  );
}
