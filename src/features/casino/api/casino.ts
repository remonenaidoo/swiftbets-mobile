import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Money } from '../../../shared/lib/types';

export interface LobbyGame {
  gameId: string;
  name: string;
  providerId: string;
  category: string;
  tag?: 'NEW' | 'EXCLUSIVE' | null;
  minBet: Money;
}

export interface Lobby {
  categories: { key: string; name: string; games: LobbyGame[] }[];
}

export interface Launch {
  sessionToken: string;
  launchUrl: string;
  expiresAt: string;
}

/** The lobby from the casino catalogue; an error means the casino is not reachable, and the screen says so. */
export function useLobby() {
  return useQuery({ queryKey: ['casino', 'lobby'], queryFn: () => api<Lobby>('/casino/lobby'), staleTime: 60_000, retry: 1 });
}

export function useLaunch() {
  return useMutation({
    mutationFn: (game: { gameId: string; providerId: string }) =>
      api<Launch>('/casino/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(game) }),
  });
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
    default:
      return 'The game could not start. Try again.';
  }
}
