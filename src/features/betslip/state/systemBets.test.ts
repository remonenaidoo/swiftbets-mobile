import { betTypes, lineCount, maxReturnMinor } from './systemBets';

describe('system bets', () => {
  it('prices a Yankee over four selections as eleven lines, paying every double, treble and the four-fold', () => {
    const yankee = betTypes(4).find((b) => b.key === 'yankee')!;
    const odds = [2, 2, 2, 2];

    expect(lineCount(4, yankee.folds!)).toBe(11);
    // 6 doubles at 4.00, 4 trebles at 8.00 and the four-fold at 16.00, R1 a line.
    expect(maxReturnMinor(100, odds, yankee.folds!)).toBe(100 * (6 * 4 + 4 * 8 + 16));
  });

  it('rounds each line down to the cent, as placement pays it', () => {
    // A R10 Trixie with a 4.33 banker over 3.60, 3.90 and 4.24: placement returned R4,562.49 for this bet.
    expect(maxReturnMinor(1000, [3.6, 3.9, 4.24], [2, 3], [4.33])).toBe(456249);
  });

  it('offers no system bet the selections cannot fill, and bankers do not count as selections', () => {
    expect(betTypes(2).map((b) => b.key)).toEqual(['accumulator']);
    expect(betTypes(3, 1).map((b) => b.key)).not.toContain('yankee');
    expect(betTypes(3, 1).map((b) => b.key)).toContain('trixie');
  });
});
