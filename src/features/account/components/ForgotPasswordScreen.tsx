import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Field, FormCard, Notice, PrimaryButton } from '../../../shared/ui/Form';
import { colors } from '../../../shared/ui/theme';
import { useRequestPasswordReset } from '../api/account';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const request = useRequestPasswordReset();

  return (
    <FormCard title="Reset your password">
      {request.isSuccess ? (
        <Notice tone="success">If {email.trim()} has an account, a reset link is on its way. It works for one hour.</Notice>
      ) : (
        <>
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" inputMode="email" />
          {request.isError ? <Notice tone="error">Could not send the link. Try again.</Notice> : null}
          <PrimaryButton label="Send reset link" onPress={() => request.mutate(email.trim())} busy={request.isPending} disabled={!email.includes('@')} />
        </>
      )}
      <Link href="/account/sign-in" style={styles.link}>
        Back to sign in
      </Link>
    </FormCard>
  );
}

const styles = StyleSheet.create({ link: { color: colors.accent, fontWeight: '600' } });
