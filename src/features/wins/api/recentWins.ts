import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Money } from '../../../shared/lib/types';
import { useDeltas } from '../../../shared/realtime/useLive';

export interface Win {
  couponId: string;
  account: string;
  betType?: string | null;
  payout: Money;
  paidAt: string;
}

const key = ['recent-wins'] as const;

/** The latest wins once, then every new one live from the public group; no polling. */
export function useRecentWins() {
  const queryClient = useQueryClient();
  useDeltas(['win'], (delta) => {
    const win = delta.payload as Win;
    queryClient.setQueryData<Win[]>(key, (current) => [win, ...(current ?? []).filter((w) => w.couponId !== win.couponId)].slice(0, 20));
  });
  return useQuery({ queryKey: key, queryFn: () => api<Win[]>('/recent-wins?limit=12'), staleTime: Infinity });
}

/** "Accumulator", "System", "Single" from the history bet type, or nothing. */
export function betTypeLabel(betType?: string | null): string | null {
  if (!betType) return null;
  return betType.charAt(0).toUpperCase() + betType.slice(1);
}
