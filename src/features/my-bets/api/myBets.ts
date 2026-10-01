import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Money, MyCoupon } from '../../../shared/lib/types';
import { useSession } from '../../../shared/lib/useSession';
import { useLiveInvalidation } from '../../../shared/realtime/useLive';

const ownDeltas = ['coupon-placed', 'coupon-rejected', 'coupon-settled', 'payout-completed'] as const;

export function useMyBets() {
  useLiveInvalidation(ownDeltas, ['me', 'coupons']);
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: ['me', 'coupons'], queryFn: () => api<MyCoupon[]>('/me/coupons?limit=50'), enabled: signedIn });
}

export function useBalance() {
  useLiveInvalidation(ownDeltas, ['me', 'balance']);
  const signedIn = useSession().data?.signedIn === true;
  return useQuery({ queryKey: ['me', 'balance'], queryFn: () => api<{ available: Money }>('/me/balance'), enabled: signedIn });
}
