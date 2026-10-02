import { router } from 'expo-router';
import Head from 'expo-router/head';
import { useAtomValue } from 'jotai';
import { createElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { launchedGameAtom } from '../../src/features/casino/state/launch';
import { colors, radius, spacing } from '../../src/shared/ui/theme';

/** Web: the game page the lobby just launched, in a sandboxed frame under a slim bar back to the lobby. */
export default function PlayRoute() {
  // Only a session this tab launched from the lobby is shown; nothing from the address bar is ever framed.
  const launched = useAtomValue(launchedGameAtom);
  const safe = launched && /^https?:\/\//.test(launched.url) ? launched.url : null;
  const name = launched?.name;
  return (
    <View style={styles.page}>
      <Head>
        <title>{name ?? 'Game'} · SwiftBets</title>
      </Head>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/casino')} style={styles.back}>
          <Text style={styles.backText}>‹ Lobby</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
      </View>
      {safe ? (
        createElement('iframe', { src: safe, title: name ?? 'Game', style: { flex: 1, width: '100%', height: '100%', border: 0, background: colors.surface }, allow: 'fullscreen', sandbox: 'allow-scripts allow-same-origin allow-forms', referrerPolicy: 'no-referrer' })
      ) : (
        <Text style={styles.missing}>This game session is no longer valid. Go back to the lobby and press Play again.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.surface },
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: colors.text, fontWeight: '800' },
  title: { color: colors.text, fontWeight: '800', fontSize: 16, flex: 1 },
  missing: { color: colors.textMuted, padding: spacing.lg },
});
