import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GetTheApp } from '../../../shared/ui/GetTheApp';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, maxContentWidth, radius, spacing } from '../../../shared/ui/theme';
import { useFixtures } from '../../fixtures/api/fixtures';
import { FixtureCard } from '../../fixtures/components/FixtureCard';
import { casinoTiles, sportTiles } from '../tiles';
import { TileGrid } from './TileGrid';

export function HomeScreen() {
  const wide = useIsWide();
  const fixtures = useFixtures();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const next = (fixtures.data ?? []).filter((f) => f.status === 'scheduled').slice(0, wide ? 6 : 4);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Premier League · live prices</Text>
        <Text style={styles.headline} accessibilityRole="header">
          Every match. Every price. Updated live.
        </Text>
        <Text style={styles.lede}>Build a single or an accumulator, watch the odds move in real time, and cash out before the final whistle.</Text>
        <View style={styles.heroActions}>
          <Link href="/sports/soccer" asChild>
            <Pressable accessibilityRole="link" style={styles.cta}>
              <Text style={styles.ctaText}>Bet on football</Text>
            </Pressable>
          </Link>
          {wide ? null : <GetTheApp />}
        </View>
      </View>

      <TileGrid title="Sports" tiles={sportTiles} />

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Next up
          </Text>
          <Link href="/sports/soccer" style={styles.more}>
            All football
          </Link>
        </View>
        {fixtures.isPending ? <ActivityIndicator color={colors.accent} /> : null}
        {fixtures.isError ? <Text style={styles.muted}>Matches could not load. Check your connection.</Text> : null}
        {fixtures.isSuccess && next.length === 0 ? <Text style={styles.muted}>New fixtures open for betting every few minutes.</Text> : null}
        <View style={styles.cards}>
          {next.map((f) => (
            <View key={f.fixtureId} style={wide ? styles.cardWide : styles.cardNarrow}>
              <FixtureCard fixture={f} now={now} />
            </View>
          ))}
        </View>
      </View>

      <TileGrid title="Casino" tiles={casinoTiles} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.lg, paddingBottom: 140, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  hero: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, backgroundColor: '#10244a', borderWidth: 1, borderColor: '#1e3a8a' },
  kicker: { color: '#93c5fd', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headline: { color: '#ffffff', fontSize: 28, fontWeight: '800', lineHeight: 34 },
  lede: { color: colors.text, opacity: 0.85, fontSize: 15, lineHeight: 22, maxWidth: 560 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
  cta: { backgroundColor: colors.accentStrong, paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.md },
  ctaText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  pressed: { opacity: 0.85 },
  section: { gap: spacing.sm },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  more: { color: colors.accent, fontWeight: '600' },
  muted: { color: colors.textMuted },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cardWide: { width: '48.8%' },
  cardNarrow: { width: '100%' },
});
