import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Fixture } from '../../../shared/lib/types';
import { useDeltas, useLiveInvalidation } from '../../../shared/realtime/useLive';

export const fixturesKey = ['fixtures'] as const;

/** Upcoming fixtures with their markets (enough for the whole day's coupon); each fixture-changed delta replaces that fixture in place. */
export function useFixtures() {
  const queryClient = useQueryClient();
  useLiveInvalidation([], fixturesKey);
  useDeltas(['fixture-changed'], (delta) => {
    const changed = delta.payload as Fixture;
    queryClient.setQueryData<Fixture[]>(fixturesKey, (current) => {
      if (!current) {
        return current;
      }
      const index = current.findIndex((f) => f.fixtureId === changed.fixtureId);
      if (index < 0) {
        return changed.status === 'scheduled' ? [...current, changed].sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt)) : current;
      }
      if ((current[index]?.offerVersion ?? 0) > changed.offerVersion) {
        return current;
      }
      const next = [...current];
      next[index] = changed;
      return next;
    });
  });

  return useQuery({ queryKey: fixturesKey, queryFn: () => api<Fixture[]>('/fixtures/?limit=200') });
}
