import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { ApiError } from '../../../shared/lib/apiError';
import { newIdempotencyKey } from '../../../shared/lib/format';
import { api } from '../../../shared/lib/session';
import { useSession } from '../../../shared/lib/useSession';
import type { EntryMode, PoolType } from '../model/combinations';

export type RaceStatus = 'open' | 'closed' | 'off' | 'result' | 'official' | 'abandoned';

export interface MeetingRace {
  raceId: string;
  number: number;
  name: string;
  postTime: string;
  status: RaceStatus;
  distance: number;
  going: string;
  runners: number;
}

export interface Meeting {
  meetingId: string;
  venue: string;
  country: string;
  date: string;
  races: MeetingRace[];
}

export interface Runner {
  number: number;
  name: string;
  jockey: string;
  trainer: string;
  draw: number | null;
  weight: number | null;
  form: string | null;
  scratched: boolean;
  winPrice: number | null;
  placePrice: number | null;
  sp: number | null;
  finishPosition: number | null;
  deductionPercent: number | null;
}

export interface Pool {
  poolId: string;
  type: PoolType;
  legRaceIds: string[];
  legNumber: number;
  status: 'open' | 'closed' | 'declared' | 'cancelled';
  minUnit: number;
}

export interface Dividend {
  poolId: string;
  type: PoolType;
  status: string;
  carryOver: number | null;
  lines: { selections: number[][]; perUnit: number }[];
}

export interface Race {
  raceId: string;
  meetingId: string;
  venue: string;
  number: number;
  name: string;
  distance: number;
  going: string;
  postTime: string;
  status: RaceStatus;
  placeTerms: { places: number; fraction: string } | null;
  runners: Runner[];
  pools: Pool[];
  result: { official: boolean; positions: { position: number; runners: number[] }[] } | null;
  dividends: Dividend[];
}

export interface RacingBet {
  betId: string;
  kind: 'fixed' | 'tote';
  raceId: string;
  venue: string;
  raceNumber: number;
  postTime: string;
  market: string;
  priceType: 'fixed' | 'sp' | null;
  price: number | null;
  poolId: string | null;
  mode: EntryMode | null;
  selections: number[][];
  runnerNames: string[] | null;
  combinations: number;
  unitStake: number;
  stake: number;
  status: 'pending' | 'accepted' | 'refused' | 'won' | 'lost' | 'void' | 'refunded';
  payout: number | null;
  refunded: number | null;
  createdAt: string;
  settledAt: string | null;
}

export interface FixedBetRequest {
  raceId: string;
  runner: number;
  market: 'win' | 'place';
  priceType: 'fixed' | 'sp';
  price?: number;
  stake: number;
}

export interface ToteBetRequest {
  poolId: string;
  mode: EntryMode;
  selections: number[][];
  unitStake: number;
}

const json = { 'Content-Type': 'application/json' };

export const raceKey = (raceId: string) => ['racing', 'race', raceId] as const;

/** A yyyy-MM-dd date in UTC, days from today. */
export function racingDate(daysAhead: number, now: number = Date.now()): string {
  return new Date(now + daysAhead * 86_400_000).toISOString().slice(0, 10);
}

export function useMeetings(date: string) {
  return useQuery({ queryKey: ['racing', 'meetings', date], queryFn: () => api<Meeting[]>(`/racing/meetings?date=${date}`), retry: 1 });
}

export function useRace(raceId: string) {
  return useQuery({ queryKey: raceKey(raceId), queryFn: () => api<Race>(`/racing/races/${encodeURIComponent(raceId)}`), retry: 1 });
}

/** Every leg's race card for a multi-leg pool, in leg order. */
export function useLegRaces(raceIds: string[]) {
  return useQueries({
    queries: raceIds.map((id) => ({ queryKey: raceKey(id), queryFn: () => api<Race>(`/racing/races/${encodeURIComponent(id)}`), retry: 1 })),
  });
}

export function useRacingBets() {
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: ['me', 'racing-bets'], queryFn: () => api<RacingBet[]>('/racing/bets?limit=50'), enabled: signedIn });
}

/** One placement attempt keeps its idempotency key until it succeeds or is refused. */
function usePlace<TBody>(path: string) {
  const queryClient = useQueryClient();
  const key = useRef<string | null>(null);
  return useMutation({
    mutationFn: (body: TBody) => {
      key.current ??= newIdempotencyKey();
      return api<RacingBet>(path, { method: 'POST', headers: { ...json, 'Idempotency-Key': key.current }, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      key.current = null;
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => {
      key.current = null;
    },
  });
}

export function usePlaceFixed() {
  return usePlace<FixedBetRequest>('/racing/bets/fixed');
}

export function usePlaceTote() {
  return usePlace<ToteBetRequest>('/racing/bets/tote');
}

/** Why a racing bet was refused, in the player's words. */
export function racingRefusal(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Could not place the bet. Check your connection and try again.';
  }
  switch (error.code) {
    case 'price_changed':
      return 'The price moved. Accept the new price to continue.';
    case 'race_closed':
      return 'Betting on this race has closed.';
    case 'pool_closed':
      return 'This pool has closed.';
    case 'runner_scratched':
      return 'This runner has been scratched.';
    case 'place_unavailable':
      return 'Place betting is not offered on this race.';
    case 'stake_invalid':
      return 'Check the stake and try again.';
    case 'entry_invalid':
      return 'This entry is not valid for the pool. Check your runners.';
    case 'racing_restricted':
      return 'Racing bets are paused on your account by a limit or self-exclusion you set.';
    case 'insufficient_funds':
      return 'Your balance is too low for this stake.';
    case 'wallet_refused':
      return error.message;
    case 'wallet_unavailable':
      return 'Your wallet is not reachable just now. Try again in a moment.';
    default:
      return 'Could not place the bet. Try again.';
  }
}
