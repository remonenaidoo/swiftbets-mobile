import { accaBoostPercent, togglePick } from './model';

const table = { tiers: [{ legs: 3, percent: 5 }, { legs: 10, percent: 50 }], minLegOdds: 1.5 };

describe('bet builder picks', () => {
  it('replaces the pick in the same market', () => {
    const picks = togglePick([{ marketId: 'm1', selectionId: 'home', name: 'A' }], { marketId: 'm1', selectionId: 'away', name: 'B' });
    expect(picks).toEqual([{ marketId: 'm1', selectionId: 'away', name: 'B' }]);
  });
});

describe('acca boost', () => {
  it('takes the highest tier reached', () => {
    expect(accaBoostPercent(table, [2, 2, 2, 2])).toBe(5);
  });

  it('gives nothing when a leg is below the minimum price', () => {
    expect(accaBoostPercent(table, [2, 1.2, 2, 2])).toBe(0);
  });
});
