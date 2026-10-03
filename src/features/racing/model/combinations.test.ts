import { combinations, entryProblem } from './combinations';

describe('tote combinations', () => {
  it('counts every entry mode the way the pool rules do', () => {
    expect(combinations('trifecta', 'straight', [[1, 2], [1, 2, 3], [3, 4]])).toBe(6);
    expect(combinations('trifecta', 'box', [[1, 2, 3, 4]])).toBe(24);
    expect(combinations('trifecta', 'banker', [[5], [1, 2, 3]])).toBe(6);
    expect(combinations('trifecta', 'floating', [[5], [1, 2, 3]])).toBe(18);
    expect(combinations('swinger', 'straight', [[1, 2, 3]])).toBe(3);
    expect(combinations('jackpot', 'straight', [[1, 2], [3], [1, 4, 5], [2]])).toBe(6);
  });

  it('gives no combinations for an entry the pool does not allow', () => {
    expect(combinations('quartet', 'banker', [[1, 2, 3, 4], [5, 6]])).toBe(0);
    expect(combinations('pick6', 'box', [[1, 2, 3]])).toBe(0);
    expect(entryProblem(3, 40)).toBe('The minimum unit stake is R0.50.');
  });
});
