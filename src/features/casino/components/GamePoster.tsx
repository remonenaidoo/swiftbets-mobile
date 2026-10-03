import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatRand } from '../../../shared/lib/format';
import type { Money } from '../../../shared/lib/types';
import { games } from '../../../shared/ui/artwork';
import { colors, radius } from '../../../shared/ui/theme';

export interface PosterGame {
  key: string;
  name: string;
  tag?: 'NEW' | 'EXCLUSIVE' | null;
  imageUrl?: string | null;
}

interface Actions {
  minBet?: Money;
  onPlay?: () => void;
  onDemo?: () => void;
  favourite?: boolean;
  onFavourite?: () => void;
}

/**
 * A portrait game cover with its tag. Playable games show their minimum bet, a Play button (real money) and, when
 * the provider offers one, a Demo button (free play); signed-in players can mark favourites. The rest say coming soon.
 */
export function GamePoster({ game, width = 120, minBet, onPlay, onDemo, favourite, onFavourite }: { game: PosterGame; width?: number } & Actions) {
  const local = games[game.key as keyof typeof games];
  const source = game.imageUrl ? { uri: game.imageUrl } : local;
  const playable = onPlay !== undefined;
  return (
    <View style={{ width }} accessibilityLabel={playable || minBet ? undefined : `${game.name}, coming soon`}>
      <View style={[styles.art, { height: width * 1.33 }]}>
        {source ? <Image source={source} style={styles.image} resizeMode="cover" accessibilityLabel={game.name} /> : <Text style={styles.fallback}>{game.name}</Text>}
        {game.tag ? <Text style={[styles.tag, game.tag === 'NEW' && styles.tagNew]}>{game.tag}</Text> : null}
        {onFavourite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favourite ? `Remove ${game.name} from favourites` : `Add ${game.name} to favourites`}
            aria-pressed={favourite}
            onPress={onFavourite}
            hitSlop={8}
            style={styles.heart}
          >
            <Text style={[styles.heartText, favourite && styles.heartOn]}>{favourite ? '♥' : '♡'}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {game.name}
      </Text>
      <Text style={styles.status}>{minBet ? `From ${formatRand(minBet.minorUnits, minBet.currency)}` : 'Coming soon'}</Text>
      {playable ? (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Play ${game.name}`} onPress={onPlay} style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.play, hovered && styles.hover]}>
            <Text style={styles.playText}>Play</Text>
          </Pressable>
          {onDemo ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Play ${game.name} free`} onPress={onDemo} style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.demo, hovered && styles.hover]}>
              <Text style={styles.demoText}>Demo</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  art: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.card, justifyContent: 'flex-end' },
  image: { width: '100%', height: '100%' },
  fallback: { color: colors.text, fontWeight: '900', padding: 8 },
  hover: { opacity: 0.85 },
  tag: { position: 'absolute', top: 7, left: 7, fontSize: 9, fontWeight: '900', color: '#ffffff', backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden' },
  tagNew: { backgroundColor: colors.positive, color: colors.onPositive },
  heart: { position: 'absolute', top: 5, right: 5, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  heartText: { color: '#ffffff', fontSize: 17, lineHeight: 20 },
  heartOn: { color: colors.negative },
  name: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 5 },
  status: { color: colors.textMuted, fontSize: 11, marginTop: 1, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 6, marginTop: 6 },
  play: { flex: 1, minHeight: 32, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  playText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  demo: { flex: 1, minHeight: 32, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  demoText: { color: colors.text, fontWeight: '700', fontSize: 12 },
});
