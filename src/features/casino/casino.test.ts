import { launchRefusal, pickGames, searchGames, type Lobby } from './api/casino';

const lobby: Lobby = {
  categories: [
    {
      key: 'slots',
      name: 'Slots',
      games: [
        { gameId: 'vs20sunwolf', name: 'Sun Wolf Megaways', providerId: 'pragmatic', category: 'slots', minBet: { minorUnits: 100, currency: 'ZAR' } },
        { gameId: 'sun-temple', name: 'Sun Temple', providerId: 'sim-seamless', category: 'slots', minBet: { minorUnits: 100, currency: 'ZAR' } },
      ],
    },
  ],
};

describe('casino launch refusals', () => {
  it('explains a self-exclusion or limit plainly', () => {
    expect(launchRefusal('casino_restricted')).toContain('self-exclusion');
  });

  it('falls back to a retry message for anything unexpected', () => {
    expect(launchRefusal('something_else')).toBe('The game could not start. Try again.');
  });
});

describe('lobby search', () => {
  it('matches every typed word against the name and provider, ignoring case', () => {
    expect(searchGames(lobby, 'SUN prag').map((g) => g.gameId)).toEqual(['vs20sunwolf']);
  });

  it('finds nothing for an empty query or a word no game has', () => {
    expect(searchGames(lobby, '  ')).toEqual([]);
    expect(searchGames(lobby, 'roulette')).toEqual([]);
  });
});

describe('favourites and recently played', () => {
  it('keep the order given and drop games the lobby no longer offers', () => {
    expect(pickGames(lobby, ['sun-temple', 'gone', 'vs20sunwolf']).map((g) => g.gameId)).toEqual(['sun-temple', 'vs20sunwolf']);
  });
});
