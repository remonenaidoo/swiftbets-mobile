import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Icon } from '../../../shared/ui/Icon';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { useSports } from '../../catalog/api/catalog';
import { useFixtures } from '../../fixtures/api/fixtures';
import { Crest, FixtureCard } from '../../fixtures/components/FixtureCard';

type When = 'all' | 'soon' | 'later';
const whenTabs: { key: When; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'soon', label: 'Next hour' },
  { key: 'later', label: 'Later' },
];

/** One sport: when-tabs, competitions as tiles, then open fixtures grouped by competition. */
export function SportScreen({ sportId }: { sportId: string }) {
  const wide = useIsWide();
  const params = useLocalSearchParams<{ competition?: string }>();
  const competition = params.competition;
  const sports = useSports();
  const fixtures = useFixtures();
  const [when, setWhen] = useState<When>('all');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const sport = sports.data?.find((s) => s.sportId === sportId);
  if (sports.isSuccess && !sport) {
    return <EmptyState title="Coming soon" message="This sport is not on offer yet. Football is live now." />;
  }

  const open = (fixtures.data ?? []).filter((f) => {
    if (f.status !== 'scheduled' || (competition && f.competition !== competition)) return false;
    const minutes = (new Date(f.kickoffAt).getTime() - now) / 60_000;
    return when === 'all' || (when === 'soon' ? minutes <= 60 : minutes > 60);
  });
  const groups = [...new Set(open.map((f) => f.competition))];
  const setCompetition = (name?: string) => router.setParams({ competition: name ?? '' } as never);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.titleRow}>
        <View style={styles.titleLead}>
          <Icon name="sports/football" size={34} />
          <Text style={styles.title} accessibilityRole="header">
            {competition || 'Football'}
          </Text>
        </View>
        {competition ? (
          <Pressable accessibilityRole="button" onPress={() => setCompetition(undefined)} style={styles.clear}>
            <Text style={styles.clearText}>All competitions ✕</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabs} role="tablist">
        {whenTabs.map((t) => (
          <Pressable key={t.key} role="tab" aria-selected={when === t.key} onPress={() => setWhen(t.key)} style={[styles.tab, when === t.key && styles.tabOn]}>
            <Text style={[styles.tabText, when === t.key && styles.tabTextOn]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {sport && !competition ? (
        <>
          <Text style={styles.heading}>Competitions</Text>
          <View style={styles.leagues}>
            {sport.competitions.map((c) => (
              <Pressable key={c.competitionId} accessibilityRole="button" onPress={() => setCompetition(c.name)} style={[styles.league, { width: wide ? '32.3%' : '48.5%' }]}>
                <Crest name={c.name} />
                <Text style={styles.leagueName} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={styles.leagueCount}>{c.upcomingFixtures}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {fixtures.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {fixtures.isError ? <EmptyState title="Matches could not load" message="Check your connection and try again." /> : null}
      {fixtures.isSuccess && open.length === 0 ? <EmptyState title="No matches here right now" message="New fixtures open for betting every few minutes." /> : null}

      {groups.map((name) => {
        const isCollapsed = collapsed[name] === true;
        return (
          <View key={name} style={styles.group}>
            <Pressable accessibilityRole="button" aria-expanded={!isCollapsed} onPress={() => setCollapsed((c) => ({ ...c, [name]: !isCollapsed }))} style={styles.groupHead}>
              <Crest name={name} />
              <Text style={styles.groupName}>{name}</Text>
              <Text style={styles.chevron}>{isCollapsed ? '⌄' : '⌃'}</Text>
            </Pressable>
            {isCollapsed ? null : (
              <View style={[styles.cards, wide && styles.cardsWide]}>
                {open
                  .filter((f) => f.competition === name)
                  .map((f) => (
                    <View key={f.fixtureId} style={wide ? styles.cardWide : undefined}>
                      <FixtureCard fixture={f} now={now} showCompetition={false} />
                    </View>
                  ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  titleLead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', flexShrink: 1 },
  clear: { backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  clearText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: spacing.xs + 2 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.card },
  tabOn: { backgroundColor: colors.cardHigh },
  tabText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  tabTextOn: { color: colors.text },
  heading: { color: colors.text, fontSize: 16, fontWeight: '800' },
  leagues: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  league: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 12 },
  leagueName: { color: colors.text, fontWeight: '700', fontSize: 13, flex: 1 },
  leagueCount: { color: colors.textMuted, fontSize: 12, fontVariant: ['tabular-nums'] },
  group: { backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, padding: spacing.sm + 2, gap: spacing.sm + 2 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 4, paddingVertical: 4 },
  groupName: { color: colors.text, fontWeight: '800', fontSize: 15, flex: 1 },
  chevron: { color: colors.textMuted, fontSize: 18 },
  cards: { gap: spacing.sm + 2 },
  cardsWide: { flexDirection: 'row', flexWrap: 'wrap' },
  cardWide: { width: '49.3%' },
});
