import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/session';
import type { Fixture } from '../../../shared/lib/types';
import { useDeltas, useLiveInvalidation } from '../../../shared/realtime/useLive';
import { sportOf } from '../../sports/sports';

export const fixturesKey = ['fixtures'] as const;

/** One sport's listing has its own key; every listing starts with fixturesKey. */
export const sportFixturesKey = (sportId?: string) => (sportId ? ([...fixturesKey, sportId] as const) : fixturesKey);

/** Upcoming fixtures with their markets, optionally for one sport; each fixture-changed delta replaces that fixture in place. */
export function useFixtures(sportId?: string) {
  const queryClient = useQueryClient();
  const key = sportFixturesKey(sportId);
  useLiveInvalidation([], key);
  useDeltas(['fixture-changed'], (delta) => {
    const changed = delta.payload as Fixture;
    if (sportId && sportOf(changed) !== sportId) {
      return;
    }
    queryClient.setQueryData<Fixture[]>(key, (current) => {
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

  const query = sportId ? `/fixtures/?limit=60&sportId=${encodeURIComponent(sportId)}` : '/fixtures/?limit=60';
  return useQuery({ queryKey: key, queryFn: () => api<Fixture[]>(query) });
}
