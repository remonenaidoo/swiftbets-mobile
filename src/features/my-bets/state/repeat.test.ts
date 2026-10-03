import type { Fixture, MyCouponLeg } from '../../../shared/lib/types';
import { historyQuery } from './filters';
import { repeatMessage, repeatSelections } from './repeat';

const fixture = (fixtureId: string, status: string, odds: number): Fixture => ({
  fixtureId,
  competition: 'PSL',
  homeTeam: `${fixtureId} home`,
  awayTeam: `${fixtureId} away`,
  kickoffAt: '2026-10-05T15:00:00Z',
  status,
  offerVersion: 3,
  markets: [{ marketId: `${fixtureId}-1x2`, type: 'matchResult', status: 'open', selections: [{ selectionId: 'home', name: 'Home', odds }] }],
});

const leg = (fixtureId: string): MyCouponLeg => ({ legId: fixtureId, fixtureId, marketId: `${fixtureId}-1x2`, selectionId: 'home', odds: 1.5 });

describe('repeat bet', () => {
  it('puts open selections back at the current price', () => {
    const result = repeatSelections([leg('a')], new Map([['a', fixture('a', 'scheduled', 2.4)]]));
    expect(result.selections).toMatchObject([{ fixtureId: 'a', selectionId: 'home', odds: 2.4, offerVersion: 3 }]);
    expect(result.skipped).toEqual([]);
  });

  it('skips a selection whose match is no longer open and says so', () => {
    const result = repeatSelections([leg('a'), leg('b')], new Map([['a', fixture('a', 'scheduled', 2)], ['b', fixture('b', 'finished', 2)]]));
    expect(result.selections.map((s) => s.fixtureId)).toEqual(['a']);
    expect(repeatMessage(result)).toContain('Home (b home v b away)');
  });
});

describe('history query', () => {
  it('sends only the filters that are set, with the cursor', () => {
    const query = historyQuery({ status: 'won', betType: 'all', range: '7d' }, 'c1', new Date('2026-10-08T00:00:00Z'));
    expect(query).toBe('/me/coupons?limit=20&status=won&from=2026-10-01T00%3A00%3A00.000Z&before=c1');
  });

  it('sends no filters for everything', () => {
    expect(historyQuery({ status: 'all', betType: 'all', range: 'all' })).toBe('/me/coupons?limit=20');
  });
});
