import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../../../shared/ui/Form';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { parseQuietHours, useChannelSettings, usePreferences, useSetChannelSettings, useSetPreference, type ChannelSettings, type Preference } from '../api/inbox';
import { disablePush, enablePush, pushState, type PushState } from '../push';

const labels: Record<Preference['event'], string> = {
  'bet-settled': 'Bet settled',
  'deposit-confirmed': 'Deposit received',
  'limit-reached': 'Limit reached',
  'self-exclusion': 'Break or self-exclusion started',
  'identity-check': 'Identity check result',
};

const channels = [
  ['email', 'Email'],
  ['inApp', 'Inbox'],
  ['push', 'Push'],
  ['sms', 'SMS'],
] as const;

const pushText: Record<PushState, string> = {
  on: 'Push is on for this device.',
  off: 'Push is off for this device.',
  blocked: 'Notifications are blocked. Allow them in your browser or phone settings.',
  unsupported: 'This browser cannot receive push. On iPhone, add the site to your home screen first.',
  unavailable: 'Push is not available right now.',
};

/** Where the customer hears about each event, this device's push, their mobile number, quiet hours and marketing choices. */
export function NotificationSettingsScreen() {
  const preferences = usePreferences();
  const set = useSetPreference();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title} accessibilityRole="header">
        Notifications
      </Text>
      <PushCard />
      <ContactCard />
      {preferences.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {preferences.data?.map((p) => (
        <View key={p.event} style={styles.card}>
          <Text style={styles.event}>{labels[p.event] ?? p.event}</Text>
          {p.locked ? <Text style={styles.note}>Always sent on every channel, so you know it took effect.</Text> : null}
          {channels.map(([channel, label]) => (
            <View key={channel} style={styles.row}>
              <Text style={styles.channel}>{label}</Text>
              <Switch
                accessibilityLabel={`${labels[p.event] ?? p.event} by ${label}`}
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

function PushCard() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    pushState().then(setState, () => setState('unavailable'));
  }, []);

  const toggle = async () => {
    setBusy(true);
    try {
      setState(state === 'on' ? await disablePush() : await enablePush());
    } catch {
      setState('unavailable');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.event}>Push on this device</Text>
      <Text style={styles.note}>{state ? pushText[state] : 'Checking...'}</Text>
      {state === 'on' || state === 'off' ? (
        <PrimaryButton label={state === 'on' ? 'Turn off push' : 'Turn on push'} onPress={() => void toggle()} busy={busy} />
      ) : null}
    </View>
  );
}

function ContactCard() {
  const settings = useChannelSettings();
  return settings.data ? <ContactForm initial={settings.data} /> : null;
}

function ContactForm({ initial }: { initial: ChannelSettings }) {
  const save = useSetChannelSettings();
  const [mobile, setMobile] = useState(initial.mobile ?? '');
  const [start, setStart] = useState(initial.quietStart?.toString() ?? '');
  const [end, setEnd] = useState(initial.quietEnd?.toString() ?? '');
  const [marketing, setMarketing] = useState({ marketingEmail: initial.marketingEmail, marketingPush: initial.marketingPush, marketingSms: initial.marketingSms });
  const [problem, setProblem] = useState<string | null>(null);

  const submit = () => {
    const quiet = parseQuietHours(start, end);
    if (!quiet) {
      setProblem('Quiet hours need a start and an end hour from 0 to 23.');
      return;
    }
    setProblem(null);
    save.mutate({ mobile: mobile.trim() || null, ...quiet, ...marketing });
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.event}>SMS and quiet hours</Text>
        <Text style={styles.label}>Mobile number</Text>
        <TextInput style={styles.input} value={mobile} onChangeText={setMobile} placeholder="+27821234567" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" accessibilityLabel="Mobile number" />
        <Text style={styles.label}>Quiet hours, South African time (no push or SMS)</Text>
        <View style={styles.hours}>
          <TextInput style={[styles.input, styles.hour]} value={start} onChangeText={setStart} placeholder="22" placeholderTextColor={colors.textMuted} keyboardType="number-pad" accessibilityLabel="Quiet hours start" />
          <Text style={styles.channel}>to</Text>
          <TextInput style={[styles.input, styles.hour]} value={end} onChangeText={setEnd} placeholder="7" placeholderTextColor={colors.textMuted} keyboardType="number-pad" accessibilityLabel="Quiet hours end" />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.event}>Offers and news</Text>
        <Text style={styles.note}>Separate from messages about your account, which you always get.</Text>
        {(
          [
            ['marketingEmail', 'Email'],
            ['marketingPush', 'Push'],
            ['marketingSms', 'SMS'],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.channel}>{label}</Text>
            <Switch accessibilityLabel={`Offers by ${label}`} value={marketing[key]} onValueChange={(on) => setMarketing({ ...marketing, [key]: on })} trackColor={{ true: colors.accent, false: colors.cardHigh }} />
          </View>
        ))}
        <PrimaryButton label="Save" onPress={submit} busy={save.isPending} />
        {save.isSuccess ? <Text style={styles.note}>Saved.</Text> : null}
        {problem || save.isError ? (
          <Text style={styles.error} accessibilityRole="alert">
            {problem ?? 'That did not save. Check the mobile number starts with the country code, like +27.'}
          </Text>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40, maxWidth: 760, width: '100%', alignSelf: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  event: { color: colors.text, fontWeight: '800', fontSize: 15 },
  note: { color: colors.textMuted, fontSize: 13 },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 },
  channel: { color: colors.text, fontSize: 14 },
  input: { backgroundColor: colors.cardHigh, color: colors.text, borderRadius: radius.sm, paddingHorizontal: spacing.sm, minHeight: 44, fontSize: 15 },
  hours: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hour: { width: 72, textAlign: 'center' },
  error: { color: colors.negative },
});
