import type { FixtureResult } from '../../shared/lib/types';
import { groupByDay } from './api/results';

const result = (fixtureId: string, kickoffAt: string): FixtureResult => ({
  fixtureId, sportId: 'soccer', competitionId: 'premier-league', competitionName: 'Premier League', homeTeam: 'A', awayTeam: 'B',
  kickoffAt, homeGoals: 1, awayGoals: 0, status: 'official', source: 'feed', resultedAt: kickoffAt,
});

describe('results by day', () => {
  it('puts today first and labels it', () => {
    const now = new Date(2026, 9, 4, 18, 0);
    const days = groupByDay([result('old', new Date(2026, 9, 3, 15, 0).toISOString()), result('new', new Date(2026, 9, 4, 15, 0).toISOString())], now);
    expect(days.map((d) => d.label)).toEqual(['Today', 'Yesterday']);
  });

  it('returns no days when nothing has finished', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
