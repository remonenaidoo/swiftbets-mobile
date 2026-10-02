import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Icon } from '../../../shared/ui/Icon';
import { useIsWide } from '../../../shared/ui/Layout';
import { Section } from '../../../shared/ui/Section';
import { CategoryBar } from '../../../shared/ui/shell/CategoryBar';
import { homeCategories } from '../../../shared/ui/shell/nav';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { comingSoonGames } from '../../casino/games';
import { GamePoster } from '../../casino/components/GamePoster';
import { useSports } from '../../catalog/api/catalog';
import { useFixtures } from '../../fixtures/api/fixtures';
import { FixtureCard } from '../../fixtures/components/FixtureCard';
import { PromoCarousel } from './PromoCarousel';

function useMinute() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export function HomeScreen() {
  const wide = useIsWide();
  const now = useMinute();
  const fixtures = useFixtures();
  const upcoming = useSports().data?.find((s) => s.sportId === 'soccer')?.competitions.reduce((n, c) => n + c.upcomingFixtures, 0);
  const next = (fixtures.data ?? []).filter((f) => f.status === 'scheduled').slice(0, wide ? 4 : 3);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {wide ? null : <CategoryBar items={homeCategories} />}
      <View style={styles.inner}>
        <PromoCarousel />

        <View style={styles.split}>
          <Link href="/sports/soccer" asChild>
            <Pressable accessibilityRole="link" style={styles.big}>
              <Icon name="nav/sports" size={44} />
              <Text style={styles.bigTitle}>Sports</Text>
              <Text style={styles.bigMeta}>
                <Text style={styles.dot}>● </Text>
                {upcoming ?? '…'} open
              </Text>
            </Pressable>
          </Link>
          <Link href="/casino" asChild>
            <Pressable accessibilityRole="link" style={styles.big}>
              <Icon name="nav/casino" size={44} />
              <Text style={styles.bigTitle}>Casino</Text>
              <Text style={styles.bigMeta}>Coming soon</Text>
            </Pressable>
          </Link>
        </View>

        <Section title="Next up" icon="sports/football" href="/sports/soccer" more="All football">
          {fixtures.isPending ? <ActivityIndicator color={colors.accent} /> : null}
          {fixtures.isError ? <EmptyState title="Matches could not load" message="Check your connection and try again." /> : null}
          {fixtures.isSuccess && next.length === 0 ? <Text style={styles.muted}>New fixtures open for betting every few minutes.</Text> : null}
          <View style={styles.cards}>
            {next.map((f) => (
              <View key={f.fixtureId} style={wide ? styles.cardWide : styles.cardNarrow}>
                <FixtureCard fixture={f} now={now} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Casino" icon="casino/slots" href="/casino" more="Lobby">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {comingSoonGames.slice(0, 8).map((g) => (
              <GamePoster key={g.key} game={g} width={wide ? 150 : 118} />
            ))}
          </ScrollView>
        </Section>

        <Text style={styles.legal}>
          SwiftBets is a demonstration platform: no real money is wagered. 18+ only. Gambling can be addictive; play responsibly. Help: South African Responsible Gambling Foundation 0800 006 008.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: 40 },
  inner: { padding: spacing.md, gap: spacing.lg, width: '100%', alignSelf: 'center' },
  split: { flexDirection: 'row', gap: spacing.sm + 2 },
  big: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md + 2, padding: spacing.md, gap: 4 },
  bigTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  bigMeta: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  dot: { color: colors.positive },
  muted: { color: colors.textMuted },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md - 4 },
  cardWide: { width: '49.2%' },
  cardNarrow: { width: '100%' },
  rail: { gap: spacing.sm + 2 },
  legal: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: spacing.md },
});
