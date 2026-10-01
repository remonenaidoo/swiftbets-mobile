import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Field, FormCard, Notice, PrimaryButton } from '../../../shared/ui/Form';
import { colors } from '../../../shared/ui/theme';
import { useResendVerification, useVerifyEmail } from '../api/account';

export function VerifyEmailScreen({ token }: { token: string | undefined }) {
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [email, setEmail] = useState('');
  const { mutate } = verify;

  useEffect(() => {
    if (token) {
      mutate(token);
    }
  }, [token, mutate]);

  return (
    <FormCard title="Confirm your email">
      {verify.isPending ? <Notice tone="info">Confirming…</Notice> : null}
      {verify.isSuccess ? (
        <>
          <Notice tone="success">Your email address is confirmed.</Notice>
          <Link href="/account/sign-in" style={styles.link}>
            Sign in
          </Link>
        </>
      ) : null}
      {verify.isError || !token ? (
        <>
          <Notice tone="error">This link has expired or was already used. Enter your email for a new one.</Notice>
          {resend.isSuccess ? (
            <Notice tone="success">If that address still needs confirming, a new link is on its way.</Notice>
          ) : (
            <>
              <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" inputMode="email" />
              <PrimaryButton label="Send a new link" onPress={() => resend.mutate(email.trim())} busy={resend.isPending} disabled={!email.includes('@')} />
            </>
          )}
        </>
      ) : null}
    </FormCard>
  );
}

const styles = StyleSheet.create({ link: { color: colors.accent, fontWeight: '600' } });
