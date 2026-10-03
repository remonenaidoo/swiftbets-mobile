import { ApiError } from '../../shared/lib/apiError';
import { racingRefusal, type Race } from './api/racing';
import { repricePick, type RacingPick } from './state/racingSlip';

const pick: RacingPick = { raceId: 'r1', raceLabel: 'Kenilworth R1', runner: 3, runnerName: 'Smart Call', market: 'win', priceType: 'fixed', price: 4.5, stake: '10' };
const race = (winPrice: number) => ({ runners: [{ number: 3, winPrice, placePrice: null }] }) as unknown as Race;

describe('racing slip', () => {
  it('shows the new price after a price change so the player can accept it', () => {
    const [moved] = repricePick([pick], pick, race(3.8));
    expect(moved).toMatchObject({ price: 3.8, previousPrice: 4.5 });
  });

  it('leaves the pick alone when the price did not move', () => {
    expect(repricePick([pick], pick, race(4.5))[0]).toBe(pick);
  });
});

describe('racing refusals', () => {
  it('explains a racing restriction plainly', () => {
    const error = new ApiError(403, { status: 403, code: 'racing_restricted', correlationId: 'c', title: 'Forbidden' });
    expect(racingRefusal(error)).toContain('self-exclusion');
  });

  it('falls back to a retry message for anything unexpected', () => {
    expect(racingRefusal(new Error('boom'))).toBe('Could not place the bet. Check your connection and try again.');
  });
});
