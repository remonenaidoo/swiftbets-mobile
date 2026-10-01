import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { Field, FormCard, Notice, PrimaryButton } from '../../../shared/ui/Form';
import { colors, spacing } from '../../../shared/ui/theme';
import { useSignIn } from '../api/account';
import { accountErrorMessage } from '../model/registration';

export function SignInScreen() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useSignIn();
  const error = signIn.error instanceof ApiError ? accountErrorMessage(signIn.error.code, signIn.error.message) : signIn.isError ? 'Could not sign in. Check your connection.' : null;

  const submit = () => signIn.mutate({ login: login.trim(), password }, { onSuccess: () => router.replace('/') });

  return (
    <FormCard title="Sign in">
      <Field label="Email" value={login} onChangeText={setLogin} autoCapitalize="none" autoComplete="email" inputMode="email" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" onSubmitEditing={submit} />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <PrimaryButton label="Sign in" onPress={submit} busy={signIn.isPending} disabled={!login || !password} />
      <View style={styles.links}>
        <Link href="/account/forgot-password" style={styles.link}>
          Forgot your password?
        </Link>
        <Link href="/account/register" style={styles.link}>
          Open an account
        </Link>
      </View>
      <Text style={styles.small}>18+ only. Gamble responsibly.</Text>
    </FormCard>
  );
}

const styles = StyleSheet.create({
  links: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  link: { color: colors.accent, fontWeight: '600' },
  small: { color: colors.textMuted, fontSize: 12 },
});
