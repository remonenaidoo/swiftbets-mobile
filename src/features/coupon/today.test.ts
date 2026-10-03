import type { Fixture } from '../../shared/lib/types';
import { todaysCoupon } from './today';

const at = (id: string, competition: string, kickoffAt: string, status = 'scheduled'): Fixture => ({ fixtureId: id, competition, homeTeam: id, awayTeam: 'B', kickoffAt, status, offerVersion: 1, markets: [] });

describe("today's coupon", () => {
  it('groups today by competition, then kickoff time', () => {
    const now = new Date(2026, 9, 4, 12, 0);
    const iso = (h: number, m = 0) => new Date(2026, 9, 4, h, m).toISOString();
    const groups = todaysCoupon([at('c', 'Premier', iso(15)), at('a', 'Cup', iso(18)), at('b', 'Premier', iso(15)), at('d', 'Premier', iso(17))], now);
    expect(groups.map((g) => g.competition)).toEqual(['Cup', 'Premier']);
    expect(groups[1]!.slots.map((s) => s.fixtures.map((f) => f.fixtureId))).toEqual([['b', 'c'], ['d']]);
  });

  it('leaves out matches that started, closed or are on another day', () => {
    const now = new Date(2026, 9, 4, 12, 0);
    const fixtures = [at('started', 'P', new Date(2026, 9, 4, 11).toISOString()), at('closed', 'P', new Date(2026, 9, 4, 15).toISOString(), 'suspended'), at('tomorrow', 'P', new Date(2026, 9, 5, 15).toISOString())];
    expect(todaysCoupon(fixtures, now)).toEqual([]);
  });
});
