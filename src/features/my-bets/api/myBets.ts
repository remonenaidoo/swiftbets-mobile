import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Money, MyCoupon } from '../../../shared/lib/types';
import { useSession } from '../../../shared/lib/useSession';
import { useLiveInvalidation } from '../../../shared/realtime/useLive';

const ownDeltas = ['coupon-placed', 'coupon-rejected', 'coupon-settled', 'payout-completed'] as const;

/** Open bets come from bet-history's open lookup; settled ones from the full list. */
export function useMyBets(open: boolean) {
  useLiveInvalidation(ownDeltas, ['me', 'coupons']);
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({
    queryKey: ['me', 'coupons', open ? 'open' : 'all'],
    queryFn: () => api<MyCoupon[]>(open ? '/me/coupons?open=true&limit=50' : '/me/coupons?limit=50'),
    enabled: signedIn,
    select: open ? undefined : (coupons: MyCoupon[]) => coupons.filter((c) => c.status !== 'open'),
  });
}

export function useBalance() {
  useLiveInvalidation(ownDeltas, ['me', 'balance']);
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: ['me', 'balance'], queryFn: () => api<{ available: Money }>('/me/balance'), enabled: signedIn });
}
