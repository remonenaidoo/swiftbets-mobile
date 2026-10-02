import { Image, StyleSheet, Text, View } from 'react-native';
import { games } from '../../../shared/ui/artwork';
import { colors, radius } from '../../../shared/ui/theme';
import type { GameCard } from '../games';

/** A portrait game cover with its tag; the line underneath says it is not playable yet. */
export function GamePoster({ game, width = 120 }: { game: GameCard; width?: number }) {
  return (
    <View style={{ width }} accessibilityLabel={`${game.name}, coming soon`}>
      <View style={[styles.art, { height: width * 1.33 }]}>
        <Image source={games[game.key as keyof typeof games]} style={styles.image} resizeMode="cover" accessibilityLabel={game.name} />
        {game.tag ? <Text style={[styles.tag, game.tag === 'NEW' && styles.tagNew]}>{game.tag}</Text> : null}
      </View>
      <Text style={styles.status}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.card },
  image: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 7, left: 7, fontSize: 9, fontWeight: '900', color: '#ffffff', backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden' },
  tagNew: { backgroundColor: colors.positive, color: colors.onPositive },
  status: { color: colors.textMuted, fontSize: 11, marginTop: 5, fontWeight: '600' },
});
