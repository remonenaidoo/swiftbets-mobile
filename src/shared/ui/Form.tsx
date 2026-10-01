import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from './theme';

export function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Field({ label, error, ...input }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={colors.textMuted} style={[styles.input, error ? styles.inputError : null]} {...input} />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, busy, disabled }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={busy || disabled} onPress={onPress} style={[styles.button, (busy || disabled) && styles.buttonDisabled]}>
      {busy ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

export function Notice({ tone, children }: { tone: 'success' | 'error' | 'info'; children: ReactNode }) {
  return (
    <Text accessibilityRole={tone === 'error' ? 'alert' : 'text'} style={[styles.notice, tone === 'success' && styles.success, tone === 'error' && styles.error]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: spacing.md, padding: spacing.lg, margin: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  title: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  field: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: 13 },
  input: { color: colors.text, fontSize: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceSunken },
  inputError: { borderColor: colors.negative },
  error: { color: colors.negative, fontSize: 13 },
  success: { color: colors.positive },
  notice: { color: colors.text, fontSize: 14, lineHeight: 20 },
  button: { backgroundColor: colors.accentStrong, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});
