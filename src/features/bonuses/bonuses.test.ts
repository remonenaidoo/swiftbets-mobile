import { freeBetReturnMinor, offersView, usableFreeBets, type FreeBet } from './api/bonuses';

const freeBet = (currency: string, expiresAt = '2030-01-01T00:00:00Z'): FreeBet => ({ freeBetId: 'fb1', amount: 5000, currency, minOdds: 1.5, expiresAt, promotionName: 'First bet' });

describe('offers page', () => {
  it('lists offers for a customer who has them on', () => {
    expect(offersView({ restricted: false, marketingOptedOut: false, offers: [] })).toBe('list');
  });

  it('shows only the note when the account is restricted, even if offers are off', () => {
    expect(offersView({ restricted: true, marketingOptedOut: true, offers: [] })).toBe('restricted');
  });
});

describe('free bet in the slip', () => {
  it('offers a free bet in the slip currency and returns winnings only', () => {
    expect(usableFreeBets([freeBet('ZAR')], 'ZAR').map((f) => f.freeBetId)).toEqual(['fb1']);
    expect(freeBetReturnMinor(15000, 5000)).toBe(10000);
  });

  it('does not offer a free bet in another currency or past its expiry', () => {
    expect(usableFreeBets([freeBet('USD'), freeBet('ZAR', '2020-01-01T00:00:00Z')], 'ZAR')).toEqual([]);
  });
});
