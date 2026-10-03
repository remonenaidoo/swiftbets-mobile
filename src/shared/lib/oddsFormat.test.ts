import { formatOddsAs, isOddsFormat } from './oddsFormat';

describe('odds format', () => {
  it('shows one decimal price as decimal, fractional and american', () => {
    expect([2.1, 1.8, 2, 1.5].map((o) => formatOddsAs(o, 'fractional'))).toEqual(['11/10', '4/5', 'Evens', '1/2']);
    expect([2.5, 1.5].map((o) => formatOddsAs(o, 'american'))).toEqual(['+150', '-200']);
    expect(formatOddsAs(2.5, 'decimal')).toBe('2.50');
  });

  it('refuses an unknown saved format so the site falls back to decimal', () => {
    expect(isOddsFormat('hongkong')).toBe(false);
    expect(isOddsFormat(null)).toBe(false);
  });
});
