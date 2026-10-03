import { normalizeCode, toSlip } from '../api/bookingCodes';

jest.mock('../../../shared/lib/session', () => ({ api: jest.fn() }));

describe('booking codes', () => {
  it('accepts a typed code in any case and turns loaded selections into slip lines', () => {
    expect(normalizeCode(' abcd2345 ')).toBe('ABCD2345');
    const [line] = toSlip([{ fixtureId: 'f1', fixtureName: 'Lions v Tigers', marketId: 'f1-1x2', marketType: 'matchResult', selectionId: 'home', selectionName: 'Lions', odds: 2.1, offerVersion: 4 }]);
    expect(line).toMatchObject({ marketName: 'Match result', odds: 2.1, offerVersion: 4 });
  });

  it('refuses codes with characters people confuse or the wrong length', () => {
    expect(normalizeCode('ABCD0OI1')).toBeNull();
    expect(normalizeCode('ABC23')).toBeNull();
  });
});
