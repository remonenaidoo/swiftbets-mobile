import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatOdds, formatRand } from '../../../shared/lib/format';
import { api } from '../../../shared/lib/session';
import type { Fixture, MyCoupon, MyCouponLeg } from '../../../shared/lib/types';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, maxContentWidth, radius, spacing } from '../../../shared/ui/theme';
import { fixturesKey } from '../../fixtures/api/fixtures';
import { useSession } from '../../../shared/lib/useSession';
import { CashoutPanel, canCashOut } from '../../cashout/components/CashoutPanel';
import { useMyBets } from '../api/myBets';

interface Tone {
  label: string;
  color: string;
}

const paidTone: Tone = { label: 'Paid', color: colors.positive };

const statusTone: Record<string, Tone> = {
  open: { label: 'Open', color: colors.accent },
  placed: { label: 'Open', color: colors.accent },
  won: { label: 'Won', color: colors.positive },
  paid: { label: 'Paid', color: colors.positive },
  lost: { label: 'Lost', color: colors.textMuted },
  void: { label: 'Void', color: colors.warning },
  cashedOut: { label: 'Cashed out', color: colors.positive },
};

function tone(coupon: MyCoupon): Tone {
  if (coupon.paidToDate > 0) {
    return paidTone;
  }
  return statusTone[coupon.status] ?? { label: coupon.status, color: colors.textMuted };
}

/** The selection's display name from the live fixture when it is still listed, else a readable fallback. */
function legLabel(leg: MyCouponLeg, fixture: Fixture | undefined): string {
  const named = fixture?.markets.find((m) => m.marketId === leg.marketId)?.selections.find((s) => s.selectionId === leg.selectionId)?.name;
  if (named) {
    return named;
  }
  const fallback: Record<string, string> = { home: 'Home', draw: 'Draw', away: 'Away', over: 'Over 2.5', under: 'Under 2.5' };
  return fallback[leg.selectionId] ?? leg.selectionId;
}

export function MyBetsScreen() {
  const [tab, setTab] = useState<'open' | 'settled'>('open');
  const bets = useMyBets(tab === 'open');
  const signedIn = useSession().data?.signedIn === true;
  const listed = useQueryClient().getQueryData<Fixture[]>(fixturesKey) ?? [];
  const legFixtureIds = [...new Set((bets.data ?? []).flatMap((c) => (c.legs ?? []).map((l) => l.fixtureId)))];
  // Matches leave the listing once played; their names come from the fixture itself.
  const looked = useQueries({
    queries: legFixtureIds
      .filter((id) => !listed.some((f) => f.fixtureId === id))
      .map((id) => ({ queryKey: ['fixture', id], queryFn: () => api<Fixture>(`/fixtures/${encodeURIComponent(id)}`), staleTime: Infinity })),
  });
  const fixtures = [...listed, ...looked.flatMap((q) => (q.data ? [q.data] : []))];
  const names = new Map(fixtures.map((f) => [f.fixtureId, `${f.homeTeam} v ${f.awayTeam}`]));
  const byId = new Map(fixtures.map((f) => [f.fixtureId, f]));

  if (!signedIn) {
    return <EmptyState title="Sign in to see your bets" message="Your bets appear here once you are signed in." />;
  }
  if (bets.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (bets.isError) {
    return <EmptyState title="Could not load your bets" message="Check your connection and try again." />;
  }

  return (
    <FlatList
      data={bets.data}
      keyExtractor={(c) => c.couponId}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            My bets
          </Text>
          <View style={styles.tabs} role="tablist">
            {(['open', 'settled'] as const).map((t) => (
              <Pressable key={t} role="tab" aria-selected={tab === t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'open' ? 'Open' : 'Settled'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title={tab === 'open' ? 'No open bets' : 'No settled bets yet'}
          message={tab === 'open' ? 'Bets appear here the moment they are placed, and you can cash them out before they settle.' : 'Settled bets appear here, with what each one paid.'}
        />
      }
      renderItem={({ item }) => {
        const t = tone(item);
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.type}>
                {item.betType === 'accumulator' ? `Accumulator · ${item.legs?.length ?? 0} legs` : item.betType === 'system' ? `System · ${item.legs?.length ?? 0} legs` : 'Single'} @ {formatOdds(item.totalOdds ?? 0)}
              </Text>
              <Text style={[styles.badge, { color: t.color, borderColor: t.color }]}>{t.label}</Text>
            </View>
            {(item.legs ?? []).map((leg) => (
              <Text key={leg.legId} style={styles.leg} numberOfLines={1}>
                {legLabel(leg, byId.get(leg.fixtureId))} @ {formatOdds(leg.odds)} · {names.get(leg.fixtureId) ?? '…'}
              </Text>
            ))}
            <View style={styles.row}>
              <Text style={styles.muted}>Stake {formatRand(item.stake ?? 0, item.currency)}</Text>
              <Text style={[styles.amount, item.paidToDate > 0 && { color: colors.positive }]}>
                {item.paidToDate > 0
                  ? `Paid ${formatRand(item.paidToDate, item.currency)}`
                  : item.status === 'lost'
                    ? 'No return'
                    : `Returns ${formatRand(item.potentialPayout ?? 0, item.currency)}`}
              </Text>
            </View>
            {canCashOut(item) ? <CashoutPanel coupon={item} /> : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, gap: spacing.md, paddingBottom: 120, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  heading: { gap: spacing.sm },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: spacing.xs },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.selected, borderColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  card: { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  type: { color: colors.text, fontWeight: '600', flexShrink: 1 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  leg: { color: colors.textMuted, fontSize: 13 },
  muted: { color: colors.textMuted, fontSize: 13 },
  amount: { color: colors.text, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
