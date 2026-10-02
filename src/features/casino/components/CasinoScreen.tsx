import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { IconName } from '../../../shared/ui/artwork';
import { Icon } from '../../../shared/ui/Icon';
import { useIsWide } from '../../../shared/ui/Layout';
import { Section } from '../../../shared/ui/Section';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { comingSoonGames, type GameCard } from '../games';
import { GamePoster } from './GamePoster';

const shelves: { key: GameCard['category'] | 'all'; label: string; icon: IconName }[] = [
  { key: 'all', label: 'Lobby', icon: 'casino/star' },
  { key: 'slots', label: 'Slots', icon: 'casino/slots' },
  { key: 'live', label: 'Live casino', icon: 'casino/live-dealer' },
  { key: 'crash', label: 'Crash', icon: 'casino/crash' },
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
            <Icon name={s.icon} size={34} />
            <Text style={[styles.catText, shelf === s.key && styles.catTextOn]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>The casino opens soon</Text>
        <Text style={styles.noticeBody}>Slots, live tables and crash games are being connected. Sports betting is live now.</Text>
      </View>
      {groups.map((g) => (
        <Section key={g.key} title={g.label} icon={g.icon}>
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
  catText: { color: colors.textMuted, fontSize: 11, fontWeight: '700', marginTop: 3 },
  catTextOn: { color: '#ffffff' },
  notice: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: 4, borderLeftWidth: 4, borderLeftColor: colors.gold },
  noticeTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  noticeBody: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  rail: { gap: spacing.sm + 2 },
});
