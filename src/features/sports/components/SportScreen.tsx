import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useSports } from '../../catalog/api/catalog';
import { FixturesScreen } from '../../fixtures/components/FixturesScreen';

/** One sport: its competitions from the catalogue as filters, and the open fixtures below. */
export function SportScreen({ sportId }: { sportId: string }) {
  const sports = useSports();
  const [competition, setCompetition] = useState<string | undefined>();
  const sport = sports.data?.find((s) => s.sportId === sportId);

  if (sports.isSuccess && !sport) {
    return <EmptyState title="Coming soon" message="This sport is not on offer yet. Football is live now." />;
  }

  const name = sport?.name === 'Soccer' ? 'Football' : (sport?.name ?? 'Football');
  const filters = sport ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      <Chip label="All" active={!competition} onPress={() => setCompetition(undefined)} />
      {sport.competitions.map((c) => (
        <Chip key={c.competitionId} label={`${c.name} · ${c.upcomingFixtures}`} active={competition === c.name} onPress={() => setCompetition(c.name)} />
      ))}
    </ScrollView>
  ) : null;

  return <FixturesScreen title={competition ?? name} competition={competition} header={filters} />;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable role="button" aria-pressed={active} onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: { gap: spacing.xs, paddingVertical: spacing.sm },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.selected, borderColor: colors.accent },
  chipText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#ffffff' },
});
