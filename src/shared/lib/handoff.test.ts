import { accountHandoffUrl } from './session';

jest.mock('./config', () => ({ apiOrigin: 'https://bets.example', isWeb: false, nativeUserAgent: 'test' }));
const mockStore = { access: 'a1' as string | null, refresh: 'r1' as string | null };
jest.mock('./tokenStore', () => ({
  tokenStore: {
    getAccessToken: async () => mockStore.access,
    getRefreshToken: async () => mockStore.refresh,
    save: async (t: { accessToken: string; refreshToken: string }) => {
      mockStore.access = t.accessToken;
      mockStore.refresh = t.refreshToken;
    },
    clear: async () => undefined,
  },
}));

describe('accountHandoffUrl', () => {
  afterEach(() => jest.restoreAllMocks());

  it('keeps the app signed in with its rotated tokens and returns an absolute single-use link', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ accessToken: 'a2', refreshToken: 'r2', url: '/api/session/handoff/c0de?next=%2Faccount%2Fwallet' }), { status: 200 }),
    );

    await expect(accountHandoffUrl('/account/wallet')).resolves.toBe('https://bets.example/api/session/handoff/c0de?next=%2Faccount%2Fwallet');
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual({ refreshToken: 'r1', next: '/account/wallet' });
    expect(mockStore.refresh).toBe('r2');
  });

  it('asks nothing of the server when the app is not signed in', async () => {
    mockStore.refresh = null;
    const fetchMock = jest.spyOn(globalThis, 'fetch');

    await expect(accountHandoffUrl('/account/wallet')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
