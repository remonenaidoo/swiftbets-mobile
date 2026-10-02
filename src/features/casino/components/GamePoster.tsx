import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatRand } from '../../../shared/lib/format';
import type { Money } from '../../../shared/lib/types';
import { games } from '../../../shared/ui/artwork';
import { colors, radius } from '../../../shared/ui/theme';

export interface PosterGame {
  key: string;
  name: string;
  tag?: 'NEW' | 'EXCLUSIVE' | null;
}

/** A portrait game cover with its tag; playable games show their minimum bet, the rest say coming soon. */
export function GamePoster({ game, width = 120, minBet, onPlay }: { game: PosterGame; width?: number; minBet?: Money; onPlay?: () => void }) {
  const source = games[game.key as keyof typeof games];
  const body = (
    <>
      <View style={[styles.art, { height: width * 1.33 }]}>
        {source ? <Image source={source} style={styles.image} resizeMode="cover" accessibilityLabel={game.name} /> : <Text style={styles.fallback}>{game.name}</Text>}
        {game.tag ? <Text style={[styles.tag, game.tag === 'NEW' && styles.tagNew]}>{game.tag}</Text> : null}
      </View>
      <Text style={styles.status}>{minBet ? `From ${formatRand(minBet.minorUnits, minBet.currency)}` : 'Coming soon'}</Text>
    </>
  );
  return onPlay ? (
    <Pressable accessibilityRole="button" accessibilityLabel={`Play ${game.name}`} onPress={onPlay} style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [{ width }, hovered && styles.hover]}>
      {body}
    </Pressable>
  ) : (
    <View style={{ width }} accessibilityLabel={`${game.name}, coming soon`}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.card, justifyContent: 'flex-end' },
  image: { width: '100%', height: '100%' },
  fallback: { color: colors.text, fontWeight: '900', padding: 8 },
  hover: { transform: [{ translateY: -3 }] },
  tag: { position: 'absolute', top: 7, left: 7, fontSize: 9, fontWeight: '900', color: '#ffffff', backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden' },
  tagNew: { backgroundColor: colors.positive, color: colors.onPositive },
  status: { color: colors.textMuted, fontSize: 11, marginTop: 5, fontWeight: '600' },
});
