import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { api } from '../../../shared/lib/session';
import type { Fixture } from '../../../shared/lib/types';
import { useDeltas } from '../../../shared/realtime/useLive';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { colors, spacing } from '../../../shared/ui/theme';
import { applyFixture, slipAtom } from '../../betslip/state/betslip';
import { FixtureCard } from './FixtureCard';

/** One fixture with every market, kept live: each fixture-changed delta for it replaces the snapshot if newer. */
export function FixtureScreen({ fixtureId }: { fixtureId: string }) {
  const queryClient = useQueryClient();
  const setSlip = useSetAtom(slipAtom);
  const key = ['fixture', fixtureId];
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
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
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Link href="/sports/soccer" style={styles.back}>
        ← {f.competition}
      </Link>
      <Text style={styles.title} accessibilityRole="header">
        {f.homeTeam} v {f.awayTeam}
      </Text>
      <Text style={styles.meta}>
        {live ? 'In play' : f.status === 'scheduled' ? `Kick-off ${new Date(f.kickoffAt).toLocaleString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}` : 'Finished'}
      </Text>
      <FixtureCard fixture={f} now={now} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { padding: spacing.md, gap: spacing.sm, paddingBottom: 140, width: '100%', maxWidth: 820, alignSelf: 'center' },
  back: { color: colors.accent, fontWeight: '600' },
  title: { color: '#ffffff', fontSize: 26, fontWeight: '800' },
  meta: { color: colors.textMuted, marginBottom: spacing.sm },
});
