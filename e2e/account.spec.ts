import { expect, test } from '@playwright/test';
import { mockGateway, problem } from './gateway';

test('an adult registers and is told to check their email', async ({ page }) => {
  const gateway = await mockGateway(page);
  gateway.respond('POST', '/auth/register', 202, { message: 'accepted' });
  await page.goto('/account/register');

  await page.getByLabel('Email').fill('new.punter@example.com');
  await page.getByLabel(/^Password/).fill('correct horse battery');
  await page.getByLabel(/^Date of birth/).fill('1990-04-23');
  await page.getByRole('radio', { name: 'USD' }).click();
  await page.getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Open account' }).click();

  await expect(page.getByText('Check your email')).toBeVisible();
  const sent = gateway.requests.find((r) => r.path === '/auth/register');
  expect(sent?.body).toEqual({ email: 'new.punter@example.com', password: 'correct horse battery', dateOfBirth: '1990-04-23', country: 'ZA', currency: 'USD' });
});

test('an underage visitor is stopped before anything is sent', async ({ page }) => {
  const gateway = await mockGateway(page);
  await page.goto('/account/register');
  const seventeen = new Date();
  seventeen.setFullYear(seventeen.getFullYear() - 17);

  await page.getByLabel('Email').fill('young@example.com');
  await page.getByLabel(/^Password/).fill('correct horse battery');
  await page.getByLabel(/^Date of birth/).fill(seventeen.toISOString().slice(0, 10));
  await page.getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Open account' }).click();

  await expect(page.getByText(/18 or older/).first()).toBeVisible();
  expect(gateway.requests.some((r) => r.path === '/auth/register')).toBe(false);
});

test('a wrong password shows the reason and a right one signs in', async ({ page }) => {
  const gateway = await mockGateway(page);
  gateway.respond('POST', '/session/login', 401, problem(401, 'invalid_credentials', 'Invalid credentials'));
  await page.goto('/account/sign-in');

  await page.getByLabel('Email').fill('punter@example.com');
  await page.getByLabel('Password').fill('wrong password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Email or password is incorrect.')).toBeVisible();

  gateway.respond('POST', '/session/login', 204);
  gateway.respond('GET', '/session', 200, { subject: '10000000-0000-0000-0000-000000000001', roles: ['Punter'] });
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(gateway.requests.filter((r) => r.path === '/session/login').at(-1)?.body).toEqual({ username: 'punter@example.com', password: 'wrong password' });
});

test('a reset request gives the same answer whether or not the account exists', async ({ page }) => {
  const gateway = await mockGateway(page);
  gateway.respond('POST', '/auth/password-reset', 202);
  await page.goto('/account/forgot-password');

  await page.getByLabel('Email').fill('anyone@example.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();

  await expect(page.getByText('If anyone@example.com has an account, a reset link is on its way.', { exact: false })).toBeVisible();
});

test('an emailed verification link confirms the address', async ({ page }) => {
  const gateway = await mockGateway(page);
  gateway.respond('POST', '/auth/verify-email', 204);
  await page.goto('/account/verify?token=tok_123');

  await expect(page.getByText('Your email address is confirmed.')).toBeVisible();
  expect(gateway.requests.find((r) => r.path === '/auth/verify-email')?.body).toEqual({ token: 'tok_123' });
});

test('a spent reset link explains what to do', async ({ page }) => {
  const gateway = await mockGateway(page);
  gateway.respond('POST', '/auth/password-reset/confirm', 400, problem(400, 'token_invalid', 'Token invalid'));
  await page.goto('/account/reset-password?token=old');

  await page.getByLabel(/^New password/).fill('another long password');
  await page.getByRole('button', { name: 'Change password' }).click();

  await expect(page.getByText('This link has expired or was already used. Request a new one.')).toBeVisible();
});
