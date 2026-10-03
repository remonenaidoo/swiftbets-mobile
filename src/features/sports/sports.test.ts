import { marketLabel } from '../fixtures/components/marketLabel';
import { fixtureName, sportInfo } from './sports';

const market = (type: string, line: number | null = null) => ({ type, line, selections: [{ selectionId: 'over:45.5', name: 'Over', odds: 1.9 }] });

describe('market labels', () => {
  it('names a market by sport and carries the line on totals', () => {
    expect(marketLabel(market('matchWinner'), 'basketball')).toBe('Moneyline');
    expect(marketLabel(market('totalPoints', 45.5), 'rugby-union')).toBe('Total points 45.5');
  });

  it('keeps the plain name outside basketball and for unknown types', () => {
    expect(marketLabel(market('matchWinner'), 'tennis')).toBe('Match winner');
    expect(marketLabel(market('firstScorer'))).toBe('first Scorer');
  });
});

describe('fixture names', () => {
  it('names an outright by its competition winner only', () => {
    expect(fixtureName({ fixtureId: 'atp-finals-outright', homeTeam: 'ATP Finals winner', awayTeam: '' })).toBe('ATP Finals winner');
  });

  it('names a match by both sides', () => {
    expect(fixtureName({ fixtureId: 'fx-1', homeTeam: 'Sinner', awayTeam: 'Alcaraz' })).toBe('Sinner v Alcaraz');
  });
});

describe('sport info', () => {
  it('gives rugby union its icon and the catalogue name', () => {
    expect(sportInfo('rugby-union', [{ sportId: 'rugby-union', name: 'Rugby union', competitions: [] }])).toEqual({ sportId: 'rugby-union', name: 'Rugby union', icon: 'sports/rugby' });
  });

  it('falls back to a generic sport for an unknown id', () => {
    expect(sportInfo('curling').icon).toBe('nav/sports');
  });
});
