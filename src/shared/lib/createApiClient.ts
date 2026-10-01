import { ApiError, type ErrorEnvelopeShape } from './apiError';

export interface ApiClientDependencies {
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
  /** Exchanges the stored refresh token; resolves false when the session is gone. */
  refresh: () => Promise<boolean>;
  onSessionExpired: () => void;
  /** Sent on every request, e.g. a user agent the edge firewall accepts. */
  defaultHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
}

/**
 * Bearer-token client with a single-flight refresh: refresh tokens are single-use, so concurrent 401s must share
 * one refresh instead of each burning (and invalidating) the token.
 */
export function createApiClient(dependencies: ApiClientDependencies) {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  let refreshInFlight: Promise<boolean> | null = null;

  function refreshOnce(): Promise<boolean> {
    refreshInFlight ??= dependencies.refresh().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  }

  async function send(path: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    for (const [name, value] of Object.entries(dependencies.defaultHeaders ?? {})) {
      headers.set(name, value);
    }
    const token = await dependencies.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetchImpl(`${dependencies.baseUrl}${path}`, { ...init, headers });
  }

  return async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response = await send(path, init);
    if (response.status === 401) {
      if (await refreshOnce()) {
        response = await send(path, init);
      } else {
        dependencies.onSessionExpired();
      }
    }

    if (!response.ok) {
      const envelope = response.headers.get('Content-Type')?.includes('application/problem+json')
        ? ((await response.json()) as ErrorEnvelopeShape)
        : undefined;
      throw new ApiError(response.status, envelope);
    }

    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  };
}
