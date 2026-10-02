import { expect, test, type Page } from '@playwright/test';
import { mockGateway, type Gateway } from './gateway';

const kickoff = new Date(Date.now() + 3 * 60 * 60_000).toISOString();
const fixture = {
  fixtureId: 'fx-1',
  competition: 'Premier League',
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  kickoffAt: kickoff,
  status: 'scheduled',
  offerVersion: 3,
  markets: [
    { marketId: 'fx-1-1x2', type: 'matchResult', status: 'open', selections: [{ selectionId: 'home', name: 'Arsenal', odds: 2.1 }, { selectionId: 'draw', name: 'Draw', odds: 3.4 }, { selectionId: 'away', name: 'Chelsea', odds: 3.6 }] },
    { marketId: 'fx-1-ou25', type: 'totalGoalsOverUnder25', status: 'open', selections: [{ selectionId: 'over', name: 'Over 2.5', odds: 1.9 }, { selectionId: 'under', name: 'Under 2.5', odds: 1.85 }] },
  ],
};
const openCoupon = {
  couponId: '0199aaaa-0000-7000-8000-000000000001', status: 'open', betType: 'single', stake: 1_000, currency: 'ZAR', totalOdds: 2.1, potentialPayout: 2_100,
  legs: [{ legId: 'l1', fixtureId: 'fx-1', marketId: 'fx-1-1x2', selectionId: 'home', odds: 2.1 }], placedAt: kickoff, settlementVersion: 0, payout: null, paidToDate: 0, updatedAt: kickoff,
};

async function signedIn(page: Page): Promise<Gateway> {
  const gateway = await mockGateway(page);
  gateway.respond('GET', '/session', 200, { subject: 'p1', roles: ['Punter'] });
  gateway.respond('GET', '/fixtures/', 200, [fixture]);
  gateway.respond('GET', '/fixtures/fx-1', 200, fixture);
  gateway.respond('GET', '/catalog/sports', 200, [{ sportId: 'soccer', name: 'Soccer', competitions: [{ competitionId: 'premier-league', name: 'Premier League', upcomingFixtures: 1 }] }]);
  gateway.respond('GET', '/me/balance', 200, { available: { minorUnits: 50_000, currency: 'ZAR' } });
  gateway.respond('GET', '/me/coupons', 200, [openCoupon]);
  return gateway;
}

test('home leads with live football, the next matches and an honest casino shelf', async ({ page }) => {
  await signedIn(page);
  await page.goto('/');

  await expect(page.getByText('Next up')).toBeVisible();
  await expect(page.getByLabel('Arsenal v Chelsea', { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('Sun Temple, coming soon')).toBeVisible();
  await page.screenshot({ path: `test-results/home-${test.info().project.name}.png`, fullPage: true });
});

test('the home ticker shows real recent wins with masked accounts', async ({ page }) => {
  const gateway = await signedIn(page);
  gateway.respond('GET', '/recent-wins', 200, [{ couponId: 'w1', account: '****a1b2', betType: 'accumulator', payout: { minorUnits: 21_000, currency: 'ZAR' }, paidAt: kickoff }]);
  await page.goto('/');

  await expect(page.getByLabel('Recent wins')).toBeVisible();
  await expect(page.getByText('****a1b2 · Accumulator')).toBeVisible();
});

for (const path of ['/sports/soccer', '/fixtures/fx-1', '/casino', '/menu', '/promotions', '/my-bets']) {
  test(`${path} renders for a screenshot`, async ({ page }) => {
    await signedIn(page);
    await page.goto(path);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `test-results/screen${path.replace(/\//g, '-')}-${test.info().project.name}.png`, fullPage: true });
  });
}

test('a pick survives a reload', async ({ page }) => {
  await signedIn(page);
  await page.goto('/sports/soccer');
  await page.getByRole('button', { name: 'Arsenal at 2.10' }).first().click();

  await page.reload();

  // The sidebar (desktop) or the dock (phone) still carries the pick.
  const slip = test.info().project.name === 'phone' ? page.getByLabel('Open betslip, 1 selections') : page.getByText('Match result · Arsenal v Chelsea');
  await expect(slip.first()).toBeVisible();
});

test('a cashout whose price moved shows the new offer instead of failing', async ({ page }) => {
  const gateway = await signedIn(page);
  const expiresAt = new Date(Date.now() + 10_000).toISOString();
  gateway.respond('POST', '/cashout/quote', 200, { couponId: openCoupon.couponId, amount: 1_800, currency: 'ZAR', expiresAt, quoteToken: 'q1' });
  gateway.respond('POST', '/cashout/execute', 409, {
    status: 409, code: 'price_changed', title: 'Conflict', correlationId: 'e2e',
    freshQuote: { couponId: openCoupon.couponId, amount: 1_650, currency: 'ZAR', expiresAt: new Date(Date.now() + 10_000).toISOString(), quoteToken: 'q2' },
  });
  await page.goto('/my-bets');

  await page.getByRole('button', { name: 'Cash out', exact: true }).click();
  await page.getByRole('button', { name: /Cash out R\s?18\.00/ }).click();

  await expect(page.getByText('The price moved. Here is the new offer.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Cash out R\s?16\.50/ })).toBeVisible();
  await page.screenshot({ path: `test-results/cashout-${test.info().project.name}.png`, fullPage: true });
});
