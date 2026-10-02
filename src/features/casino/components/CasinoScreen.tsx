import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsWide } from '../../../shared/ui/Layout';
import { Section } from '../../../shared/ui/Section';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { comingSoonGames, type GameCard } from '../games';
import { GamePoster } from './GamePoster';

const shelves: { key: GameCard['category'] | 'all'; label: string; glyph: string }[] = [
  { key: 'all', label: 'Lobby', glyph: '⭐' },
  { key: 'slots', label: 'Slots', glyph: '🎰' },
  { key: 'live', label: 'Live casino', glyph: '🃏' },
  { key: 'crash', label: 'Crash', glyph: '🚀' },
];

/** The casino lobby's shape; games arrive with the casino service, so the shelves say so. */
export function CasinoScreen() {
  const wide = useIsWide();
  const [shelf, setShelf] = useState<(typeof shelves)[number]['key']>('all');
  const width = wide ? 160 : 118;
  const groups = shelves.filter((s) => s.key !== 'all' && (shelf === 'all' || s.key === shelf));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.bar} role="tablist">
        {shelves.map((s) => (
          <Pressable key={s.key} role="tab" aria-selected={shelf === s.key} onPress={() => setShelf(s.key)} style={[styles.cat, shelf === s.key && styles.catOn]}>
            <Text style={styles.glyph} aria-hidden>
              {s.glyph}
            </Text>
            <Text style={[styles.catText, shelf === s.key && styles.catTextOn]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>The casino opens soon</Text>
        <Text style={styles.noticeBody}>Slots, live tables and crash games are being connected. Sports betting is live now.</Text>
      </View>
      {groups.map((g) => (
        <Section key={g.key} title={g.label} glyph={g.glyph}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {comingSoonGames
              .filter((game) => game.category === g.key)
              .map((game) => (
                <GamePoster key={game.key} game={game} width={width} />
              ))}
          </ScrollView>
        </Section>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.lg, paddingBottom: 40 },
  bar: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  cat: { minWidth: 76, alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md, backgroundColor: colors.card },
  catOn: { backgroundColor: colors.accent },
  glyph: { fontSize: 20, marginBottom: 3 },
  catText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  catTextOn: { color: '#ffffff' },
  notice: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: 4, borderLeftWidth: 4, borderLeftColor: colors.gold },
  noticeTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  noticeBody: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  rail: { gap: spacing.sm + 2 },
});
