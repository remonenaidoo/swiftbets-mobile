import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { Field, FormCard, Notice, PrimaryButton } from '../../../shared/ui/Form';
import { colors } from '../../../shared/ui/theme';
import { useResetPassword } from '../api/account';
import { accountErrorMessage, minimumPasswordLength } from '../model/registration';

export function ResetPasswordScreen({ token }: { token: string | undefined }) {
  const [password, setPassword] = useState('');
  const reset = useResetPassword();

  if (!token) {
    return (
      <FormCard title="Reset your password">
        <Notice tone="error">This link is incomplete. Request a new one.</Notice>
        <Link href="/account/forgot-password" style={styles.link}>
          Request a new link
        </Link>
      </FormCard>
    );
  }

  if (reset.isSuccess) {
    return (
      <FormCard title="Password changed">
        <Notice tone="success">Your password is changed and every device was signed out. Sign in with the new password.</Notice>
        <Link href="/account/sign-in" style={styles.link}>
          Sign in
        </Link>
      </FormCard>
    );
  }

  const error = reset.error instanceof ApiError ? accountErrorMessage(reset.error.code, reset.error.message) : reset.isError ? 'Could not change the password. Try again.' : null;
  return (
    <FormCard title="Choose a new password">
      <Field label={`New password (at least ${minimumPasswordLength} characters)`} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <PrimaryButton label="Change password" onPress={() => reset.mutate({ token, password })} busy={reset.isPending} disabled={password.length < minimumPasswordLength} />
    </FormCard>
  );
}

const styles = StyleSheet.create({ link: { color: colors.accent, fontWeight: '600' } });
