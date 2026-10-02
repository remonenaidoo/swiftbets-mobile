import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsWide } from '../../../shared/ui/Layout';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import type { Tile } from '../tiles';

function TileCard({ tile, pressed = false }: { tile: Tile; pressed?: boolean }) {
  return (
    <View style={[styles.tile, { backgroundColor: tile.tint }, !tile.href && styles.soon, pressed && styles.pressed]}>
      <Text style={styles.glyph} aria-hidden>
        {tile.glyph}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {tile.label}
      </Text>
      <Text style={[styles.caption, tile.href ? styles.captionLive : null]} numberOfLines={1}>
        {tile.caption}
      </Text>
    </View>
  );
}

export function TileGrid({ title, tiles }: { title: string; tiles: Tile[] }) {
  const cell = useIsWide() ? styles.cellWide : styles.cellNarrow;
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.grid}>
        {tiles.map((tile) =>
          tile.href ? (
            <Link key={tile.key} href={tile.href as never} asChild>
              <Pressable accessibilityRole="link" accessibilityLabel={`${tile.label}: ${tile.caption}`} style={cell}>
                {({ pressed }) => <TileCard tile={tile} pressed={pressed} />}
              </Pressable>
            </Link>
          ) : (
            <View key={tile.key} accessibilityLabel={`${tile.label}: ${tile.caption}`} style={cell}>
              <TileCard tile={tile} />
            </View>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cellWide: { width: '15.5%' },
  cellNarrow: { width: '31.5%' },
  tile: { aspectRatio: 1, borderRadius: radius.lg, padding: spacing.sm, justifyContent: 'flex-end', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  soon: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
  glyph: { fontSize: 30, position: 'absolute', top: spacing.sm, right: spacing.sm },
  label: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  caption: { color: colors.text, opacity: 0.75, fontSize: 11, marginTop: 2 },
  captionLive: { color: '#bbf7d0', opacity: 1, fontWeight: '600' },
});
