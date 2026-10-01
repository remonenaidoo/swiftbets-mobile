import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Money, MyCoupon } from '../../../shared/lib/types';
import { useLiveInvalidation } from '../../../shared/realtime/useLive';

const ownDeltas = ['coupon-placed', 'coupon-rejected', 'coupon-settled', 'payout-completed'] as const;

export function useMyBets() {
  useLiveInvalidation(ownDeltas, ['me', 'coupons']);
  return useQuery({ queryKey: ['me', 'coupons'], queryFn: () => api<MyCoupon[]>('/me/coupons?limit=50') });
}

export function useBalance() {
  useLiveInvalidation(ownDeltas, ['me', 'balance']);
  return useQuery({ queryKey: ['me', 'balance'], queryFn: () => api<{ available: Money }>('/me/balance') });
}
