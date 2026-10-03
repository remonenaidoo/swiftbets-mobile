import type { Fixture } from '../../shared/lib/types';

export interface CouponGroup {
  competition: string;
  slots: { kickoff: string; fixtures: Fixture[] }[];
}

/** Today's open fixtures (local day, not yet kicked off), by competition, then by kickoff time. */
export function todaysCoupon(fixtures: Fixture[], now: Date): CouponGroup[] {
  const today = now.toDateString();
  const open = fixtures
    .filter((f) => f.status === 'scheduled' && new Date(f.kickoffAt) > now && new Date(f.kickoffAt).toDateString() === today)
    .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt) || a.homeTeam.localeCompare(b.homeTeam));
  const groups = new Map<string, Map<string, Fixture[]>>();
  for (const f of open) {
    const slots = groups.get(f.competition) ?? new Map<string, Fixture[]>();
    slots.set(f.kickoffAt, [...(slots.get(f.kickoffAt) ?? []), f]);
    groups.set(f.competition, slots);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([competition, slots]) => ({ competition, slots: [...slots.entries()].map(([kickoff, list]) => ({ kickoff, fixtures: list })) }));
}
