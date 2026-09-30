import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from './theme';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 12 },
  title: { color: colors.text, fontSize: 18, fontWeight: '600' },
  message: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
