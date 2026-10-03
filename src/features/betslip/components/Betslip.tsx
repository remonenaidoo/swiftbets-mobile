import { Link } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { useSession } from '../../../shared/lib/useSession';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { toastAtom } from '../../../shared/ui/Toast';
import { freeBetReturnMinor, useBonuses, usableFreeBets } from '../../bonuses/api/bonuses';
import { usePlaceCoupon } from '../api/placeCoupon';
import { acceptPrices, betTypeAtom, slipAtom, stakeAtom, toggleBanker, totalOdds } from '../state/betslip';
import { betTypes, lineCount, linePayoutMinor, maxReturnMinor } from '../state/systemBets';

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
    case 'system_bets_unavailable':
      return 'System bets are not open right now. Place it as an accumulator instead.';
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

  const [betKey, setBetKey] = useAtom(betTypeAtom);
  const [freeBetId, setFreeBetId] = useState<string | null>(null);
  const freeBets = usableFreeBets(useBonuses('ZAR').data?.freeBets, 'ZAR');
  const typedMinor = Math.round((Number.parseFloat(stake.replace(',', '.')) || 0) * 100);
  const showBankers = slip.length >= 4;
  const bankers = showBankers ? slip.filter((s) => s.banker) : [];
  const others = slip.filter((s) => !bankers.includes(s));
  const types = betTypes(others.length, bankers.length);
  const type = types.find((t) => t.key === betKey) ?? types[0]!;
  // A free bet stakes a single or accumulator at its own amount; system bets use cash.
  const freeBet = type.folds ? undefined : freeBets.find((f) => f.freeBetId === freeBetId);
  const enteredMinor = freeBet ? freeBet.amount : typedMinor;
  const lines = type.folds ? lineCount(others.length, type.folds) : 1;
  const stakeMinor = enteredMinor * lines;
  const odds = totalOdds(slip);
  const payoutMinor = type.folds
    ? maxReturnMinor(enteredMinor, others.map((s) => s.odds), type.folds, bankers.map((s) => s.odds))
    : linePayoutMinor(stakeMinor, slip.map((s) => s.odds));
  const returnMinor = freeBet ? freeBetReturnMinor(payoutMinor, stakeMinor) : payoutMinor;
  const moved = slip.some((s) => s.previousOdds !== undefined);
  const closed = slip.some((s) => s.suspended);
  const canPlace = slip.length > 0 && enteredMinor >= 100 && !moved && !closed && !place.isPending;

  const submit = () => {
    setConfirmation(null);
    place.mutate(
      { slip, stakeMinor, bet: type.folds ? { key: type.key, folds: type.folds, unitStakeMinor: enteredMinor } : undefined, freeBetId: freeBet?.freeBetId },
      {
        onSuccess: (coupon) => {
          setFreeBetId(null);
          const message = `${freeBet ? 'Free bet placed' : 'Bet placed'} · ${formatRand(stakeMinor)} to return ${formatRand(coupon.potentialPayout.minorUnits)}`;
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
                  {showBankers ? (
                    <Pressable accessibilityRole="button" aria-pressed={!!s.banker} accessibilityLabel={`Banker ${s.selectionName}`} onPress={() => setSlip((c) => toggleBanker(c, s.fixtureId))} style={[styles.banker, s.banker && styles.bankerOn]}>
                      <Text style={[styles.bankerText, s.banker && styles.bankerTextOn]}>B</Text>
                    </Pressable>
                  ) : null}
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${s.selectionName}`} onPress={() => setSlip((c) => c.filter((x) => x !== s))}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          {types.length > 1 ? (
            <View style={styles.types} role="radiogroup" aria-label="Bet type">
              {types.map((t) => (
                <Pressable key={t.key} role="radio" aria-checked={t.key === type.key} onPress={() => setBetKey(t.key)} style={[styles.typeChip, t.key === type.key && styles.chipOn]}>
                  <Text style={styles.chipText}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.summary}>
            <Text style={styles.betType}>{type.folds ? `${type.label} · ${lines} lines` : type.label}</Text>
            {type.folds ? <Text style={styles.muted}>Total {formatRand(stakeMinor)}</Text> : <Text style={styles.totalOdds}>@ {formatOdds(odds)}</Text>}
          </View>
          {showBankers && type.folds && bankers.length > 0 ? <Text style={styles.muted}>Bankers (B) are in every line.</Text> : null}

          <Text style={styles.label} nativeID="stake-label">
            {type.folds ? 'Stake per line (R)' : 'Stake (R)'}
          </Text>
          {freeBets.length > 0 && !type.folds ? (
            <View style={styles.types} role="radiogroup" aria-label="Use a free bet">
              <Pressable role="radio" aria-checked={!freeBet} onPress={() => setFreeBetId(null)} style={[styles.typeChip, !freeBet && styles.chipOn]}>
                <Text style={styles.chipText}>Cash stake</Text>
              </Pressable>
              {freeBets.map((f) => (
                <Pressable key={f.freeBetId} role="radio" aria-checked={freeBet?.freeBetId === f.freeBetId} onPress={() => setFreeBetId(f.freeBetId)} style={[styles.typeChip, freeBet?.freeBetId === f.freeBetId && styles.chipOn]}>
                  <Text style={styles.chipText}>Free bet {formatRand(f.amount)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {freeBet ? <Text style={styles.muted}>Min odds {formatOdds(freeBet.minOdds)}. The free bet stake is not returned.</Text> : null}
          <TextInput
            accessibilityLabelledBy="stake-label"
            accessibilityLabel="Stake in rand"
            value={freeBet ? String(freeBet.amount / 100) : stake}
            editable={!freeBet}
            onChangeText={setStake}
            inputMode="decimal"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          {freeBet ? null : (
          <View style={styles.quick}>
            {quickStakes.map((amount) => (
              <Pressable key={amount} accessibilityRole="button" aria-pressed={stake === String(amount)} onPress={() => setStake(String(amount))} style={[styles.chip, stake === String(amount) && styles.chipOn]}>
                <Text style={styles.chipText}>R{amount}</Text>
              </Pressable>
            ))}
          </View>
          )}

          <View style={styles.summary}>
            <Text style={styles.muted}>{type.folds ? 'Return if every selection wins' : 'Potential return'}</Text>
            <Text style={styles.payout}>{formatRand(returnMinor)}</Text>
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
            <Pressable accessibilityRole="button" disabled={!canPlace} onPress={submit} style={[styles.button, styles.buttonPlace, !canPlace && styles.buttonDisabled]}>
              <Text style={[styles.buttonText, styles.buttonPlaceText]}>{place.isPending ? 'Placing…' : `${freeBet ? 'Place free bet' : 'Place bet'} ${enteredMinor >= 100 ? formatRand(stakeMinor) : ''}`}</Text>
            </Pressable>
          )}
          {enteredMinor > 0 && enteredMinor < 100 ? <Text style={styles.muted}>Minimum stake is R1.</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.sm, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  link: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  empty: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  success: { color: colors.positive, fontSize: 14, fontWeight: '700' },
  legs: { maxHeight: 320 },
  leg: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md - 4, borderRadius: radius.md, backgroundColor: colors.card },
  legClosed: { borderWidth: 1, borderColor: colors.negative },
  legSelection: { color: colors.text, fontWeight: '700', fontSize: 15 },
  legMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  legOdds: { color: colors.odds, fontWeight: '800', fontSize: 16, fontVariant: ['tabular-nums'] },
  movedOdds: { color: colors.warning },
  oldOdds: { color: colors.textMuted, fontSize: 12, textDecorationLine: 'line-through' },
  remove: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  warn: { color: colors.negative, fontSize: 12, marginTop: 2 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  betType: { color: colors.text, fontWeight: '700' },
  totalOdds: { color: colors.odds, fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  input: { color: colors.text, fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surfaceSunken },
  quick: { flexDirection: 'row', gap: spacing.xs },
  chip: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 2, borderColor: 'transparent' },
  chipOn: { borderColor: colors.accent },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  typeChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 2, borderColor: 'transparent' },
  banker: { minWidth: 28, minHeight: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 4 },
  bankerOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  bankerText: { color: colors.textMuted, fontWeight: '900', fontSize: 12 },
  bankerTextOn: { color: '#1a1300' },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 13 },
  payout: { color: colors.positive, fontWeight: '800', fontSize: 18, fontVariant: ['tabular-nums'] },
  error: { color: colors.negative, fontSize: 13 },
  button: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.xs },
  buttonPlace: { backgroundColor: colors.positive },
  buttonPlaceText: { color: colors.onPositive },
  buttonWarn: { backgroundColor: colors.warning },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
});
