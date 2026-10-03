import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useSetAtom } from 'jotai';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { api } from '../../../shared/lib/session';
import type { Fixture } from '../../../shared/lib/types';
import { useDeltas } from '../../../shared/realtime/useLive';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Icon } from '../../../shared/ui/Icon';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { applyFixture, slipAtom } from '../../betslip/state/betslip';
import { isOutright, sportOf } from '../../sports/sports';
import { Crest, OddsRow } from './FixtureCard';
import { marketLabel } from './marketLabel';

/** One fixture with every market, kept live: each fixture-changed delta for it replaces the snapshot if newer. */
export function FixtureScreen({ fixtureId }: { fixtureId: string }) {
  const queryClient = useQueryClient();
  const setSlip = useSetAtom(slipAtom);
  const key = ['fixture', fixtureId];
  const fixture = useQuery({ queryKey: key, queryFn: () => api<Fixture>(`/fixtures/${encodeURIComponent(fixtureId)}`) });

  useDeltas(['fixture-changed'], (delta) => {
    const changed = delta.payload as Fixture;
    if (changed.fixtureId !== fixtureId) {
      return;
    }
    queryClient.setQueryData<Fixture>(key, (current) => (current && current.offerVersion > changed.offerVersion ? current : changed));
    setSlip((slip) => applyFixture(slip, changed));
  });

  if (fixture.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (fixture.isError) {
    return fixture.error instanceof ApiError && fixture.error.status === 404 ? (
      <EmptyState title="Match not on offer" message="It may have kicked off or finished. Browse what is open now." />
    ) : (
      <EmptyState title="Could not load this match" message="Check your connection and try again." />
    );
  }

  const f = fixture.data;
  const live = f.status === 'inPlay';
  const sport = sportOf(f);
  const outright = isOutright(f);
  const kickoff = new Date(f.kickoffAt).toLocaleString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Link href={`/sports/${encodeURIComponent(sport)}?competition=${encodeURIComponent(f.competition)}` as never} style={styles.back}>
        ‹ {f.competition}
      </Link>
      {outright ? (
        <View style={[styles.hero, styles.heroOutright]}>
          <Icon name="sports/trophy" size={44} />
          <Text style={styles.team} accessibilityRole="header">
            {f.homeTeam}
          </Text>
          <Text style={styles.meta}>{f.status === 'scheduled' ? `Betting closes ${kickoff}` : 'Betting closed'}</Text>
        </View>
      ) : (
        <View style={styles.hero}>
          <View style={styles.side}>
            <Crest name={f.homeTeam} size={44} />
            <Text style={styles.team} numberOfLines={2}>
              {f.homeTeam}
            </Text>
          </View>
          <View style={styles.centre}>
            {live ? <Text style={styles.live}>LIVE</Text> : <Text style={styles.vs}>v</Text>}
            <Text style={styles.meta}>{f.status === 'scheduled' ? kickoff : live ? 'In play' : 'Finished'}</Text>
          </View>
          <View style={styles.side}>
            <Crest name={f.awayTeam} size={44} />
            <Text style={styles.team} numberOfLines={2}>
              {f.awayTeam}
            </Text>
          </View>
        </View>
      )}
      {f.markets.map((market) => (
        <View key={market.marketId} style={styles.market}>
          <Text style={styles.marketName}>{marketLabel(market, sport)}</Text>
          <OddsRow fixture={f} market={market} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { padding: spacing.md, gap: spacing.md, paddingBottom: 40, width: '100%', maxWidth: 820, alignSelf: 'center' },
  back: { color: colors.odds, fontWeight: '700' },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg - 4 },
  heroOutright: { flexDirection: 'column', gap: spacing.sm },
  side: { flex: 1, alignItems: 'center', gap: spacing.sm },
  team: { color: colors.text, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  centre: { alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm },
  vs: { color: colors.textMuted, fontSize: 22, fontWeight: '800' },
  live: { backgroundColor: colors.live, color: '#ffffff', fontWeight: '900', fontSize: 12, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  meta: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  market: { backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, padding: spacing.md - 2, gap: spacing.sm + 2 },
  marketName: { color: colors.text, fontWeight: '800', fontSize: 15 },
});
