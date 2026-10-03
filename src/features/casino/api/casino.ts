import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Money } from '../../../shared/lib/types';

export interface LobbyGame {
  gameId: string;
  name: string;
  providerId: string;
  category: string;
  tag?: 'NEW' | 'EXCLUSIVE' | null;
  minBet: Money;
  imageUrl?: string | null;
  demoAvailable?: boolean;
}

export interface Lobby {
  categories: { key: string; name: string; games: LobbyGame[] }[];
}

export interface Launch {
  sessionToken: string;
  launchUrl: string;
  expiresAt: string;
}

export interface RecentGame {
  providerId: string;
  gameId: string;
  playedAt: string;
}

/** The lobby from the casino catalogue; an error means the casino is not reachable, and the screen says so. */
export function useLobby() {
  return useQuery({ queryKey: ['casino', 'lobby'], queryFn: () => api<Lobby>('/casino/lobby'), staleTime: 60_000, retry: 1 });
}

export function useLaunch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (game: { gameId: string; providerId: string }) =>
      api<Launch>('/casino/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...game, lobbyUrl: lobbyUrl() }) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['casino', 'recent'] }),
  });
}

/** Free play: no account and no money; only games the provider offers a demo for. */
export function useDemo() {
  return useMutation({
    mutationFn: (game: { gameId: string; providerId: string }) =>
      api<{ launchUrl: string }>('/casino/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...game, lobbyUrl: lobbyUrl() }) }),
  });
}

export function useRecent(enabled: boolean) {
  return useQuery({ queryKey: ['casino', 'recent'], queryFn: () => api<RecentGame[]>('/casino/recent'), enabled, staleTime: 30_000 });
}

export function useFavourites(enabled: boolean) {
  return useQuery({ queryKey: ['casino', 'favourites'], queryFn: () => api<string[]>('/casino/favourites'), enabled, staleTime: 60_000 });
}

export function useToggleFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gameId, favourite }: { gameId: string; favourite: boolean }) =>
      api<void>(`/casino/favourites/${encodeURIComponent(gameId)}`, { method: favourite ? 'PUT' : 'DELETE' }),
    onMutate: async ({ gameId, favourite }) => {
      await queryClient.cancelQueries({ queryKey: ['casino', 'favourites'] });
      queryClient.setQueryData<string[]>(['casino', 'favourites'], (ids = []) => (favourite ? [gameId, ...ids.filter((id) => id !== gameId)] : ids.filter((id) => id !== gameId)));
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: ['casino', 'favourites'] }),
  });
}

function lobbyUrl(): string | undefined {
  return typeof window !== 'undefined' && window.location ? `${window.location.origin}/casino` : undefined;
}

/** Every game in the lobby once, in lobby order. */
export function allGames(lobby: Lobby | undefined): LobbyGame[] {
  const seen = new Set<string>();
  return (lobby?.categories ?? [])
    .flatMap((c) => c.games)
    .filter((g) => {
      if (seen.has(g.gameId)) {
        return false;
      }
      seen.add(g.gameId);
      return true;
    });
}

/** Games whose name or provider matches every word typed, ignoring case and accents. */
export function searchGames(lobby: Lobby | undefined, query: string): LobbyGame[] {
  const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }
  return allGames(lobby).filter((g) => words.every((w) => fold(`${g.name} ${g.providerId}`).includes(w)));
}

/** Lobby games for a list of ids, in that order, skipping any the lobby no longer offers. */
export function pickGames(lobby: Lobby | undefined, ids: string[]): LobbyGame[] {
  const byId = new Map(allGames(lobby).map((g) => [g.gameId, g]));
  return ids.map((id) => byId.get(id)).filter((g): g is LobbyGame => g !== undefined);
}

/** Why a launch was refused, in the player's words. */
export function launchRefusal(code: string | undefined): string {
  switch (code) {
    case 'casino_restricted':
      return 'Casino play is paused on your account by a limit or self-exclusion you set. You can review it under Safer gambling.';
    case 'restrictions_unavailable':
      return 'We could not check your account limits just now. Try again in a moment.';
    case 'provider_not_found':
      return 'This game is not available right now.';
    case 'provider_unavailable':
      return 'The game provider did not answer. Try again in a moment.';
    case 'no_demo':
      return 'This game has no free demo. Sign in to play it.';
    default:
      return 'The game could not start. Try again.';
  }
}
