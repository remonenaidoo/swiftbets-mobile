import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { Fixture, MyCoupon, MyCouponLeg } from '../../../shared/lib/types';
import { colors } from '../../../shared/ui/theme';
import { fixturesKey } from '../../fixtures/api/fixtures';
import { fetchFixture } from '../api/myBets';

export interface Tone {
  label: string;
  color: string;
}

const paidTone: Tone = { label: 'Paid', color: colors.positive };

const statusTone: Record<string, Tone> = {
  open: { label: 'Open', color: colors.odds },
  placed: { label: 'Open', color: colors.odds },
  won: { label: 'Won', color: colors.positive },
  paid: { label: 'Paid', color: colors.positive },
  lost: { label: 'Lost', color: colors.textMuted },
  void: { label: 'Void', color: colors.warning },
  cashedOut: { label: 'Cashed out', color: colors.positive },
};

export function tone(coupon: Pick<MyCoupon, 'status' | 'paidToDate'>): Tone {
  if (coupon.paidToDate > 0 && coupon.status !== 'cashedOut') {
    return paidTone;
  }
  return statusTone[coupon.status] ?? { label: coupon.status, color: colors.textMuted };
}

export function betTypeLabel(coupon: Pick<MyCoupon, 'betType'>, legs: number): string {
  return coupon.betType === 'accumulator' ? `Accumulator · ${legs} legs` : coupon.betType === 'system' ? `System · ${legs} legs` : 'Single';
}

/** The selection's display name from the fixture when it is known, else a readable fallback. */
export function legLabel(leg: MyCouponLeg, fixture: Fixture | undefined): string {
  const named = fixture?.markets.find((m) => m.marketId === leg.marketId)?.selections.find((s) => s.selectionId === leg.selectionId)?.name;
  if (named) {
    return named;
  }
  const fallback: Record<string, string> = { home: 'Home', draw: 'Draw', away: 'Away', over: 'Over 2.5', under: 'Under 2.5' };
  return fallback[leg.selectionId] ?? leg.selectionId;
}

/** Fixtures for the legs shown: the listing when they are still in it, else each fixture by id (played matches leave the listing). */
export function useLegFixtures(fixtureIds: string[]) {
  const listed = useQueryClient().getQueryData<Fixture[]>(fixturesKey) ?? [];
  const looked = useQueries({
    queries: [...new Set(fixtureIds)]
      .filter((id) => !listed.some((f) => f.fixtureId === id))
      .map((id) => ({ queryKey: ['fixture', id], queryFn: () => fetchFixture(id), staleTime: 60_000 })),
  });
  const fixtures = [...listed, ...looked.flatMap((q) => (q.data ? [q.data] : []))];
  return new Map(fixtures.map((f) => [f.fixtureId, f]));
}

export const fixtureName = (fixture: Fixture | undefined) => (fixture ? `${fixture.homeTeam} v ${fixture.awayTeam}` : '…');
