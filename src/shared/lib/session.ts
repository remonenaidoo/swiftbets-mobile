import { apiOrigin, isWeb, nativeUserAgent } from './config';
import { createApiClient, readBody } from './createApiClient';
import { ApiError, type ErrorEnvelopeShape } from './apiError';
import { tokenStore } from './tokenStore';

/**
 * One API entry point for both shapes of the app.
 * - Web: the gateway's HttpOnly session cookie, plus the CSRF header on every mutation.
 * - Native: bearer tokens in the platform keystore with a single-flight refresh.
 * On an open preview the gateway's demo seat signs visitors in; everywhere else they sign in with their account.
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
  return readBody<T>(response);
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
  const response = await fetch(`${apiOrigin}/api/session/demo/token?as=punter`, {
    method: 'POST',
    headers: { 'X-SwiftBets-Csrf': '1', Accept: 'application/json', 'User-Agent': nativeUserAgent },
  });
  if (!response.ok) {
    return false;
  }
  const body = (await response.json()) as { accessToken: string; refreshToken: string };
  await tokenStore.save(body);
  return true;
}

// Refresh tokens are single-use: a refresh and a handoff must never spend the same one, so they take turns.
let tokenTurn: Promise<unknown> = Promise.resolve();
function withRefreshToken<T>(work: (refreshToken: string | null) => Promise<T>): Promise<T> {
  const turn = tokenTurn.then(async () => work(await tokenStore.getRefreshToken()));
  tokenTurn = turn.catch(() => undefined);
  return turn;
}

const nativeClient = createApiClient({
  baseUrl: `${apiOrigin}/api`,
  defaultHeaders: { 'User-Agent': nativeUserAgent },
  getAccessToken: () => tokenStore.getAccessToken(),
  refresh: () => withRefreshToken(async (refreshToken) => {
    if (refreshToken) {
      const response = await fetch(`${apiOrigin}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': nativeUserAgent },
        body: JSON.stringify({ refreshToken }),
      });
      if (response.ok) {
        await tokenStore.save((await response.json()) as { accessToken: string; refreshToken: string });
        return true;
      }
    }
    // Refresh tokens expire; the demo seat is always available again.
    return nativeDemoSignIn();
  }),
  onSessionExpired: () => void tokenStore.clear(),
});

/**
 * A one-minute link that opens a hosted account page signed in, for the app's in-app browser. The app keeps its own
 * sign-in (rotated here) and the browser becomes a separate device. Null when the app is not signed in.
 */
export function accountHandoffUrl(next: string): Promise<string | null> {
  return withRefreshToken(async (refreshToken) => {
    if (!refreshToken) return null;
    const response = await fetch(`${apiOrigin}/api/session/handoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-SwiftBets-Csrf': '1', 'User-Agent': nativeUserAgent },
      body: JSON.stringify({ refreshToken, next }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { accessToken: string; refreshToken: string; url: string };
    await tokenStore.save(body);
    return `${apiOrigin}${body.url}`;
  });
}

export function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  return isWeb ? webRequest<T>(path, init) : nativeClient<T>(path, init);
}

interface SessionInfo {
  subject: string;
  roles: string[];
}

export interface Session {
  signedIn: boolean;
  subject: string | null;
  roles: string[];
}

const signedOut: Session = { signedIn: false, subject: null, roles: [] };

/**
 * The visitor's session. On an open preview the gateway offers a demo seat and the visitor is signed into it; everywhere
 * else a visitor browses signed out until they sign in.
 */
export async function loadSession(): Promise<Session> {
  if (isWeb) {
    try {
      const session = await webRequest<SessionInfo>('/session');
      return { signedIn: true, subject: session.subject, roles: session.roles };
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }
    try {
      await webRequest('/session/demo?as=punter', { method: 'POST' });
      const session = await webRequest<SessionInfo>('/session');
      return { signedIn: true, subject: session.subject, roles: session.roles };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return signedOut;
      }
      throw error;
    }
  }

  if ((await tokenStore.getAccessToken()) || (await nativeDemoSignIn())) {
    return { signedIn: true, subject: null, roles: ['Punter'] };
  }
  return signedOut;
}

/** Signs in with an email (or a pre-email username) and password. Throws ApiError with the reason when refused. */
export async function signIn(login: string, password: string): Promise<void> {
  if (isWeb) {
    await webRequest('/session/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: login, password }) });
    return;
  }
  const response = await fetch(`${apiOrigin}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': nativeUserAgent },
    body: JSON.stringify({ grantType: 'password', username: login, password }),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await readEnvelope(response));
  }
  await tokenStore.save((await response.json()) as { accessToken: string; refreshToken: string });
}

/** Ends this device's session; identity stops honouring its refresh token. */
export async function signOut(): Promise<void> {
  if (isWeb) {
    await webRequest('/session/logout', { method: 'POST' });
    return;
  }
  const refreshToken = await tokenStore.getRefreshToken();
  await tokenStore.clear();
  if (refreshToken) {
    await fetch(`${apiOrigin}/api/auth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': nativeUserAgent },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
}

export async function accessTokenForHub(): Promise<string> {
  return (await tokenStore.getAccessToken()) ?? '';
}
