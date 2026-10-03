import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import { useSession } from '../../../shared/lib/useSession';

export interface FreeBet {
  freeBetId: string;
  amount: number;
  currency: string;
  minOdds: number;
  expiresAt: string;
  promotionName: string;
}

export interface ActiveBonus {
  grantId: string;
  amount: number;
  wageringTarget: number;
  wagered: number;
  minOdds: number;
  sportsPercent: number;
  casinoPercent: number;
  expiresAt: string;
  promotionName: string;
}

export interface Bonuses {
  currency: string;
  bonusBalance: number;
  forfeitOnWithdrawal: number;
  bonus: ActiveBonus | null;
  freeBets: FreeBet[];
}

export interface Offer {
  promotionId: string;
  name: string;
  kind: 'depositMatch' | 'firstBetFreeBet';
  currency: string;
  matchPercent: number;
  maxAward: number;
  minDeposit: number;
  wageringMultiplier: number;
  minOdds: number;
  sportsPercent: number;
  casinoPercent: number;
  validDays: number;
  optInRequired: boolean;
  optedIn: boolean;
  awarded: boolean;
  startsAt: string;
  endsAt: string;
  terms: string;
}

export interface Offers {
  marketingOptedOut: boolean;
  restricted: boolean;
  offers: Offer[];
}

const bonusesKey = (currency: string) => ['me', 'wallet', 'bonuses', currency] as const;
const offersKey = ['me', 'wallet', 'offers'] as const;

/** The customer's bonus balance, active bonus and free bets in one currency. */
export function useBonuses(currency = 'ZAR') {
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: bonusesKey(currency), queryFn: () => api<Bonuses>(`/me/wallet/bonuses?currency=${currency}`), enabled: signedIn });
}

export function useOffers() {
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: offersKey, queryFn: () => api<Offers>('/me/wallet/offers'), enabled: signedIn });
}

export function useOptIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promotionId, optIn }: { promotionId: string; optIn: boolean }) =>
      api<void>(`/me/wallet/offers/${promotionId}/opt-in`, { method: optIn ? 'POST' : 'DELETE' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: offersKey }),
  });
}

export function useSetMarketing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optedOut: boolean) =>
      api<{ optedOut: boolean }>('/me/wallet/marketing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ optedOut }) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: offersKey }),
  });
}

/** What the offers area shows: a note when restricted, the switch when offers are off, else the list. */
export function offersView(data: Offers): 'restricted' | 'optedOut' | 'list' {
  if (data.restricted) {
    return 'restricted';
  }
  return data.marketingOptedOut ? 'optedOut' : 'list';
}

/** Free bets the slip can use: same currency and not yet expired. */
export function usableFreeBets(freeBets: FreeBet[] | undefined, currency: string, now: number = Date.now()): FreeBet[] {
  return (freeBets ?? []).filter((f) => f.currency === currency && new Date(f.expiresAt).getTime() > now);
}

/** A free bet's stake is not returned, so the return is the winnings only. */
export function freeBetReturnMinor(payoutMinor: number, stakeMinor: number): number {
  return Math.max(0, payoutMinor - stakeMinor);
}

/** Wagering progress as a 0..1 fraction of the target. */
export function wageringProgress(bonus: ActiveBonus): number {
  return bonus.wageringTarget > 0 ? Math.min(1, bonus.wagered / bonus.wageringTarget) : 1;
}
