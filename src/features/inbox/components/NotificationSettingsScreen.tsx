import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { usePreferences, useSetPreference, type Preference } from '../api/inbox';

const labels: Record<Preference['event'], string> = {
  'bet-settled': 'Bet settled',
  'deposit-confirmed': 'Deposit received',
  'limit-reached': 'Limit reached',
  'self-exclusion': 'Break or self-exclusion started',
};

/** Where the customer hears about each event; a break confirmation is always sent and cannot be switched off. */
export function NotificationSettingsScreen() {
  const preferences = usePreferences();
  const set = useSetPreference();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title} accessibilityRole="header">
        Notifications
      </Text>
      {preferences.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {preferences.data?.map((p) => (
        <View key={p.event} style={styles.card}>
          <Text style={styles.event}>{labels[p.event]}</Text>
          {p.locked ? <Text style={styles.note}>Always sent by email and in your inbox, so you know it took effect.</Text> : null}
          {(['email', 'inApp'] as const).map((channel) => (
            <View key={channel} style={styles.row}>
              <Text style={styles.channel}>{channel === 'email' ? 'Email' : 'Inbox'}</Text>
              <Switch
                accessibilityLabel={`${labels[p.event]} by ${channel === 'email' ? 'email' : 'inbox'}`}
                value={p[channel]}
                disabled={p.locked || set.isPending}
                onValueChange={(on) => set.mutate({ ...p, [channel]: on })}
                trackColor={{ true: colors.accent, false: colors.cardHigh }}
              />
            </View>
          ))}
        </View>
      ))}
      {set.isError ? (
        <Text style={styles.error} accessibilityRole="alert">
          That did not save. Try again.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40, maxWidth: 760, width: '100%', alignSelf: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  event: { color: colors.text, fontWeight: '800', fontSize: 15 },
  note: { color: colors.textMuted, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 },
  channel: { color: colors.text, fontSize: 14 },
  error: { color: colors.negative },
});
