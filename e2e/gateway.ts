import type { Page, Request } from '@playwright/test';

/** A stand-in for the gateway: signed out, no demo seat, and account endpoints the test can script. */
export interface Gateway {
  requests: { method: string; path: string; body: unknown }[];
  respond(method: string, path: string, status: number, body?: unknown): void;
}

const problem = (status: number, code: string, title: string) => ({ status, code, title, correlationId: 'e2e' });

export async function mockGateway(page: Page): Promise<Gateway> {
  const scripted = new Map<string, { status: number; body?: unknown }>();
  const gateway: Gateway = {
    requests: [],
    respond: (method, path, status, body) => scripted.set(`${method} ${path}`, { status, body }),
  };
  await page.route('**/api/**', async (route) => {
    const request: Request = route.request();
    const path = new URL(request.url()).pathname.replace(/^\/api/, '');
    const method = request.method();
    gateway.requests.push({ method, path, body: request.postDataJSON() as unknown });
    const reply = scripted.get(`${method} ${path}`);
    if (reply) {
      const isProblem = reply.status >= 400;
      await route.fulfill({
        status: reply.status,
        contentType: isProblem ? 'application/problem+json' : 'application/json',
        body: reply.body === undefined ? '' : JSON.stringify(reply.body),
      });
      return;
    }
    if (path === '/session') {
      await route.fulfill({ status: 401, contentType: 'application/problem+json', body: JSON.stringify(problem(401, 'unauthenticated', 'Sign in')) });
      return;
    }
    await route.fulfill({ status: 404, contentType: 'application/problem+json', body: JSON.stringify(problem(404, 'not_found', 'Not found')) });
  });
  await page.route('**/hubs/**', (route) => route.abort());
  return gateway;
}

export { problem };
