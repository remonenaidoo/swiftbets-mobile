import { ApiError } from './apiError';
import { createApiClient } from './createApiClient';

function json(status: number, body: unknown, contentType = 'application/json') {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } });
}

describe('createApiClient', () => {
  it('shares one refresh between concurrent 401s and retries each request', async () => {
    let token = 'expired';
    const refresh = jest.fn(async () => {
      token = 'fresh';
      return true;
    });
    const fetchImpl = jest.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
      new Headers(init?.headers).get('Authorization') === 'Bearer fresh' ? json(200, { ok: true }) : json(401, {}),
    );
    const request = createApiClient({ baseUrl: 'https://api', getAccessToken: async () => token, refresh, onSessionExpired: jest.fn(), fetchImpl });

    await expect(Promise.all([request('/me/coupons'), request('/fixtures')])).resolves.toEqual([{ ok: true }, { ok: true }]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('ends the session when refresh fails and surfaces the error envelope', async () => {
    const onSessionExpired = jest.fn();
    const fetchImpl = jest.fn(async () =>
      json(401, { status: 401, code: 'unauthenticated', correlationId: 'corr-9', title: 'Unauthorized' }, 'application/problem+json'),
    );
    const request = createApiClient({ baseUrl: 'https://api', getAccessToken: async () => 'old', refresh: async () => false, onSessionExpired, fetchImpl });

    const error = await request('/me/coupons').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('unauthenticated');
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('treats an acknowledgement with no body as success', async () => {
    const fetchImpl = jest.fn(async () => new Response(null, { status: 202 }));
    const request = createApiClient({ baseUrl: 'https://api', getAccessToken: async () => 't', refresh: async () => false, onSessionExpired: jest.fn(), fetchImpl });

    await expect(request('/auth/password-reset', { method: 'POST' })).resolves.toBeUndefined();
  });
});
