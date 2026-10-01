import type { Fixture } from '../../../shared/lib/types';
import { applyFixture, toggleSelection, type SlipSelection } from './betslip';

const pick = (fixtureId: string, selectionId: string, odds = 2): SlipSelection => ({
  fixtureId,
  fixtureName: `${fixtureId} match`,
  marketId: `${fixtureId}-1x2`,
  marketName: 'Match result',
  selectionId,
  selectionName: selectionId,
  odds,
  offerVersion: 1,
});

const fixture = (odds: number): Fixture => ({
  fixtureId: 'f1',
  competition: 'Premier League',
  homeTeam: 'A',
  awayTeam: 'B',
  kickoffAt: '2030-01-01T00:00:00Z',
  status: 'scheduled',
  offerVersion: 2,
  markets: [{ marketId: 'f1-1x2', type: 'matchResult', status: 'open', selections: [{ selectionId: 'home', name: 'A', odds }] }],
});

describe('betslip selections', () => {
  it('builds an accumulator from different matches but replaces a second pick on the same match', () => {
    const acca = toggleSelection(toggleSelection([], pick('f1', 'home')), pick('f2', 'draw'));
    expect(acca.map((s) => s.fixtureId)).toEqual(['f1', 'f2']);

    const replaced = toggleSelection(acca, pick('f1', 'away'));
    expect(replaced.find((s) => s.fixtureId === 'f1')?.selectionId).toBe('away');
    expect(replaced).toHaveLength(2);
  });

  it('leaves the slip untouched when a fixture update does not change its prices', () => {
    const slip = [{ ...pick('f1', 'home', 2.5), offerVersion: 2 }];

    expect(applyFixture(slip, fixture(2.5))).toBe(slip);
  });
});

describe('live prices on the slip', () => {
  it('flags a moved price so the punter must accept it before placing', () => {
    const [updated] = applyFixture([pick('f1', 'home', 2.5)], fixture(2.2));

    expect(updated).toMatchObject({ odds: 2.2, previousOdds: 2.5, offerVersion: 2 });
  });
});
