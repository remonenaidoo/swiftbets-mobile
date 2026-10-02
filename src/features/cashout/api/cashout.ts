import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/lib/apiError';
import { api } from '../../../shared/lib/session';
import type { CashoutOffer } from '../../../shared/lib/types';

export type ExecuteOutcome = { kind: 'paid'; amount: number; currency: string } | { kind: 'requote'; offer: CashoutOffer; reason: string };

export function useCashoutQuote() {
  return useMutation({
    mutationFn: (couponId: string) =>
      api<CashoutOffer>('/cashout/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ couponId }) }),
  });
}

/** A moved or expired quote comes back with a fresh one; the customer confirms the new amount rather than seeing a failure. */
export function useCashoutExecute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offer: CashoutOffer): Promise<ExecuteOutcome> => {
      try {
        const done = await api<{ amount: number; currency: string }>('/cashout/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quoteToken: offer.quoteToken }),
        });
        return { kind: 'paid', amount: done.amount ?? offer.amount, currency: done.currency ?? offer.currency };
      } catch (error) {
        const fresh = error instanceof ApiError ? (error.envelope?.freshQuote as CashoutOffer | undefined) : undefined;
        if (error instanceof ApiError && fresh) {
          return { kind: 'requote', offer: fresh, reason: error.code };
        }
        throw error;
      }
    },
    onSuccess: (outcome) => {
      if (outcome.kind === 'paid') {
        void queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    },
  });
}

/** Whole seconds left on a quote, never negative. */
export function secondsLeft(offer: CashoutOffer, now: number): number {
  return Math.max(0, Math.ceil((new Date(offer.expiresAt).getTime() - now) / 1000));
}
