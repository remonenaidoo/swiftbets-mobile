import { Link } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { useSession } from '../../../shared/lib/useSession';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { toastAtom } from '../../../shared/ui/Toast';
import { usePlaceCoupon } from '../api/placeCoupon';
import { acceptPrices, slipAtom, stakeAtom, totalOdds } from '../state/betslip';

const quickStakes = [10, 50, 100, 250];

function refusalMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Could not place the bet. Check your connection and try again.';
  }
  switch (error.code) {
    case 'price_changed':
      return 'A price moved before your bet went in. Review the new prices and place again.';
    case 'market_suspended':
      return 'One of your markets has closed. Remove it to continue.';
    case 'insufficient_funds':
      return 'Your balance is too low for this stake.';
    default:
      return error.message;
  }
}

export function Betslip({ onPlaced }: { onPlaced?: () => void }) {
  const [slip, setSlip] = useAtom(slipAtom);
  const [stake, setStake] = useAtom(stakeAtom);
  const place = usePlaceCoupon();
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const toast = useSetAtom(toastAtom);
  const signedIn = useSession().data?.signedIn === true;

  const stakeMinor = Math.round((Number.parseFloat(stake.replace(',', '.')) || 0) * 100);
  const odds = totalOdds(slip);
  const payoutMinor = Math.round(stakeMinor * odds);
  const moved = slip.some((s) => s.previousOdds !== undefined);
  const closed = slip.some((s) => s.suspended);
  const canPlace = slip.length > 0 && stakeMinor >= 100 && !moved && !closed && !place.isPending;
  const betType = slip.length > 1 ? `Accumulator (${slip.length} legs)` : 'Single';

  const submit = () => {
    setConfirmation(null);
    place.mutate(
      { slip, stakeMinor },
      {
        onSuccess: (coupon) => {
          const message = `Bet placed · ${formatRand(stakeMinor)} to return ${formatRand(coupon.potentialPayout.minorUnits)}`;
          setConfirmation(message);
          toast(message);
          setSlip([]);
          onPlaced?.();
        },
      },
    );
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Betslip
        </Text>
        {slip.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={() => setSlip([])}>
            <Text style={styles.link}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {confirmation ? (
        <Text style={styles.success} accessibilityRole="alert">
          {confirmation}
        </Text>
      ) : null}

      {slip.length === 0 ? (
        <Text style={styles.empty}>Tap any price to add it here. Add more matches for an accumulator.</Text>
      ) : (
        <>
          <ScrollView style={styles.legs} contentContainerStyle={{ gap: spacing.sm }}>
            {slip.map((s) => (
              <View key={s.fixtureId} style={[styles.leg, s.suspended && styles.legClosed]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legSelection}>{s.selectionName}</Text>
                  <Text style={styles.legMeta} numberOfLines={1}>
                    {s.marketName} · {s.fixtureName}
                  </Text>
                  {s.suspended ? <Text style={styles.warn}>Market closed</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {s.previousOdds !== undefined ? <Text style={styles.oldOdds}>{formatOdds(s.previousOdds)}</Text> : null}
                  <Text style={[styles.legOdds, s.previousOdds !== undefined && styles.movedOdds]}>{formatOdds(s.odds)}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${s.selectionName}`} onPress={() => setSlip((c) => c.filter((x) => x !== s))}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summary}>
            <Text style={styles.betType}>{betType}</Text>
            <Text style={styles.totalOdds}>@ {formatOdds(odds)}</Text>
          </View>

          <Text style={styles.label} nativeID="stake-label">
            Stake (R)
          </Text>
          <TextInput
            accessibilityLabelledBy="stake-label"
            accessibilityLabel="Stake in rand"
            value={stake}
            onChangeText={setStake}
            inputMode="decimal"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <View style={styles.quick}>
            {quickStakes.map((amount) => (
              <Pressable key={amount} accessibilityRole="button" onPress={() => setStake(String(amount))} style={styles.chip}>
                <Text style={styles.chipText}>R{amount}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.summary}>
            <Text style={styles.muted}>Potential return</Text>
            <Text style={styles.payout}>{formatRand(payoutMinor)}</Text>
          </View>

          {place.isError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {refusalMessage(place.error)}
            </Text>
          ) : null}

          {!signedIn ? (
            <Link href="/account/sign-in" asChild>
              <Pressable accessibilityRole="button" style={styles.button}>
                <Text style={styles.buttonText}>Sign in to place this bet</Text>
              </Pressable>
            </Link>
          ) : moved ? (
            <Pressable accessibilityRole="button" onPress={() => setSlip(acceptPrices)} style={[styles.button, styles.buttonWarn]}>
              <Text style={styles.buttonText}>Accept new prices</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" disabled={!canPlace} onPress={submit} style={[styles.button, !canPlace && styles.buttonDisabled]}>
              <Text style={styles.buttonText}>{place.isPending ? 'Placing…' : `Place bet ${stakeMinor >= 100 ? formatRand(stakeMinor) : ''}`}</Text>
            </Pressable>
          )}
          {stakeMinor > 0 && stakeMinor < 100 ? <Text style={styles.muted}>Minimum stake is R1.</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.sm, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  link: { color: colors.accent, fontSize: 14 },
  empty: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  success: { color: colors.positive, fontSize: 14, fontWeight: '600' },
  legs: { maxHeight: 320 },
  leg: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSunken },
  legClosed: { borderColor: colors.negative },
  legSelection: { color: colors.text, fontWeight: '600', fontSize: 15 },
  legMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  legOdds: { color: colors.text, fontWeight: '700', fontSize: 16, fontVariant: ['tabular-nums'] },
  movedOdds: { color: colors.warning },
  oldOdds: { color: colors.textMuted, fontSize: 12, textDecorationLine: 'line-through' },
  remove: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  warn: { color: colors.negative, fontSize: 12, marginTop: 2 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  betType: { color: colors.text, fontWeight: '600' },
  totalOdds: { color: colors.text, fontWeight: '700', fontVariant: ['tabular-nums'] },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  input: { color: colors.text, fontSize: 18, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceSunken },
  quick: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.text, fontSize: 13 },
  muted: { color: colors.textMuted, fontSize: 13 },
  payout: { color: colors.positive, fontWeight: '700', fontSize: 18, fontVariant: ['tabular-nums'] },
  error: { color: colors.negative, fontSize: 13 },
  button: { backgroundColor: colors.accentStrong, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.xs },
  buttonWarn: { backgroundColor: '#b45309' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});
