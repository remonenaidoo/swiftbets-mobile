import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import type { GameCard } from '../games';

/** A portrait game card: artwork (a gradient until it arrives), a tag, the name, and its status underneath. */
export function GamePoster({ game, width = 120 }: { game: GameCard; width?: number }) {
  return (
    <View style={{ width }} accessibilityLabel={`${game.name}, coming soon`}>
      <View style={[styles.art, { height: width * 1.33, backgroundColor: game.tint[1], experimental_backgroundImage: `linear-gradient(160deg, ${game.tint[0]}, ${game.tint[1]})` } as never]}>
        {game.tag ? <Text style={[styles.tag, game.tag === 'NEW' && styles.tagNew]}>{game.tag}</Text> : null}
        <Text style={styles.name} numberOfLines={2}>
          {game.name}
        </Text>
      </View>
      <Text style={styles.status}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: radius.md, padding: spacing.sm, justifyContent: 'flex-end', overflow: 'hidden' },
  tag: { position: 'absolute', top: 7, left: 7, fontSize: 9, fontWeight: '900', color: '#ffffff', backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden' },
  tagNew: { backgroundColor: colors.positive, color: colors.onPositive },
  name: { color: '#ffffff', fontWeight: '900', fontSize: 15, lineHeight: 17, textShadowColor: '#00000088', textShadowRadius: 6 },
  status: { color: colors.textMuted, fontSize: 11, marginTop: 5, fontWeight: '600' },
});
