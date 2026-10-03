import { Link } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { useSession } from '../../../shared/lib/useSession';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { normalizeCode, shareCode, skippedLabel, useLoadCode, useSaveCode, type LoadedCode } from '../api/bookingCodes';
import { slipAtom, stakeAtom } from '../state/betslip';

function saveError(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) {
    return 'You have saved a lot of codes. Try again later.';
  }
  return error instanceof ApiError ? error.message : 'Could not save a code. Check your connection and try again.';
}

/** What happened when a code was loaded: how many selections went on, and which ones had closed. */
export function LoadedSummary({ loaded }: { loaded: LoadedCode }) {
  return (
    <View style={styles.summary} accessibilityRole="alert">
      <Text style={styles.ok}>
        {loaded.selections.length > 0 ? `Code ${loaded.code} loaded: ${loaded.selections.length} selection${loaded.selections.length === 1 ? '' : 's'} at today's prices.` : `Every selection in code ${loaded.code} has closed.`}
      </Text>
      {loaded.skipped.length > 0 ? (
        <>
          <Text style={styles.muted}>No longer available, so left out:</Text>
          {loaded.skipped.map((s, i) => (
            <Text key={i} style={styles.skipped}>
              • {skippedLabel(s)}
            </Text>
          ))}
        </>
      ) : null}
    </View>
  );
}

/** Save the slip as a code to share, or load someone else's code. */
export function BookingCodePanel() {
  const slip = useAtomValue(slipAtom);
  const stake = useAtomValue(stakeAtom);
  const signedIn = useSession().data?.signedIn === true;
  const save = useSaveCode();
  const load = useLoadCode();
  const [typed, setTyped] = useState('');
  const [shared, setShared] = useState<string | null>(null);
  const stakeMinor = Math.round((Number.parseFloat(stake.replace(',', '.')) || 0) * 100);
  const typedCode = normalizeCode(typed);
  const resetSave = save.reset;
  // A code belongs to the slip it was saved from; editing the slip offers a fresh one.
  useEffect(() => resetSave(), [slip, resetSave]);

  const onSave = () => {
    setShared(null);
    save.mutate({ slip, stakeMinor: stakeMinor >= 100 ? stakeMinor : null });
  };
  const onShare = async (code: string) => {
    const outcome = await shareCode(code);
    setShared(outcome === 'copied' ? 'Link copied.' : outcome === 'failed' ? 'Could not copy. Share the code instead.' : null);
  };

  return (
    <View style={styles.panel}>
      {slip.length > 0 ? (
        save.data ? (
          <View style={styles.codeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.muted}>Your booking code</Text>
              <Text style={styles.code} selectable accessibilityLabel={`Booking code ${save.data.code.split('').join(' ')}`}>
                {save.data.code}
              </Text>
              <Text style={styles.muted}>Valid for 7 days</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => void onShare(save.data.code)} style={styles.small}>
              <Text style={styles.smallText}>Copy link</Text>
            </Pressable>
          </View>
        ) : signedIn ? (
          <Pressable accessibilityRole="button" disabled={save.isPending} onPress={onSave} style={styles.outline}>
            <Text style={styles.outlineText}>{save.isPending ? 'Saving…' : 'Save as code'}</Text>
          </Pressable>
        ) : (
          <Link href="/account/sign-in" style={styles.mutedLink}>
            Sign in to save this slip as a code
          </Link>
        )
      ) : null}
      {save.isError ? <Text style={styles.error}>{saveError(save.error)}</Text> : null}
      {shared ? <Text style={styles.muted}>{shared}</Text> : null}

      <Text style={styles.label} nativeID="code-label">
        Have a booking code?
      </Text>
      <View style={styles.loadRow}>
        <TextInput
          accessibilityLabelledBy="code-label"
          accessibilityLabel="Booking code"
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
          placeholder="e.g. K7QM2XPA"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Pressable accessibilityRole="button" disabled={!typedCode || load.isPending} onPress={() => typedCode && load.mutate(typedCode)} style={[styles.small, !typedCode && styles.disabled]}>
          <Text style={styles.smallText}>{load.isPending ? 'Loading…' : 'Load'}</Text>
        </Pressable>
      </View>
      {load.isError ? <Text style={styles.error}>{load.error instanceof ApiError && load.error.status === 404 ? 'That code does not exist or has expired.' : 'Could not load the code. Try again.'}</Text> : null}
      {load.data ? <LoadedSummary loaded={load.data} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.xs + 2, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm + 2 },
  code: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: 3, fontVariant: ['tabular-nums'] },
  label: { color: colors.textMuted, fontSize: 13 },
  loadRow: { flexDirection: 'row', gap: spacing.xs },
  input: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '700', letterSpacing: 2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceSunken },
  small: { backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: 'center', minHeight: 40 },
  smallText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  disabled: { opacity: 0.45 },
  outline: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 11, alignItems: 'center' },
  outlineText: { color: colors.text, fontWeight: '800', fontSize: 14 },
  mutedLink: { color: colors.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  muted: { color: colors.textMuted, fontSize: 12 },
  error: { color: colors.negative, fontSize: 13 },
  summary: { gap: 2 },
  ok: { color: colors.positive, fontSize: 13, fontWeight: '700' },
  skipped: { color: colors.text, fontSize: 12 },
});
