import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiError } from '../../../shared/lib/apiError';
import { isWeb } from '../../../shared/lib/config';
import { useSession } from '../../../shared/lib/useSession';
import type { IconName } from '../../../shared/ui/artwork';
import { Icon } from '../../../shared/ui/Icon';
import { useIsWide } from '../../../shared/ui/Layout';
import { Section } from '../../../shared/ui/Section';
import { colors, radius, spacing } from '../../../shared/ui/theme';
import { launchRefusal, pickGames, searchGames, useDemo, useFavourites, useLaunch, useLobby, useRecent, useToggleFavourite, type LobbyGame } from '../api/casino';
import { comingSoonGames } from '../games';
import { launchedGameAtom } from '../state/launch';
import { GamePoster } from './GamePoster';

const icons: Record<string, IconName> = { all: 'casino/star', favourites: 'casino/vip', recent: 'casino/quick', slots: 'casino/slots', live: 'casino/live-dealer', crash: 'casino/crash', table: 'casino/roulette', other: 'casino/dice' };
const fallbackShelves = [
  { key: 'slots', label: 'Slots' },
  { key: 'live', label: 'Live casino' },
  { key: 'crash', label: 'Crash' },
];

/** The lobby from the casino catalogue: search, categories, favourites and recently played; Play is real money, Demo is free. */
export function CasinoScreen() {
  const wide = useIsWide();
  const signedIn = useSession().data?.signedIn === true;
  const lobby = useLobby();
  const recent = useRecent(signedIn);
  const favourites = useFavourites(signedIn);
  const toggle = useToggleFavourite();
  const launch = useLaunch();
  const demo = useDemo();
  const setLaunched = useSetAtom(launchedGameAtom);
  const [shelf, setShelf] = useState('all');
  const [query, setQuery] = useState('');
  const width = wide ? 160 : 118;
  const favouriteIds = useMemo(() => new Set(favourites.data ?? []), [favourites.data]);

  const open = (url: string, name: string) => {
    if (isWeb) {
      setLaunched({ url, name });
      router.push('/casino/play');
    } else {
      void WebBrowser.openBrowserAsync(url);
    }
  };
  const play = (game: LobbyGame) => {
    if (!signedIn) {
      router.push('/account/sign-in');
      return;
    }
    demo.reset();
    launch.mutate({ gameId: game.gameId, providerId: game.providerId }, { onSuccess: (session) => open(session.launchUrl, game.name) });
  };
  const playDemo = (game: LobbyGame) => {
    launch.reset();
    demo.mutate({ gameId: game.gameId, providerId: game.providerId }, { onSuccess: (session) => open(session.launchUrl, `${game.name} (demo)`) });
  };
  const poster = (g: LobbyGame) => (
    <GamePoster
      key={g.gameId}
      game={{ key: g.gameId, name: g.name, tag: g.tag, imageUrl: g.imageUrl }}
      width={width}
      minBet={g.minBet}
      onPlay={() => play(g)}
      onDemo={g.demoAvailable ? () => playDemo(g) : undefined}
      favourite={favouriteIds.has(g.gameId)}
      onFavourite={signedIn ? () => toggle.mutate({ gameId: g.gameId, favourite: !favouriteIds.has(g.gameId) }) : undefined}
    />
  );

  const categories = lobby.data?.categories ?? [];
  const recentGames = pickGames(lobby.data, (recent.data ?? []).map((r) => r.gameId));
  const favouriteGames = pickGames(lobby.data, favourites.data ?? []);
  const found = searchGames(lobby.data, query);
  const tabs = [
    { key: 'all', label: 'Lobby' },
    ...(signedIn ? [{ key: 'favourites', label: 'Favourites' }, { key: 'recent', label: 'Recent' }] : []),
    ...(lobby.isSuccess ? categories.map((c) => ({ key: c.key, label: c.name })) : fallbackShelves),
  ];
  const failure = launch.error ?? demo.error;
  const refusal = failure instanceof ApiError ? launchRefusal(failure.code) : failure ? launchRefusal(undefined) : null;
  const grid = (list: LobbyGame[], empty: string) => (list.length === 0 ? <Text style={styles.muted}>{empty}</Text> : <View style={styles.grid}>{list.map(poster)}</View>);

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {lobby.isSuccess ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search games"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search games"
          returnKeyType="search"
          autoCorrect={false}
          style={styles.search}
        />
      ) : null}
      <View style={styles.bar} role="tablist">
        {tabs.map((s) => (
          <Pressable key={s.key} role="tab" aria-selected={shelf === s.key} onPress={() => setShelf(s.key)} style={[styles.cat, shelf === s.key && styles.catOn]}>
            <Icon name={icons[s.key] ?? 'casino/star'} size={34} />
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
      {launch.isPending || demo.isPending || lobby.isPending ? <ActivityIndicator color={colors.accent} /> : null}

      {lobby.isSuccess && query.trim() ? (
        <Section title={`Results for "${query.trim()}"`} icon="casino/star">
          {grid(found, 'No games match that search.')}
        </Section>
      ) : null}

      {lobby.isSuccess && !query.trim() && shelf === 'favourites' ? (
        <Section title="Favourites" icon="casino/vip">
          {grid(favouriteGames, 'Tap the heart on any game to keep it here.')}
        </Section>
      ) : null}

      {lobby.isSuccess && !query.trim() && shelf === 'recent' ? (
        <Section title="Recently played" icon="casino/quick">
          {grid(recentGames, 'Games you open show up here.')}
        </Section>
      ) : null}

      {lobby.isSuccess && !query.trim() && shelf === 'all' && recentGames.length > 0 ? (
        <Section title="Recently played" icon="casino/quick">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {recentGames.slice(0, 10).map(poster)}
          </ScrollView>
        </Section>
      ) : null}

      {lobby.isSuccess && !query.trim() && shelf !== 'favourites' && shelf !== 'recent'
        ? categories
            .filter((c) => shelf === 'all' || c.key === shelf)
            .map((c) =>
              shelf === 'all' ? (
                <Section key={c.key} title={c.name} icon={icons[c.key]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                    {c.games.map(poster)}
                  </ScrollView>
                </Section>
              ) : (
                <Section key={c.key} title={c.name} icon={icons[c.key]}>
                  {grid(c.games, 'No games here yet.')}
                </Section>
              ),
            )
        : null}

      {lobby.isError ? (
        <>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>The casino opens soon</Text>
            <Text style={styles.noticeBody}>Slots, live tables and crash games are being connected. Sports betting is live now.</Text>
          </View>
          {fallbackShelves
            .filter((s) => shelf === 'all' || s.key === shelf)
            .map((s) => (
              <Section key={s.key} title={s.label} icon={icons[s.key]}>
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
  search: { backgroundColor: colors.card, color: colors.text, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 15 },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm + 2 },
  muted: { color: colors.textMuted, fontSize: 13 },
});
