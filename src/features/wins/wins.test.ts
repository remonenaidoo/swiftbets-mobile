import { betTypeLabel } from './api/recentWins';

describe('winner labels', () => {
  it('names the bet type for the ticker', () => {
    expect(betTypeLabel('accumulator')).toBe('Accumulator');
  });

  it('shows nothing when the bet type is unknown', () => {
    expect(betTypeLabel(null)).toBeNull();
  });
});
