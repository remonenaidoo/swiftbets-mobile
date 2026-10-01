import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import type { Fixture } from '../../../shared/lib/types';
import { useDeltas } from '../../../shared/realtime/useLive';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { GetTheApp } from '../../../shared/ui/GetTheApp';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, spacing } from '../../../shared/ui/theme';
import { applyFixture, slipAtom } from '../../betslip/state/betslip';
import { useFixtures } from '../api/fixtures';
import { FixtureCard } from './FixtureCard';

export function FixturesScreen() {
  const fixtures = useFixtures();
  const setSlip = useSetAtom(slipAtom);
  const wide = useIsWide();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Prices on the slip follow the market too, so a moved price is caught before the bet goes in.
  useDeltas(['fixture-changed'], (delta) => setSlip((slip) => applyFixture(slip, delta.payload as Fixture)));

  if (fixtures.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (fixtures.isError) {
    return <EmptyState title="Could not load matches" message="Check your connection and try again." />;
  }

  const open = fixtures.data.filter((f) => f.status === 'scheduled');
  if (open.length === 0) {
    return <EmptyState title="No matches open" message="New fixtures open for betting every few minutes." />;
  }

  return (
    <FlatList
      data={open}
      keyExtractor={(f) => f.fixtureId}
      key={wide ? 'wide' : 'narrow'}
      extraData={now}
      numColumns={wide ? 2 : 1}
      columnWrapperStyle={wide ? styles.row : undefined}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            Football
          </Text>
          <Text style={styles.subtitle}>Live prices · tap a price to add it to your betslip</Text>
          {wide ? null : (
            <View style={styles.app}>
              <GetTheApp />
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={wide ? styles.half : undefined}>
          <FixtureCard fixture={item} now={now} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, gap: spacing.md, paddingBottom: 120 },
  row: { gap: spacing.md },
  half: { flex: 1 },
  heading: { marginBottom: spacing.xs },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  app: { flexDirection: 'row', marginTop: spacing.sm },
});
