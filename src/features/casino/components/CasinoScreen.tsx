import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { isWeb } from '../../../shared/lib/config';
import { useSession } from '../../../shared/lib/useSession';
import type { IconName } from '../../../shared/ui/artwork';
import { Icon } from '../../../shared/ui/Icon';
import { useIsWide } from '../../../shared/ui/Layout';
import { Section } from '../../../shared/ui/Section';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { launchRefusal, useLaunch, useLobby, type LobbyGame } from '../api/casino';
import { comingSoonGames } from '../games';
import { GamePoster } from './GamePoster';

const shelves: { key: string; label: string; icon: IconName }[] = [
  { key: 'all', label: 'Lobby', icon: 'casino/star' },
  { key: 'slots', label: 'Slots', icon: 'casino/slots' },
  { key: 'live', label: 'Live casino', icon: 'casino/live-dealer' },
  { key: 'crash', label: 'Crash', icon: 'casino/crash' },
];

/** The lobby from the casino catalogue; Play launches a signed session with the game's provider. */
export function CasinoScreen() {
  const wide = useIsWide();
  const signedIn = useSession().data?.signedIn === true;
  const lobby = useLobby();
  const launch = useLaunch();
  const [shelf, setShelf] = useState('all');
  const width = wide ? 160 : 118;

  const play = (game: LobbyGame) => {
    if (!signedIn) {
      router.push('/account/sign-in');
      return;
    }
    launch.mutate(
      { gameId: game.gameId, providerId: game.providerId },
      {
        onSuccess: (session) => {
          if (isWeb) {
            router.push({ pathname: '/casino/play', params: { url: session.launchUrl, name: game.name } });
          } else {
            void WebBrowser.openBrowserAsync(session.launchUrl);
          }
        },
      },
    );
  };

  const categories = lobby.data?.categories.filter((c) => shelf === 'all' || c.key === shelf) ?? [];
  const refusal = launch.error instanceof ApiError ? launchRefusal(launch.error.code) : launch.error ? launchRefusal(undefined) : null;

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

      {refusal ? (
        <View style={[styles.notice, styles.noticeError]} accessibilityRole="alert">
          <Text style={styles.noticeTitle}>Game not started</Text>
          <Text style={styles.noticeBody}>{refusal}</Text>
        </View>
      ) : null}
      {launch.isPending ? <ActivityIndicator color={colors.accent} /> : null}
      {lobby.isPending ? <ActivityIndicator color={colors.accent} /> : null}

      {lobby.isSuccess
        ? categories.map((c) => (
            <Section key={c.key} title={c.name} icon={shelves.find((s) => s.key === c.key)?.icon}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                {c.games.map((g) => (
                  <GamePoster key={g.gameId} game={{ key: g.gameId, name: g.name, tag: g.tag }} width={width} minBet={g.minBet} onPlay={() => play(g)} />
                ))}
              </ScrollView>
            </Section>
          ))
        : null}

      {lobby.isError ? (
        <>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>The casino opens soon</Text>
            <Text style={styles.noticeBody}>Slots, live tables and crash games are being connected. Sports betting is live now.</Text>
          </View>
          {shelves
            .filter((s) => s.key !== 'all' && (shelf === 'all' || s.key === shelf))
            .map((s) => (
              <Section key={s.key} title={s.label} icon={s.icon}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                  {comingSoonGames
                    .filter((g) => g.category === s.key)
                    .map((g) => (
                      <GamePoster key={g.key} game={g} width={width} />
                    ))}
                </ScrollView>
              </Section>
            ))}
        </>
      ) : null}
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
  noticeError: { borderLeftColor: colors.negative },
  noticeTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  noticeBody: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  rail: { gap: spacing.sm + 2 },
});
