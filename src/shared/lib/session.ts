import { apiOrigin, isWeb } from './config';
import { createApiClient } from './createApiClient';
import { ApiError, type ErrorEnvelopeShape } from './apiError';
import { tokenStore } from './tokenStore';

/**
 * One API entry point for both shapes of the app.
 * - Web: the gateway's HttpOnly session cookie, plus the CSRF header on every mutation.
 * - Native: bearer tokens in the platform keystore with a single-flight refresh.
 * Either way a visitor never sees a sign-in form here: the preview signs them in as the demo punter.
 */

async function webRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('X-SwiftBets-Csrf', '1');
  }
  const response = await fetch(`/api${path}`, { ...init, headers, credentials: 'same-origin' });
  if (!response.ok) {
    throw new ApiError(response.status, await readEnvelope(response));
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

async function readEnvelope(response: Response): Promise<ErrorEnvelopeShape | undefined> {
  if (!response.headers.get('Content-Type')?.includes('application/problem+json')) {
    return undefined;
  }
  try {
    return (await response.json()) as ErrorEnvelopeShape;
  } catch {
    return undefined;
  }
}

async function nativeDemoSignIn(): Promise<boolean> {
  const response = await fetch(`${apiOrigin}/api/session/demo/token?as=punter`, { method: 'POST', headers: { 'X-SwiftBets-Csrf': '1', Accept: 'application/json' } });
  if (!response.ok) {
    return false;
  }
  const body = (await response.json()) as { accessToken: string; refreshToken: string };
  await tokenStore.save(body);
  return true;
}

const nativeClient = createApiClient({
  baseUrl: `${apiOrigin}/api`,
  getAccessToken: () => tokenStore.getAccessToken(),
  refresh: async () => {
    const refreshToken = await tokenStore.getRefreshToken();
    if (refreshToken) {
      const response = await fetch(`${apiOrigin}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (response.ok) {
        await tokenStore.save((await response.json()) as { accessToken: string; refreshToken: string });
        return true;
      }
    }
    // Refresh tokens expire; the demo seat is always available again.
    return nativeDemoSignIn();
  },
  onSessionExpired: () => void tokenStore.clear(),
});

export function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  return isWeb ? webRequest<T>(path, init) : nativeClient<T>(path, init);
}

interface SessionInfo {
  subject: string;
  roles: string[];
}

/** Makes sure the visitor holds a punter session; signs them in as the demo punter when they do not. */
export async function ensurePunterSession(): Promise<void> {
  if (isWeb) {
    try {
      const session = await webRequest<SessionInfo>('/session');
      if (session.roles.includes('Punter')) {
        return;
      }
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }
    await webRequest('/session/demo?as=punter', { method: 'POST' });
    return;
  }

  if (!(await tokenStore.getAccessToken()) && !(await nativeDemoSignIn())) {
    throw new Error('Could not start a session.');
  }
}

export async function accessTokenForHub(): Promise<string> {
  return (await tokenStore.getAccessToken()) ?? '';
}
