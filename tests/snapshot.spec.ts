import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

test('visual regression for index.html', async ({ page }) => {
  // Mock the date to ensure the "Back at" time is consistent for snapshots
  await page.clock.install({ time: new Date('2023-08-22T20:00:00.000Z') });

  await page.goto('/index.html?autostart=false');
  await page.evaluate(() => document.fonts.ready); // Wait for fonts to load

  await expect(page).toHaveScreenshot('index.html.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixels: 10,
    timeout: 10_000
  });
});
