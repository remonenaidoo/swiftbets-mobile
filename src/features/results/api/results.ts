import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { api } from '../../../shared/lib/session';
import type { Fixture, FixtureResult } from '../../../shared/lib/types';
import { useDeltas, useLiveInvalidation } from '../../../shared/realtime/useLive';

export const resultsKey = (sportId: string, competitionId?: string) => ['results', sportId, competitionId ?? ''] as const;

/** Finished fixtures of the last few days; a fixture going to full time over the live stream re-reads the list. */
export function useResults(sportId: string, competitionId?: string, days = 3) {
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useLiveInvalidation([], ['results']);
  // The result is written just after the fixture-changed delta, so wait a moment before re-reading.
  useDeltas(['fixture-changed'], (delta) => {
    if ((delta.payload as Fixture).status !== 'finished') return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void queryClient.invalidateQueries({ queryKey: ['results'] }), 2_000);
  });
  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  const query = new URLSearchParams({ sportId, days: String(days) });
  if (competitionId) query.set('competition', competitionId);
  return useQuery({ queryKey: resultsKey(sportId, competitionId), queryFn: () => api<FixtureResult[]>(`/fixtures/results?${query.toString()}`) });
}

export interface ResultDay {
  key: string;
  label: string;
  results: FixtureResult[];
}

/** Groups results by local kick-off day, newest first: "Today", "Yesterday", then "Thu 1 Oct". */
export function groupByDay(results: FixtureResult[], now: Date = new Date()): ResultDay[] {
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const days = new Map<string, ResultDay>();
  for (const result of [...results].sort((a, b) => b.kickoffAt.localeCompare(a.kickoffAt))) {
    const kickoff = new Date(result.kickoffAt);
    const key = dayKey(kickoff);
    const label =
      key === dayKey(now) ? 'Today' : key === dayKey(yesterday) ? 'Yesterday' : kickoff.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
    const day = days.get(key) ?? { key, label, results: [] };
    day.results.push(result);
    days.set(key, day);
  }
  return [...days.values()];
}

/** The short label shown on a result card. */
export function resultLabel(status: string): string {
  switch (status) {
    case 'void':
      return 'Void';
    case 'correction':
      return 'Corrected';
    case 'provisional':
      return 'Provisional';
    default:
      return 'Full time';
  }
}
