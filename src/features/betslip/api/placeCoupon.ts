import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { newIdempotencyKey } from '../../../shared/lib/format';
import { api } from '../../../shared/lib/session';
import type { SlipSelection } from '../state/betslip';

export interface PlacedCoupon {
  couponId: string;
  betType: string;
  totalOdds: number;
  potentialPayout: { minorUnits: number; currency: string };
}

/**
 * Places the slip as one coupon (a single for one selection, an accumulator for more). The idempotency key is kept
 * until the attempt succeeds, so a retried click can never place the same bet twice.
 */
export function usePlaceCoupon() {
  const queryClient = useQueryClient();
  const key = useRef<string | null>(null);
  return useMutation({
    mutationFn: ({ slip, stakeMinor }: { slip: SlipSelection[]; stakeMinor: number }) => {
      key.current ??= newIdempotencyKey();
      return api<PlacedCoupon>('/coupons/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key.current },
        body: JSON.stringify({
          stake: stakeMinor,
          currency: 'ZAR',
          legs: slip.map((s) => ({ fixtureId: s.fixtureId, marketId: s.marketId, selectionId: s.selectionId, odds: s.odds, offerVersion: s.offerVersion })),
        }),
      });
    },
    onSuccess: () => {
      key.current = null;
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => {
      // A refusal (price moved, market closed) ends this attempt; the next one is a new bet.
      key.current = null;
    },
  });
}
