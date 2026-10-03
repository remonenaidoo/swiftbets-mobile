import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { CouponDetail, Fixture, Money, MyCoupon } from '../../../shared/lib/types';
import { useSession } from '../../../shared/lib/useSession';
import { useLiveInvalidation } from '../../../shared/realtime/useLive';
import { historyQuery, pageSize, type BetFilter } from '../state/filters';

const ownDeltas = ['coupon-placed', 'coupon-rejected', 'coupon-settled', 'payout-completed'] as const;
const balanceDeltas = [...ownDeltas, 'balance-changed'] as const;

/** One filter's bets, a page at a time on bet-history's keyset cursor; the customer's own deltas refetch them. */
export function useBetHistory(filter: BetFilter) {
  useLiveInvalidation(ownDeltas, ['me', 'coupons']);
  const signedIn = useSession().data?.signedIn === true;
  return useInfiniteQuery({
    queryKey: ['me', 'coupons', 'history', filter],
    queryFn: ({ pageParam }) => api<MyCoupon[]>(historyQuery(filter, pageParam)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.length === pageSize ? (last[last.length - 1]?.cursor ?? undefined) : undefined),
    enabled: signedIn,
  });
}

/** One bet with leg results, its settlements and any cashout. */
export function useCouponDetail(couponId: string) {
  useLiveInvalidation(ownDeltas, ['me', 'coupons']);
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({
    queryKey: ['me', 'coupons', 'detail', couponId],
    queryFn: () => api<CouponDetail>(`/me/coupons/${encodeURIComponent(couponId)}`),
    enabled: signedIn && couponId.length > 0,
  });
}

/** A fixture as it stands now, for names and for repeating a bet at today's prices. */
export const fetchFixture = (fixtureId: string) => api<Fixture>(`/fixtures/${encodeURIComponent(fixtureId)}`);

export function useBalance() {
  useLiveInvalidation(balanceDeltas, ['me', 'balance']);
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: ['me', 'balance'], queryFn: () => api<{ available: Money }>('/me/balance'), enabled: signedIn });
}
