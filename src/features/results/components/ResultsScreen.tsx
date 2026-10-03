import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { FixtureResult } from '../../../shared/lib/types';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Icon } from '../../../shared/ui/Icon';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { useSports } from '../../catalog/api/catalog';
import { Crest } from '../../fixtures/components/FixtureCard';
import { groupByDay, resultLabel, useResults } from '../api/results';

/** Finished matches of the last three days, grouped by day, filterable by competition. */
export function ResultsScreen({ sportId }: { sportId: string }) {
  const wide = useIsWide();
  const competition = useLocalSearchParams<{ competition?: string }>().competition || undefined;
  const sport = useSports().data?.find((s) => s.sportId === sportId);
  const results = useResults(sportId, competition);
  const days = groupByDay(results.data ?? []);
  const setCompetition = (id?: string) => router.setParams({ competition: id ?? '' } as never);
  const chips = [{ id: undefined as string | undefined, name: 'All' }, ...(sport?.competitions ?? []).map((c) => ({ id: c.competitionId, name: c.name }))];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.titleRow}>
        <Icon name="sports/football" size={34} />
        <Text style={styles.title} accessibilityRole="header">
          Results
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} role="tablist">
        {chips.map((c) => {
          const on = c.id === competition;
          return (
            <Pressable key={c.id ?? 'all'} role="tab" aria-selected={on} onPress={() => setCompetition(c.id)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {results.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {results.isError ? (
        <View style={styles.error}>
          <EmptyState title="Results could not load" message="Check your connection and try again." />
          <Pressable accessibilityRole="button" onPress={() => void results.refetch()} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {results.isSuccess && days.length === 0 ? <EmptyState title="No results yet" message="Finished matches from the last three days show here." /> : null}

      {days.map((day) => (
        <View key={day.key} style={styles.group}>
          <Text style={styles.day}>{day.label}</Text>
          <View style={[styles.cards, wide && styles.cardsWide]}>
            {day.results.map((r) => (
              <View key={r.fixtureId} style={wide ? styles.cardWide : undefined}>
                <ResultCard result={r} showCompetition={!competition} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function ResultCard({ result, showCompetition }: { result: FixtureResult; showCompetition: boolean }) {
  const isVoid = result.status === 'void';
  const scored = result.homeGoals !== null && result.awayGoals !== null;
  const homeWon = scored && !isVoid && result.homeGoals! > result.awayGoals!;
  const awayWon = scored && !isVoid && result.awayGoals! > result.homeGoals!;
  const time = new Date(result.kickoffAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <View style={styles.card} accessibilityLabel={`${result.homeTeam} ${result.homeGoals ?? ''} ${result.awayTeam} ${result.awayGoals ?? ''}, ${resultLabel(result.status)}`}>
      <View style={styles.cardHead}>
        <Text style={styles.meta} numberOfLines={1}>
          {showCompetition ? `${result.competitionName} · ${time}` : time}
        </Text>
        <Text style={[styles.badge, isVoid && styles.badgeVoid]}>{resultLabel(result.status)}</Text>
      </View>
      {[
        { team: result.homeTeam, goals: result.homeGoals, won: homeWon },
        { team: result.awayTeam, goals: result.awayGoals, won: awayWon },
      ].map((side) => (
        <View key={side.team} style={styles.side}>
          <Crest name={side.team} />
          <Text style={[styles.team, side.won && styles.winner]} numberOfLines={1}>
            {side.team}
          </Text>
          <Text style={[styles.goals, side.won && styles.winner, isVoid && styles.voided]}>{side.goals ?? '-'}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  chips: { gap: spacing.xs + 2 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.cardHigh },
  chipText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  chipTextOn: { color: colors.text },
  error: { alignItems: 'center', gap: spacing.sm },
  retry: { backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 18 },
  retryText: { color: colors.text, fontWeight: '700' },
  group: { backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, padding: spacing.sm + 2, gap: spacing.sm + 2 },
  day: { color: colors.text, fontWeight: '800', fontSize: 15, paddingHorizontal: 4 },
  cards: { gap: spacing.sm + 2 },
  cardsWide: { flexDirection: 'row', flexWrap: 'wrap' },
  cardWide: { width: '48.5%' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm + 4, gap: spacing.sm },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  meta: { color: colors.textMuted, fontSize: 12, flexShrink: 1 },
  badge: { color: colors.textMuted, fontSize: 11, fontWeight: '800', backgroundColor: colors.cardHigh, borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: 8, overflow: 'hidden' },
  badgeVoid: { color: colors.warning },
  side: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  team: { color: colors.textMuted, fontSize: 14, fontWeight: '700', flex: 1 },
  goals: { color: colors.textMuted, fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'], minWidth: 20, textAlign: 'right' },
  winner: { color: colors.text },
  voided: { textDecorationLine: 'line-through' },
});
