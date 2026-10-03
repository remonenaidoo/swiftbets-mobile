import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { BuilderComponent } from '../../../shared/lib/types';
import type { AccaBoostTable, BuilderPick } from '../model';

export interface BuilderPrice {
  fixtureId: string;
  marketId: string;
  selectionId: string;
  odds: number;
  naiveOdds: number;
  offerVersion: number;
  components: BuilderComponent[];
}

/** The combined price of the picks, re-asked whenever the picks or the fixture's offer version change. */
export function useBuilderPrice(fixtureId: string, picks: BuilderPick[], offerVersion: number) {
  const selections = picks.map(({ marketId, selectionId }) => ({ marketId, selectionId }));
  return useQuery({
    queryKey: ['bet-builder', fixtureId, selections, offerVersion],
    queryFn: () =>
      api<BuilderPrice>(`/fixtures/${encodeURIComponent(fixtureId)}/bet-builder/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections }),
      }),
    enabled: picks.length >= 2,
    retry: false,
    placeholderData: (previous) => previous,
  });
}

export function useAccaBoost() {
  return useQuery({ queryKey: ['acca-boost'], queryFn: () => api<AccaBoostTable>('/fixtures/acca-boost'), staleTime: 60_000, retry: false });
}
