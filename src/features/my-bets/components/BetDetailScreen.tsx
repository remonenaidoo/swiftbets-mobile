import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import type { CouponDetail } from '../../../shared/lib/types';
import { useSession } from '../../../shared/lib/useSession';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { toastAtom } from '../../../shared/ui/Toast';
import { betTypeAtom, slipAtom } from '../../betslip/state/betslip';
import { slipSheetAtom } from '../../betslip/state/slipSheet';
import { CashoutPanel, canCashOut } from '../../cashout/components/CashoutPanel';
import { fetchFixture, useCouponDetail } from '../api/myBets';
import { repeatMessage, repeatSelections } from '../state/repeat';
import { betTypeLabel, fixtureName, legLabel, tone, useLegFixtures } from './betDisplay';

const results: Record<string, { label: string; color: string }> = {
  won: { label: 'Won', color: colors.positive },
  lost: { label: 'Lost', color: colors.negative },
  void: { label: 'Void', color: colors.warning },
};

const outcomes: Record<string, string> = { won: 'Settled as won', lost: 'Settled as lost', void: 'Settled as void', cashedOut: 'Cashed out' };

const stamp = (iso: string) => new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

interface Step {
  key: string;
  title: string;
  detail: string;
}

/** Placement, then each settlement in version order (a later one replaces the earlier), then what has been paid. */
function timeline(bet: CouponDetail): Step[] {
  const steps: Step[] = [];
  if (bet.placedAt) {
    steps.push({ key: 'placed', title: 'Placed', detail: `${stamp(bet.placedAt)} · stake ${formatRand(bet.stake ?? 0, bet.currency)}` });
  }
  bet.settlements.forEach((s, i) => {
    const title = i > 0 ? `Resettled: ${(outcomes[s.outcome] ?? s.outcome).replace('Settled as ', '')}` : (outcomes[s.outcome] ?? s.outcome);
    steps.push({ key: `s${s.version}`, title, detail: `${stamp(s.settledAt)} · returns ${formatRand(s.payout, bet.currency)}` });
  });
  if (bet.settlements.length === 0 && bet.status !== 'open') {
    steps.push({ key: 'settled', title: outcomes[bet.status] ?? 'Settled', detail: `Returns ${formatRand(bet.payout ?? 0, bet.currency)}` });
  }
  if (bet.paidToDate > 0) {
    steps.push({ key: 'paid', title: 'Paid to your wallet', detail: formatRand(bet.paidToDate, bet.currency) });
  }
  if (bet.status === 'open') {
    steps.push({ key: 'waiting', title: 'Waiting for results', detail: 'Settles as soon as the last leg is decided.' });
  }
  return steps;
}

export function BetDetailScreen({ couponId }: { couponId: string }) {
  const signedIn = useSession().data?.signedIn === true;
  const detail = useCouponDetail(couponId);
  const fixtures = useLegFixtures((detail.data?.legs ?? []).map((l) => l.fixtureId));
  const queryClient = useQueryClient();
  const setSlip = useSetAtom(slipAtom);
  const setBetType = useSetAtom(betTypeAtom);
  const openSlip = useSetAtom(slipSheetAtom);
  const toast = useSetAtom(toastAtom);
  const [repeating, setRepeating] = useState(false);

  if (!signedIn) {
    return <EmptyState title="Sign in to see your bets" message="Your bets appear here once you are signed in." />;
  }
  if (detail.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (detail.isError || !detail.data) {
    return <EmptyState title="Bet not found" message="It may belong to another account, or the link is wrong." />;
  }

  const bet = detail.data;
  const t = tone(bet);

  const repeat = async () => {
    setRepeating(true);
    try {
      const ids = [...new Set(bet.legs.map((l) => l.fixtureId))];
      // Today's prices, not the cached ones.
      const fresh = await Promise.all(ids.map((id) => queryClient.fetchQuery({ queryKey: ['fixture', id], queryFn: () => fetchFixture(id), staleTime: 0 }).catch(() => undefined)));
      const result = repeatSelections(bet.legs, new Map(fresh.flatMap((f) => (f ? [[f.fixtureId, f] as const] : []))));
      if (result.selections.length > 0) {
        setSlip(result.selections);
        setBetType('accumulator');
        openSlip(true);
      }
      toast(repeatMessage(result));
    } finally {
      setRepeating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Link href={'/my-bets' as never} style={styles.back}>
        ‹ My bets
      </Link>
      <View style={styles.row}>
        <Text style={styles.title} accessibilityRole="header">
          {betTypeLabel(bet, bet.legs.length)}
        </Text>
        <Text style={[styles.badge, { color: t.color, borderColor: t.color }]}>{t.label}</Text>
      </View>

      <View style={styles.card}>
        <Summary label="Stake" value={formatRand(bet.stake ?? 0, bet.currency)} />
        <Summary label="Odds" value={formatOdds(bet.totalOdds ?? 0)} />
        <Summary label={bet.status === 'open' ? 'Potential return' : 'Returned'} value={formatRand(bet.status === 'open' ? (bet.potentialPayout ?? 0) : (bet.payout ?? 0), bet.currency)} />
        {bet.cashout ? <Summary label="Cashed out for" value={formatRand(bet.cashout.amount, bet.currency)} /> : null}
      </View>

      <Text style={styles.section} accessibilityRole="header">
        Selections
      </Text>
      <View style={styles.card}>
        {bet.legs.map((leg) => {
          const result = leg.result ? results[leg.result] : undefined;
          const fixture = fixtures.get(leg.fixtureId);
          return (
            <View key={leg.legId} style={styles.leg}>
              <View style={styles.legText}>
                <Text style={styles.legName}>
                  {legLabel(leg, fixture)} @ {formatOdds(leg.odds)}
                  {leg.isBanker ? ' · banker' : ''}
                </Text>
                <Text style={styles.muted}>{fixtureName(fixture)}</Text>
              </View>
              <Text style={[styles.result, { color: result?.color ?? colors.textMuted }]}>{result?.label ?? (bet.status === 'open' ? 'Pending' : '–')}</Text>
            </View>
          );
        })}
        {!bet.resultsAvailable && bet.status !== 'open' ? <Text style={styles.muted}>Leg results are not available right now.</Text> : null}
      </View>

      <Text style={styles.section} accessibilityRole="header">
        Timeline
      </Text>
      <View style={styles.card}>
        {timeline(bet).map((step) => (
          <View key={step.key} style={styles.step}>
            <View style={styles.dot} />
            <View style={styles.legText}>
              <Text style={styles.legName}>{step.title}</Text>
              <Text style={styles.muted}>{step.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {canCashOut({ ...bet, legs: bet.legs }) ? <CashoutPanel coupon={{ ...bet, legs: bet.legs }} /> : null}

      <Pressable role="button" onPress={() => void repeat()} disabled={repeating} style={[styles.repeat, repeating && styles.busy]} accessibilityLabel="Repeat bet: put these selections in the betslip at today's prices">
        <Text style={styles.repeatText}>{repeating ? 'Checking prices…' : 'Repeat bet'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { padding: spacing.md, gap: spacing.sm + 2, paddingBottom: 40, width: '100%', maxWidth: 720, alignSelf: 'center' },
  back: { color: colors.odds, fontWeight: '800', fontSize: 14 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', flexShrink: 1 },
  section: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md - 2, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  badge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 2, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  leg: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legText: { flex: 1, gap: 2 },
  legName: { color: colors.text, fontWeight: '700' },
  result: { fontWeight: '800', fontSize: 13 },
  muted: { color: colors.textMuted, fontSize: 13 },
  value: { color: colors.text, fontWeight: '800', fontVariant: ['tabular-nums'] },
  step: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginTop: 5 },
  repeat: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', marginTop: spacing.sm },
  busy: { opacity: 0.6 },
  repeatText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
});
