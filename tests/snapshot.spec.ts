import { test, expect } from '@playwright/test';

test('visual regression for index.html', async ({ page }) => {
  await page.goto('/index.html?autostart=false');
  await page.evaluate(() => document.fonts.ready); // Wait for fonts to load

  await expect(page).toHaveScreenshot('index.html.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixels: 100,
    timeout: 10_000
  });
});
