import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mockGateway } from './gateway';

const pages = ['/account/sign-in', '/account/register', '/account/forgot-password', '/account/reset-password?token=t', '/account/verify'];

for (const path of pages) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await mockGateway(page);
    await page.goto(path);
    await page.getByRole('heading').first().waitFor();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
