import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { Field, FormCard, Notice, PrimaryButton } from '../../../shared/ui/Form';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { useRegister } from '../api/account';
import { accountErrorMessage, minimumPasswordLength, validateRegistration, type RegistrationErrors, type RegistrationForm } from '../model/registration';

const currencies = ['ZAR', 'USD'] as const;

export function RegisterScreen() {
  const [form, setForm] = useState<RegistrationForm>({ email: '', password: '', dateOfBirth: '', currency: 'ZAR', acceptedTerms: false });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const register = useRegister();
  const set = <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const found = validateRegistration(form, new Date());
    setErrors(found);
    if (Object.keys(found).length === 0) {
      register.mutate({ email: form.email.trim(), password: form.password, dateOfBirth: form.dateOfBirth.trim(), country: 'ZA', currency: form.currency });
    }
  };

  if (register.isSuccess) {
    return (
      <FormCard title="Check your email">
        <Notice tone="success">We sent a link to {form.email.trim()}. Open it within 24 hours to confirm your address, then sign in.</Notice>
        <Link href="/account/sign-in" style={styles.link}>
          Go to sign in
        </Link>
      </FormCard>
    );
  }

  const serverError = register.error instanceof ApiError ? accountErrorMessage(register.error.code, register.error.message) : register.isError ? 'Could not open the account. Check your connection.' : null;

  return (
    <FormCard title="Open an account">
      <Field label="Email" value={form.email} onChangeText={(v) => set('email', v)} error={errors.email} autoCapitalize="none" autoComplete="email" inputMode="email" />
      <Field label={`Password (at least ${minimumPasswordLength} characters)`} value={form.password} onChangeText={(v) => set('password', v)} error={errors.password} secureTextEntry autoComplete="new-password" />
      <Field label="Date of birth (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={(v) => set('dateOfBirth', v)} error={errors.dateOfBirth} placeholder="1990-04-23" inputMode="numeric" />
      <View style={styles.row} role="radiogroup" aria-label="Currency">
        {currencies.map((currency) => (
          <Pressable key={currency} role="radio" aria-checked={form.currency === currency} onPress={() => set('currency', currency)} style={[styles.chip, form.currency === currency && styles.chipActive]}>
            <Text style={styles.chipText}>{currency}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable role="checkbox" aria-checked={form.acceptedTerms} onPress={() => set('acceptedTerms', !form.acceptedTerms)} style={styles.row}>
        <View style={[styles.box, form.acceptedTerms && styles.boxChecked]} />
        <Text style={styles.terms}>I am 18 or older and accept the terms and the responsible gambling policy.</Text>
      </Pressable>
      {errors.acceptedTerms ? <Notice tone="error">{errors.acceptedTerms}</Notice> : null}
      {serverError ? <Notice tone="error">{serverError}</Notice> : null}
      <PrimaryButton label="Open account" onPress={submit} busy={register.isPending} />
      <Link href="/account/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </FormCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.selected, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '600' },
  box: { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.border },
  boxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  terms: { color: colors.text, flex: 1, fontSize: 13 },
  link: { color: colors.odds, fontWeight: '600' },
});
